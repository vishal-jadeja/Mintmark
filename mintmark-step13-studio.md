# Mintmark — Step 13: Content Studio

## Overview

Step 13 builds `/studio` — the page users open when they decide to share what
they have been learning. Input a topic or paste what you know. Mintmark
generates drafts for your active platforms only. Edit inline, schedule or
publish directly.

This step also introduces the BYOK AI adapter (`src/lib/ai/byok.ts`) — the
shared abstraction over Anthropic, OpenAI, Gemini, and Groq. Every AI feature
from this step forward uses it.

```
Phase 13.1  →  DB schema (content_inputs, generated_content)     ⬜
Phase 13.2  →  Types update (database.ts)                        ⬜
Phase 13.3  →  BYOK AI adapter (src/lib/ai/byok.ts)              ⬜
Phase 13.4  →  Content generation Trigger.dev tasks              ⬜
Phase 13.5  →  API routes (generate, drafts, publish, schedule)  ⬜
Phase 13.6  →  Query hooks + Zustand store                       ⬜
Phase 13.7  →  Studio page + components                          ⬜
Phase 13.8  →  Proxy protection                                  ⬜
```

---

## Architecture

```
/studio (server component — auth check, load user settings)
  └── StudioClient (client)
        ├── StudioInput
        │     ├── Textarea (topic/text input)
        │     ├── PlatformSelector (shows active platforms only)
        │     └── Generate button
        ├── GenerationStatus (polling state, skeleton shimmer)
        └── DraftGrid (one DraftCard per generated platform)
              └── DraftCard
                    ├── Platform header + char count
                    ├── Inline textarea (editable)
                    └── PublishControls (schedule | publish)
```

State flow:
```
User submits input
  → POST /api/studio/generate → creates content_inputs row, triggers Trigger.dev task
  → studioStore.currentInputId = inputId, status = "pending"
  → useGenerationStatus polls GET /api/studio/generate/[inputId]/status
     (refetchInterval: 2000 while status is pending/running)
  → task completes → status = "complete" → invalidate useDrafts query
  → DraftCards render with real content
  → user edits → PATCH /api/studio/drafts/[id]
  → user publishes → POST /api/studio/publish/[id]
  → user schedules → POST /api/studio/schedule/[id] + { scheduled_at }
```

---

## Phase 13.1 — DB Schema

File: `supabase/phase13_schema.sql`

```sql
-- Content inputs (one row per user submit action)
create table if not exists content_inputs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  raw_text    text not null,
  source_type text not null default 'manual',
  -- source_type: 'manual' | 'note' | 'session' | 'intelligence_card'
  created_at  timestamptz not null default now()
);

create index on content_inputs (user_id, created_at desc);

alter table content_inputs enable row level security;
create policy "users manage own content_inputs"
  on content_inputs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Generated content (one row per platform per input)
create table if not exists generated_content (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  input_id       uuid not null references content_inputs(id) on delete cascade,
  platform       text not null,
  -- platform: 'linkedin' | 'x' | 'medium'
  content_text   text not null default '',
  status         text not null default 'draft',
  -- status: 'generating' | 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_at   timestamptz,
  published_at   timestamptz,
  post_url       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index on generated_content (user_id, created_at desc);
create index on generated_content (user_id, status);
create index on generated_content (input_id);

alter table generated_content enable row level security;
create policy "users manage own generated_content"
  on generated_content for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Generation job tracking (maps content_input → Trigger.dev run)
create table if not exists generation_jobs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  input_id    uuid not null references content_inputs(id) on delete cascade,
  run_id      text,       -- Trigger.dev run ID for status polling
  status      text not null default 'pending',
  -- status: 'pending' | 'running' | 'complete' | 'failed'
  error       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index on generation_jobs (user_id, input_id);

alter table generation_jobs enable row level security;
create policy "users read own generation_jobs"
  on generation_jobs for select
  using (auth.uid() = user_id);
```

---

## Phase 13.2 — Types Update

Add `ContentInput`, `GeneratedContent`, and `GenerationJob` to
`src/types/database.ts` following the existing pattern.

---

## Phase 13.3 — BYOK AI Adapter

File: `src/lib/ai/byok.ts`

### Purpose

Single interface over Anthropic, OpenAI, Gemini, Groq.
Used by Trigger.dev tasks (server-side only — never imported in client code).
Fetches and decrypts the user's API key from `api_keys` table.
Returns `null` if no key is configured, so callers handle the no-key case
gracefully rather than throwing.

### Interface

```typescript
export type AiProvider = 'anthropic' | 'openai' | 'gemini' | 'groq'

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AiOptions {
  system?: string
  messages: AiMessage[]
  maxTokens?: number
  temperature?: number
}

export interface AiAdapter {
  provider: AiProvider
  complete(opts: AiOptions): Promise<string>
  stream(opts: AiOptions): AsyncIterable<string>
}

// Returns null if user has no key configured for any provider.
// Prefers: user's preferred provider → anthropic → openai → gemini → groq
export async function createByokAdapter(userId: string): Promise<AiAdapter | null>
```

### Implementation notes

- Use the admin Supabase client to fetch from `api_keys` WHERE user_id = userId AND is_active = true.
- Decrypt the key via the existing `src/lib/encryption.ts` `decrypt()` function.
- Provider selection: pick the first active key in priority order
  (anthropic → openai → gemini → groq).
- Model defaults per provider:
  - anthropic: `claude-sonnet-4-6`
  - openai: `gpt-4o`
  - gemini: `gemini-1.5-pro`
  - groq: `llama-3.1-70b-versatile`
- `complete()` returns the full response string.
- `stream()` returns an `AsyncIterable<string>` of text chunks.
- Never log decrypted keys. Never return keys to the caller.

---

## Phase 13.4 — Content Generation Tasks

### Task: `generate-content` (orchestrator)

File: `src/trigger/generate-content.ts`

Triggered by `POST /api/studio/generate`.
Payload: `{ userId, inputId, platforms: string[], rawText: string }`

```
1. createByokAdapter(userId) → if null, mark job failed + return
2. Fetch user's platform_instructions for each platform
3. [Research Agent] — get user's recent notes + past posts on the topic
   (simple text search for now; pgvector in Phase 2)
4. [Parallel fan-out] — one subtask per active platform:
     generatePlatformDraft({ platform, rawText, research, instructions, adapter })
5. Each subtask saves a generated_content row (status=draft)
6. Update generation_jobs row: status=complete
```

### Task: `generate-platform-draft` (per-platform)

File: `src/trigger/agents/generate-platform-draft.ts`

Payload: `{ userId, inputId, platform, rawText, research, instructions, adapter? }`

```
1. Build system prompt from platform format rules (see constants below) +
   user's platform_instructions (tone, format_rules, max_length override)
2. Call adapter.complete()
3. [Critic check] — score draft against format rules (char limit, structure)
   If passes: save as status=draft
   If fails: call adapter.complete() with critique → revised draft
   Max 2 revision loops, then save whatever we have
4. Upsert generated_content row
```

### Platform format rules constants

File: `src/lib/ai/platform-rules.ts`

```typescript
export const PLATFORM_RULES = {
  linkedin: {
    maxChars: 3000,
    structure: 'Hook in first line. Professional tone. Whitespace-friendly paragraphs.',
  },
  x: {
    maxChars: 280,
    structure: 'Punchy, hook-first. No filler. Single tweet only.',
  },
  medium: {
    maxChars: null, // unlimited
    structure: 'Deep dive. Well-structured with headers. Intro earns the scroll.',
  },
} as const

export type Platform = keyof typeof PLATFORM_RULES
```

Register both tasks in `src/trigger/index.ts`.

---

## Phase 13.5 — API Routes

### `POST /api/studio/generate`

- Auth: requireSession
- Rate limit: 10 req/min (generation is expensive)
- Body: `{ rawText: string, platforms?: string[] }`
- If `platforms` omitted: read from `user_settings.active_platforms`
- If no active platforms: return 400 "No active platforms configured"
- Creates `content_inputs` row
- Creates `generation_jobs` row (status=pending)
- Triggers `generate-content` Trigger.dev task
- Updates `generation_jobs.run_id` with Trigger.dev run ID
- Returns: `{ inputId, jobId }`

### `GET /api/studio/generate/[inputId]/status`

- Auth: requireSession, verify input belongs to user
- Returns: `{ status: 'pending' | 'running' | 'complete' | 'failed', error?: string }`
- Reads from `generation_jobs` table

### `GET /api/studio/drafts`

- Auth: requireSession
- Query params: `inputId?`, `status?`, `limit? (default 20)`, `offset? (default 0)`
- Returns: `GeneratedContent[]` ordered by created_at desc

### `PATCH /api/studio/drafts/[id]`

- Auth: requireSession, verify draft belongs to user
- Body: `{ contentText?: string }`
- Updates `content_text` and `updated_at`
- Returns: updated `GeneratedContent`

### `DELETE /api/studio/drafts/[id]`

- Auth: requireSession, verify draft belongs to user
- Hard delete

### `POST /api/studio/publish/[id]`

- Auth: requireSession
- Reads draft + user's platform connection token
- If no connection: return 400 with message
- Calls platform API to publish
- On success: update status=published, published_at, post_url
- Returns: `{ postUrl }`

### `POST /api/studio/schedule/[id]`

- Auth: requireSession
- Body: `{ scheduledAt: string }` (ISO 8601)
- Validates scheduledAt is in the future
- Updates status=scheduled, scheduled_at
- Returns: updated draft

---

## Phase 13.6 — Query Hooks + Zustand Store

### `src/lib/queries/studio.ts`

```typescript
useGenerateDrafts()          // mutation: POST /api/studio/generate
useGenerationStatus(inputId) // query: GET /api/studio/generate/[inputId]/status
                             // refetchInterval: 2000 when status is pending/running
useStudioDrafts(params?)     // query: GET /api/studio/drafts
useUpdateDraft()             // mutation: PATCH /api/studio/drafts/[id]
useDeleteDraft()             // mutation: DELETE /api/studio/drafts/[id]
usePublishDraft()            // mutation: POST /api/studio/publish/[id]
useScheduleDraft()           // mutation: POST /api/studio/schedule/[id]
```

### `src/stores/studioStore.ts`

```typescript
interface StudioState {
  currentInputId: string | null
  generationStatus: 'idle' | 'pending' | 'running' | 'complete' | 'failed'
  selectedPlatforms: string[]      // overrides for this session
  setCurrentInput(inputId: string): void
  setGenerationStatus(status: StudioState['generationStatus']): void
  setSelectedPlatforms(platforms: string[]): void
  reset(): void
}
```

---

## Phase 13.7 — Studio Page + Components

### `src/app/(app)/studio/page.tsx`

Server component. Auth check via `requireSession`. Loads user settings
(active_platforms) server-side. Passes to `StudioClient`.

### `src/components/studio/StudioClient.tsx`

Client component. Owns the main layout. Reads `studioStore`.
Conditionally renders `GenerationStatus` or `DraftGrid` based on store state.

### `src/components/studio/StudioInput.tsx`

- Textarea: "What have you been learning? Describe a topic or paste your notes."
- PlatformSelector: checkboxes for active platforms (pre-checked from settings,
  user can uncheck for this session)
- Generate button: disabled if textarea empty or no platform selected
- On submit: calls `useGenerateDrafts`, sets `studioStore.currentInputId`

### `src/components/studio/GenerationStatus.tsx`

Shown while `generationStatus` is pending or running.
- Skeleton shimmer for each selected platform (matches DraftCard dimensions)
- Status text: "Researching your notes..." → "Drafting for LinkedIn..." etc.
- Uses `useGenerationStatus` with auto-polling

### `src/components/studio/DraftCard.tsx`

Props: `draft: GeneratedContent`
- Platform icon + label header
- Character count chip (color: green/amber/red based on limit proximity)
- Editable textarea (controlled, debounced PATCH on blur)
- PublishControls at the bottom

### `src/components/studio/PublishControls.tsx`

Props: `draft: GeneratedContent, onPublish, onSchedule`
- "Publish now" button → `usePublishDraft`
- "Schedule" button → opens a date+time picker → `useScheduleDraft`
- If platform not connected: show "Connect [platform] in Settings" chip

### Character count rules (enforced in DraftCard)

```
LinkedIn: green ≤ 2400, amber 2401–3000, red > 3000
X:        green ≤ 240,  amber 241–280,   red > 280
Medium:   always green (no limit)
```

### Animations

- `GenerationStatus` skeleton: `animate={{ opacity: [0.4, 0.8, 0.4] }}` loop
- `DraftCard` entrance: stagger fade + slide-up (same pattern as dashboard cards)
- `PublishControls` buttons: `whileHover` scale + `whileTap` scale
- `DraftGrid`: `AnimatePresence` wrap so cards animate out on delete

---

## Phase 13.8 — Proxy Protection

Add to `src/proxy.ts` protected routes:

```
/studio            → requireSession
/api/studio(.*)    → requireSession
```

---

## Empty States

**No active platforms configured**
"You haven't selected any platforms yet. Choose which ones you post on in
[Settings → Publishing]." Link to /settings.

**No API key configured**
"Add your API key in [Settings → API Keys] to start generating content."
Link to /settings.

**After generation completes with no drafts (task failed)**
"Generation failed. This usually means your API key has run out of credits.
Check your key in [Settings → API Keys]."

---

## Key rules (carry into implementation)

- Never generate for a platform not in `user_settings.active_platforms` unless
  user explicitly overrides for this session.
- Rate limit generation: 10 req/min — generation hits the user's BYOK key and
  is expensive. Enforce server-side.
- Character count chip updates live as user types in DraftCard textarea.
- Publish button disabled if draft text is empty.
- Schedule date must be in the future — validate both client and server.
- `useGenerationStatus` polling stops automatically when status reaches
  `complete` or `failed` (set `refetchInterval` to `false` at that point).
