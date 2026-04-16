# Mintmark — Step 8: Onboarding Intelligence Guide

## Overview

Step 8 is the first step of the main app. It solves the **time-to-value problem**:
a new user must never open Mintmark and see a blank screen. Onboarding seeds the
system with enough real data that the dashboard is meaningful from day one —
the AI has context, the heatmap is not blank, and the user immediately sees
Mintmark doing what it promises.

This guide breaks Step 8 into 8 discrete phases. Each phase is atomic — it can be
built, tested, and committed independently. Complete them in order; each one is a
prerequisite for the next.

```
Phase 8.1  →  Database schema extension                  ✅ DONE
Phase 8.2  →  Routing, middleware, and onboarding shell  ✅ DONE
Phase 8.3  →  OAuth platform connections                 ⬜ TODO
Phase 8.4  →  GitHub backfill (Trigger.dev)              ⬜ TODO
Phase 8.5  →  Active platforms + AI instructions         ⬜ TODO
Phase 8.6  →  First manual session log                   ⬜ TODO
Phase 8.7  →  BYOK API key (optional step)               ⬜ TODO
Phase 8.8  →  Dashboard scaffold + heatmap + empty state ⬜ TODO
```

---

## Onboarding Philosophy

Mintmark is an intelligence layer — it must have context to be useful.
Onboarding is the process of giving it that context as fast as possible.

The four onboarding steps are ordered by intelligence value, not by complexity:

1. **Platform connections** — connects the observation layer (GitHub, Gmail).
   These are passive sources that will feed the system forever. Connecting
   GitHub immediately backfills 90 days of real data — the heatmap is
   populated before the user finishes onboarding.

2. **Active platforms** — defines the output layer (LinkedIn, X, Medium).
   This is separate from connections. A user can observe everything and post
   nowhere. The two concepts must never be conflated in the UI or the code.

3. **First session log** — gives the AI the most valuable signal it can
   receive at onboarding: what the user is actively learning right now,
   in their own words. This seeds topic_nodes and unified_activity
   immediately.

4. **BYOK key** — optional. The AI assistant and content studio need this.
   The observation layer and heatmap work without it. Skip must be obvious.

---

## Current DB State (what exists after Phase 8.1 + 8.2)

```
users                    id, email, name, avatar, created_at
user_settings            user_id, theme, active_platforms, timezone,
                         onboarding_completed, onboarding_step, created_at
api_keys                 user_id, provider, encrypted_key, is_active
platform_connections     user_id, platform, access_token, refresh_token,
                         token_expires_at, profile_data, is_active
platform_instructions    user_id, platform, instruction_text, tone,
                         format_rules, updated_at
unified_activity         user_id, activity_date, source, activity_count,
                         intensity, metadata
topic_nodes              user_id, topic, post_count, note_count,
                         session_count, last_activity_at
waitlist                 full early-access schema
invite_tokens            full early-access schema
system_config            key-value runtime config
```

---

## Phase 8.1 — Database Schema Extension ✅ DONE

All tables created. RLS policies applied. Indexes in place.
See `supabase/phase8_schema.sql` for the full migration.

Key tables added:

- `api_keys` — BYOK provider keys, AES-256-GCM encrypted
- `platform_connections` — OAuth tokens for all connected platforms, encrypted
- `platform_instructions` — per-platform AI tone and format rules
- `unified_activity` — single source of truth, (user_id, activity_date, source) unique
- `topic_nodes` — knowledge graph seed, built up over time

Note: `platform_connections.platform` accepts:
`github | gmail | linkedin | x | medium | leetcode | codeforces | notion | readwise`

Gmail is an observation source (readonly, surfaces to dashboard).
LinkedIn / X / Medium are publishing platforms (active_platforms).
These are different lists in different columns. Never mix them.

---

## Phase 8.2 — Routing, Middleware, and Onboarding Shell ✅ DONE

Completed:

- Middleware: new users redirected to `/onboarding`, existing users to `/dashboard`
- `/onboarding` layout + page (server component reads current `onboarding_step`)
- `OnboardingWizard.tsx` — renders correct step based on store state
- `OnboardingProgress.tsx` — 4-step progress indicator, Framer Motion transitions
- `onboardingStore.ts` — Zustand store tracking step, connections, platforms, byokSkipped
- `PATCH /api/user/onboarding` — updates step and completed flag
- `/dashboard/page.tsx` + `/dashboard/layout.tsx` — protected stub pages
- Onboarding step shell components (4 empty shells in `src/components/onboarding/steps/`)

---

## Phase 8.3 — OAuth Platform Connections

**Goal:** Let users connect their observation platforms (GitHub, Gmail) and
publishing platforms (LinkedIn, X, Medium) via OAuth. Store encrypted tokens.
Show connection state in Step 1 of the onboarding wizard.

GitHub and Gmail are the highest-priority connections — they feed the
intelligence layer passively. LinkedIn, X, and Medium are publishing
targets set separately in Step 2. Step 1 should make this distinction clear.

**Prerequisite:** Phase 8.1 + 8.2 complete.

### What to build

**Platform connections step** (`src/components/onboarding/steps/PlatformConnectionsStep.tsx`)

Two visual sections within the same step:

**Section 1 — "Connect your activity sources"**

- GitHub card: "We'll backfill your last 90 days of commits. Your heatmap
  will have real data before you leave onboarding."
- Gmail card: "We'll surface your newsletters and flag what's worth reading.
  Read-only — Mintmark never sends email on your behalf."
- Connect button → initiates OAuth. Connected state shows avatar + username
  - a subtle "Disconnect" option.
- At least one source connection is encouraged but not hard-required.
  Soft CTA if neither connected: "Connect at least one source so your
  dashboard isn't empty." Skip is available via text link.

**Section 2 — "Connect your publishing platforms" (collapsed by default)**

- LinkedIn, X, Medium cards
- These are for posting only — the AI generates content for these.
- Connecting here is optional at onboarding. User can connect in Settings.
- Collapsed by default with a "Also connect publishing platforms →" expander.
  This keeps the focus on observation sources, not posting.

**TanStack Query hooks** (`src/lib/queries/connections.ts`)

```typescript
useConnections(); // GET /api/connections
useDisconnect(); // DELETE /api/connections/[platform] mutation
```

**API routes**

```
GET  /api/connections
  Returns active platform_connections for authenticated user.
  Strips tokens — returns: platform, profile_data, connected_at, is_active.

DELETE /api/connections/[platform]
  Soft-delete: is_active = false, nulls both token fields.
  Auth: requireSession + Upstash rate limit.

GET  /api/connections/[platform]/callback
  OAuth callback handler per platform.
  Exchanges code for tokens → AES-256-GCM encrypt via encryption.ts
  → upsert platform_connections.
  Fetches minimal profile data from platform API → stores in profile_data jsonb.
  For GitHub: triggers Trigger.dev github-backfill task (Phase 8.4).
  For Gmail: stores gmail_connection_ready: true in profile_data (intelligence
    surfacing begins in Phase 2 — connection is made now to avoid auth friction later).
  Redirects to /onboarding on success.
```

**OAuth flow per platform**

| Platform | Flow                           | Scope                                              |
| -------- | ------------------------------ | -------------------------------------------------- |
| GitHub   | OAuth App (Authorization Code) | `read:user repo`                                   |
| Gmail    | OAuth 2.0 (Google)             | `gmail.readonly`                                   |
| LinkedIn | OAuth 2.0 PKCE                 | `openid profile email w_member_social`             |
| X        | OAuth 2.0 PKCE                 | `tweet.read tweet.write users.read offline.access` |
| Medium   | OAuth 2.0                      | `basicProfile publishPost`                         |

**Gmail note:** `gmail.readonly` is the only scope requested — ever.
Mintmark never requests write, compose, send, or modify scopes.
This is enforced at the OAuth scope level, not just at the application layer.

**Encryption** — use existing `src/lib/encryption.ts` (AES-256-GCM).
All `access_token` and `refresh_token` values encrypted at rest.
Never log tokens. Never pass tokens to the client.

### New env vars

```
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GMAIL_CLIENT_ID            # Google OAuth app
GMAIL_CLIENT_SECRET
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
X_CLIENT_ID
X_CLIENT_SECRET
MEDIUM_CLIENT_ID
MEDIUM_CLIENT_SECRET
NEXT_PUBLIC_APP_URL        # e.g. http://localhost:3000 — builds callback URLs
```

### Files to create/modify

| File                                                          | Action                            |
| ------------------------------------------------------------- | --------------------------------- |
| `src/components/onboarding/steps/PlatformConnectionsStep.tsx` | Replace shell                     |
| `src/lib/queries/connections.ts`                              | New TanStack Query hooks          |
| `src/app/api/connections/route.ts`                            | GET all connections               |
| `src/app/api/connections/[platform]/route.ts`                 | DELETE a connection               |
| `src/app/api/connections/[platform]/callback/route.ts`        | OAuth callback                    |
| `src/types/database.ts`                                       | Verify platform_connections types |

---

## Phase 8.4 — GitHub Backfill (Trigger.dev)

**Goal:** When a user connects GitHub, immediately backfill 90 days of commit
history into `unified_activity`. Non-blocking — fires as a background task and
returns instantly. User sees a "Syncing..." indicator that resolves when done.

This is the single most important thing that makes the dashboard non-empty
from day one. Treat it as critical path, not a nice-to-have.

**Prerequisite:** Phase 8.1 (unified_activity table) + Phase 8.3 (GitHub token stored).

### What to build

**Trigger.dev task** (`src/trigger/github-backfill.ts`)

```typescript
Task id: "github-backfill"
Payload: { userId: string, encryptedToken: string }

Steps:
1. Decrypt token using encryption.ts
2. GitHub API: GET /search/commits?author=@me&sort=author-date
   Paginate through last 90 days of results
3. Group commits by date → { date: string, count: number }[]
4. Compute intensity per day using GitHub thresholds (from config, not hardcoded):
   0 commits = 0, 1–3 = 1, 4–7 = 2, 8–14 = 3, 15+ = 4
5. Upsert into unified_activity:
   ON CONFLICT (user_id, activity_date, source) DO UPDATE
   SET activity_count = excluded.activity_count,
       intensity = excluded.intensity,
       updated_at = now()
   source = 'github'
6. Update platform_connections.profile_data:
   SET backfill_complete = true, synced_days = <count of days with commits>
```

**Intensity thresholds config** (`src/lib/activity-thresholds.ts`)

```typescript
// Keep thresholds in one place — referenced by backfill task and any future sources
export const INTENSITY_THRESHOLDS: Record<string, number[]> = {
  github: [0, 1, 4, 8, 15], // 0, 1–3=1, 4–7=2, 8–14=3, 15+=4
  session: [0, 1, 2, 4, 6], // minutes/sessions thresholds TBD
  linkedin: [0, 1, 2, 3, 5],
  x: [0, 1, 3, 5, 8],
};
// intensity = thresholds.findIndex(t => count < t) - 1 (clamped 0–4)
```

**Backfill status API** (`src/app/api/connections/github/backfill-status/route.ts`)

```
GET
  Auth: requireSession
  Reads platform_connections.profile_data for github
  Returns: { status: 'pending' | 'complete' | 'failed', synced_days: number }
```

**PlatformConnectionsStep update** — after GitHub connect, show a subtle
`"Syncing commits..."` chip. Poll backfill-status (max 5 retries × 3s apart).
On complete: transition chip to `"90 days synced ✓"` with a brief fade.

### New env vars

```
TRIGGER_SECRET_KEY      # from Trigger.dev dashboard
TRIGGER_API_URL         # from Trigger.dev dashboard (cloud endpoint)
```

### Files to create/modify

| File                                                          | Action                                   |
| ------------------------------------------------------------- | ---------------------------------------- |
| `src/trigger/github-backfill.ts`                              | New Trigger.dev task                     |
| `src/trigger/index.ts`                                        | Register the task (create if not exists) |
| `src/lib/activity-thresholds.ts`                              | Intensity threshold config               |
| `src/app/api/connections/github/backfill-status/route.ts`     | Status route                             |
| `src/components/onboarding/steps/PlatformConnectionsStep.tsx` | Backfill indicator                       |

---

## Phase 8.5 — Active Platforms + Per-Platform AI Instructions

**Goal:** Build Step 2 of the onboarding wizard. Let the user define which
platforms they post on (separate from which platforms they have connected).
Optionally let them define their AI voice per platform.

This step defines the output layer — which platforms content studio will
generate drafts for. It has nothing to do with observation or tracking.
The UI must make this distinction clear.

**Prerequisite:** Phase 8.1 + 8.2.

### What to build

**Active platforms step** (`src/components/onboarding/steps/ActivePlatformsStep.tsx`)

Heading: "Which platforms do you actually post on?"
Subheading: "Content Studio only generates drafts for these. You can change
this any time in Settings."

Three checkbox cards: LinkedIn, X, Medium.
Each card: platform icon, name, character limit note
(LinkedIn: up to 3000 chars · X: 280 chars · Medium: long-form articles).

At least one must be selected to enable the "Continue" button.
A "Skip — I don't post anywhere yet" text link is available below.
If skipped, active_platforms is saved as `[]` — content studio will show
a soft "select a platform in Settings to get started" prompt.

After platform selection, each selected platform expands inline to show
optional AI instruction fields:

- Tone dropdown: `professional | casual | educational | storytelling`
- Instruction textarea: "Describe your voice for this platform (optional)"
  Placeholder example: "I write like I'm teaching a junior dev. Always use
  real examples. No jargon without explanation."
- Format notes textarea: "Any format rules? (optional)"
  Placeholder example: "Always start with a hook. Use short paragraphs.
  No bullet points."
- These fields are all optional. A "Skip instructions for now" toggle
  collapses them without blocking progress.

On "Continue":

1. PATCH `/api/user/settings` with `active_platforms`
2. POST `/api/user/platform-instructions` for each configured platform
3. PATCH `/api/user/onboarding` with `step: 3`

**TanStack Query hooks** (`src/lib/queries/settings.ts`)

```typescript
useUserSettings(); // GET /api/user/settings
useUpdateActivePlatforms(); // PATCH mutation
usePlatformInstructions(); // GET /api/user/platform-instructions
useUpsertPlatformInstruction(); // POST mutation (upserts per platform)
```

**API routes**

```
GET   /api/user/settings
  Returns user_settings for authenticated user (no sensitive fields).

PATCH /api/user/settings
  Body: Partial<{ active_platforms: string[], timezone: string, theme: string }>
  Auth: requireSession
  Rate limit: Upstash 100/min per user
  DB: UPDATE user_settings where user_id = session.user.id

GET   /api/user/platform-instructions
  Returns all platform_instructions rows for authenticated user.

POST  /api/user/platform-instructions
  Body: { platform: string, instruction_text?: string, tone?: string, format_rules?: string }
  Auth: requireSession
  DB: UPSERT ON CONFLICT (user_id, platform) DO UPDATE
```

### Files to create/modify

| File                                                      | Action        |
| --------------------------------------------------------- | ------------- |
| `src/components/onboarding/steps/ActivePlatformsStep.tsx` | Replace shell |
| `src/lib/queries/settings.ts`                             | New hooks     |
| `src/app/api/user/settings/route.ts`                      | GET + PATCH   |
| `src/app/api/user/platform-instructions/route.ts`         | GET + POST    |

---

## Phase 8.6 — First Manual Session Log

**Goal:** Step 3 of onboarding — guide the user to log what they have been
learning or working on. This is the highest-signal context the AI receives
at onboarding: the user's own words about what they are studying right now.

A session log seeds `unified_activity` immediately (dashboard calendar shows
a dot for today) and creates the first `topic_nodes` entry, which the AI
assistant will use from the moment the user opens it.

Frame this as intelligence input, not time tracking.
The user is not clocking hours — they are teaching Mintmark what they know.

**Prerequisite:** Phase 8.1 + 8.2.

### What to build

**First session step** (`src/components/onboarding/steps/FirstSessionStep.tsx`)

Heading: "What have you been learning lately?"
Subheading: "This gives the AI context about what you're working on. It shows
up on your calendar right now."

Fields:

- Topic (text input, required, max 120 chars)
  Placeholder: "e.g. System design, React Server Components, TypeScript generics"
- How long (number input + unit selector: minutes / hours, required)
- Notes (optional textarea)
  Placeholder: "Anything you want to remember about this session?"
  Label: "Notes (optional) — these go straight to your notes, not just the log"
  If notes are entered, also create a `notes` table row (stub for Phase 2 —
  save the text to `unified_activity.metadata.session_notes` for now if
  notes table does not exist yet, and migrate when the notes page ships).

"Log Session" button → POST `/api/activity/session`

On success:

- Brief inline confirmation: "Added to your calendar ✓"
- Auto-advance to Step 4 after 1.5 seconds

"Skip — I'll log later" text link (advances to Step 4 without logging).

**API route** (`src/app/api/activity/session/route.ts`)

```
POST
  Body: { topic: string, duration_minutes: number, notes?: string }
  Auth: requireSession
  Rate limit: Upstash 100/min per user
  Validation: topic required, max 120 chars; duration_minutes required, > 0

  Steps:
  1. Compute intensity for sessions:
     duration_minutes < 15 = 1, 15–30 = 1, 31–60 = 2, 61–120 = 3, 120+ = 4
     (use INTENSITY_THRESHOLDS config from Phase 8.4)

  2. Upsert into unified_activity:
     { user_id, activity_date: today, source: 'session',
       activity_count: 1, intensity: computed,
       metadata: { topic, duration_minutes, notes } }
     ON CONFLICT (user_id, activity_date, source) DO UPDATE
     SET activity_count = activity_count + 1,
         metadata = metadata || excluded.metadata,
         updated_at = now()

  3. Upsert into topic_nodes:
     topic = topic.trim().toLowerCase()
     ON CONFLICT (user_id, topic) DO UPDATE
     SET session_count = session_count + 1,
         last_activity_at = now()

  4. PATCH /api/user/onboarding with { step: 4 }

  Returns: { success: true, activityId: string }
```

**TanStack Query hook** (add to `src/lib/queries/activity.ts`)

```typescript
useLogSession(); // POST mutation → /api/activity/session
// On success: invalidateQueries(['dashboard-activity'])
```

### Files to create/modify

| File                                                   | Action                              |
| ------------------------------------------------------ | ----------------------------------- |
| `src/components/onboarding/steps/FirstSessionStep.tsx` | Replace shell                       |
| `src/lib/queries/activity.ts`                          | New file with session mutation hook |
| `src/app/api/activity/session/route.ts`                | New POST route                      |

---

## Phase 8.7 — BYOK API Key (Optional Step)

**Goal:** Step 4 of onboarding — let the user optionally add their AI API key.
The observation layer (heatmap, calendar, topic tracking) works without it.
The AI assistant and content studio require it. Skip must be obvious and
must not feel like failure — the user is getting value without it.

**Prerequisite:** Phase 8.1 + 8.2 + existing `src/lib/encryption.ts`.

### What to build

**BYOK key step** (`src/components/onboarding/steps/ByokKeyStep.tsx`)

Heading: "Add your AI API key (optional)"
Subheading: "Mintmark uses your own key to power the AI assistant and content
studio. You're never billed through us. Your heatmap and tracking work without
it — add this whenever you're ready."

Provider tabs: Anthropic | OpenAI | Gemini | Groq
For each provider:

- API key input (type="password", show/hide toggle)
- Helper text: where to get the key + link to provider dashboard
- Note: "Your key is encrypted and never leaves our servers in plaintext."

"Save Key" button → POST `/api/user/api-key`

"Skip for now →" — clearly visible as a text link below the card.
Never hidden, never de-emphasized, never requires a second confirmation.

On save success:

- Brief confirmation: "Key saved ✓"
- After 1s: PATCH onboarding_completed = true → redirect `/dashboard`

On skip:

- PATCH onboarding_completed = true → redirect `/dashboard` immediately

On dashboard (post-skip): any feature requiring the key (assistant, studio)
shows a soft prompt card: "Add your API key in Settings to unlock the AI
assistant and content studio." Links to `/settings`. Never an error wall.

**API routes**

```
POST  /api/user/api-key
  Body: { provider: string, key: string }
  Auth: requireSession
  Rate limit: Upstash 20/min per user (key save is a sensitive operation)
  Validation: provider must be in ['anthropic', 'openai', 'gemini', 'groq']
  Steps:
    1. AES-256-GCM encrypt the key via encryption.ts
    2. UPSERT into api_keys ON CONFLICT (user_id, provider) DO UPDATE
  Returns: { success: true }

DELETE /api/user/api-key/[provider]
  Auth: requireSession
  Validation: provider in allowed list
  DB: DELETE from api_keys where user_id = session.user.id AND provider = param

GET   /api/user/api-keys
  Auth: requireSession
  Returns: [{ provider, is_active, created_at }]
  NEVER returns the encrypted key value — not even to the authenticated user
```

**TanStack Query hooks** (add to `src/lib/queries/settings.ts`)

```typescript
useApiKeys(); // GET /api/user/api-keys (list only)
useSaveApiKey(); // POST mutation
useDeleteApiKey(); // DELETE mutation
```

### Files to create/modify

| File                                              | Action                    |
| ------------------------------------------------- | ------------------------- |
| `src/components/onboarding/steps/ByokKeyStep.tsx` | Replace shell             |
| `src/app/api/user/api-key/route.ts`               | POST (save key)           |
| `src/app/api/user/api-key/[provider]/route.ts`    | DELETE (remove key)       |
| `src/app/api/user/api-keys/route.ts`              | GET (list providers only) |
| `src/lib/queries/settings.ts`                     | Add API key hooks         |

---

## Phase 8.8 — Dashboard Scaffold + Heatmap + Empty State

**Goal:** Build the `/dashboard` page users land on after onboarding completes.
It answers one question clearly: _what have I been investing my mind in, and
how is it going?_

The dashboard must never be blank. If GitHub was connected, the heatmap has
90 days of real data. If a session was logged, the calendar shows today's dot.
If neither, a designed empty state guides the user to their first action.

**Prerequisite:** All previous phases.

### What to build

**Dashboard page** (`src/app/dashboard/page.tsx`)
Server component. Fetches unified_activity for last 365 days server-side.
Passes data as props — no client data fetching on initial load.

Layout (desktop):

```
[Greeting + streak]
[Week at a glance — 7 day cells]        [Intelligence cards — max 2]
[Heatmap widget — 52 × 7 grid]
[Topic time distribution — this week]
```

Layout (mobile): single column, same components stacked.

**Dashboard layout** (`src/app/dashboard/layout.tsx`)

- Sidebar (desktop ≥768px): Dashboard, Notes, Studio, Assistant, Settings
  Each item: icon + label. Active state: gold accent left border.
- Bottom nav (mobile <768px): same 5 items, icon only, 44px tap targets.
- Cmd+K trigger visible in sidebar header (desktop).

**Heatmap widget** (`src/components/dashboard/HeatmapWidget.tsx`)

- 52 × 7 D3.js grid (Sunday → Saturday left to right)
- Data: `unified_activity` rows aggregated by date (max intensity per day)
- Colors from DESIGN.md CSS variables — never hardcoded hex:
  - intensity 0 → `var(--activity-empty)` (bg-secondary equivalent)
  - intensity 1 → `var(--activity-1)` (gold ramp — faintest)
  - intensity 2 → `var(--activity-2)`
  - intensity 3 → `var(--activity-3)`
  - intensity 4 → `var(--activity-4)` (gold ramp — full)
- Tooltip on hover: date + source breakdown
  e.g. "April 14 · 3 GitHub commits · 1 session"
- Source filter toggles below grid (each source as a small pill)
- Streak counter above: "Current streak: 12 days"
- Longest streak below: "Longest: 47 days"
- Mobile: horizontal scroll wrapper, same grid at 10px cell size (desktop: 14px)
- No data at all: empty grid + overlay text "Connect GitHub or log a session
  to start your heatmap" with two action buttons

**Week at a glance** (`src/components/dashboard/WeekCalendarWidget.tsx`)

- Current week Monday–Sunday, 7 columns
- Each day: colored source dot(s) if activity exists for that date
  Dot color = source color (from DESIGN.md source color map)
- Today highlighted with gold accent border
- Click/tap on a day → inline expand showing source breakdown:
  "3 GitHub commits · System design (45 min)"
- Days with no activity: empty cell, no dot, no placeholder text
- Empty state: "No activity this week yet"

**Topic time distribution** (`src/components/dashboard/TopicDistribution.tsx`)

- "Where your time went this week" heading
- Ranked list (not a pie chart) of topics from this week's session metadata
- Format: topic name + bar + duration
  e.g. "System design ████████░░ 4h 30m"
- Max 5 topics shown. "See all" if more.
- Data sourced from unified_activity.metadata.topic for source='session'
- Empty state: "Log a session to see your topic breakdown"

**Streak calculation** (`src/lib/streak.ts`)

```typescript
// Pure function — no side effects, fully testable
export function calculateStreaks(activities: { activity_date: string }[]): {
  current: number;
  longest: number;
};
// A day counts if any unified_activity row exists for it
// Current streak: count consecutive days backward from today
// Longest streak: sliding window across all dates
```

**Dashboard greeting** (`src/components/dashboard/DashboardGreeting.tsx`)

- Time-aware: "Good morning / afternoon / evening, {name}"
- Subline variants:
  - Streak > 0: "You're on a {n}-day streak. Keep it going."
  - No streak, has data: "Welcome back. Here's where things stand."
  - No data at all: "Let's get your first day on the board."

**Intelligence cards placeholder** (`src/components/dashboard/IntelligenceCards.tsx`)

- Phase 2 will populate this with real daily_intelligence data.
- In Phase 8.8: render the slot but show nothing (no placeholder cards,
  no "coming soon" — just empty space that will fill when the daily
  intelligence job ships in Phase 2).

**Dashboard activity API route** (`src/app/api/dashboard/activity/route.ts`)

```
GET
  Auth: requireSession
  Query params: days=365 (default), source (optional filter)
  Rate limit: Upstash 100/min per user
  Cache: check Upstash first (key: dashboard:activity:{userId})
    If hit: return cached. TTL: 1 hour.
    If miss: query unified_activity, cache result, return.
  Returns: { activities: UnifiedActivity[], streak: { current, longest } }
```

**TanStack Query hook** (add to `src/lib/queries/activity.ts`)

```typescript
useDashboardActivity((days = 365)); // GET /api/dashboard/activity
```

**Empty state** (`src/components/dashboard/DashboardEmptyState.tsx`)

- Shown when unified_activity is completely empty after onboarding
- SVG illustration — inline, no external image requests
- Two clear next actions:
  - "Connect GitHub" → links to `/settings` (connections section)
  - "Log a session" → opens a quick-log modal or links to `/settings`
- Never a spinner. Never a blank white div.

### Files to create/modify

| File                                               | Action                                  |
| -------------------------------------------------- | --------------------------------------- |
| `src/app/dashboard/page.tsx`                       | Replace stub with real server component |
| `src/app/dashboard/layout.tsx`                     | Sidebar + bottom nav                    |
| `src/components/dashboard/HeatmapWidget.tsx`       | D3.js heatmap                           |
| `src/components/dashboard/WeekCalendarWidget.tsx`  | Week view                               |
| `src/components/dashboard/TopicDistribution.tsx`   | Topic time breakdown                    |
| `src/components/dashboard/DashboardGreeting.tsx`   | Greeting + streak                       |
| `src/components/dashboard/IntelligenceCards.tsx`   | Empty slot for Phase 2                  |
| `src/components/dashboard/DashboardEmptyState.tsx` | Illustrated empty state                 |
| `src/lib/streak.ts`                                | Pure streak calculation                 |
| `src/lib/queries/activity.ts`                      | Add dashboard activity hook             |
| `src/app/api/dashboard/activity/route.ts`          | GET with Upstash cache                  |

---

## Completion Checklist

After all 8 phases are done, verify:

**Routing and auth**

- [ ] New user logs in → redirected to `/onboarding`
- [ ] User with onboarding_completed = true → goes straight to `/dashboard`
- [ ] Unauthenticated user hitting any `/dashboard/*` or `/onboarding` → `/login`

**Onboarding flow**

- [ ] Platform connections step shows two distinct sections (observe vs. publish)
- [ ] GitHub connect → backfill fires, "Syncing..." transitions to "90 days synced ✓"
- [ ] Gmail connect → profile_data stores gmail_connection_ready: true (no error)
- [ ] Active platforms step: cannot continue without selecting at least one (or skip)
- [ ] Session logged → calendar dot appears on dashboard for today
- [ ] BYOK key: Skip link is clearly visible, never hidden
- [ ] Skip key → onboarding_completed = true → dashboard redirect

**Dashboard**

- [ ] With GitHub data: heatmap shows real commits in gold ramp
- [ ] With session data: week calendar shows today's dot, topic distribution shows topic
- [ ] Streak: correct current and longest calculated server-side
- [ ] With no data: illustrated empty state with two clear CTAs, not a blank page
- [ ] Mobile: bottom nav visible below 768px, heatmap horizontally scrollable
- [ ] Dashboard layout has sidebar on desktop, bottom nav on mobile

**Data integrity**

- [ ] All platform tokens encrypted at rest (no plaintext in DB)
- [ ] Gmail OAuth scope is gmail.readonly only — no write scopes granted
- [ ] api_keys GET never returns the encrypted key value
- [ ] All API routes: requireSession + Upstash rate limit + input validation
- [ ] unified_activity upserts use ON CONFLICT — no duplicate rows

**Concept separation**

- [ ] `platform_connections` = OAuth connections for any platform (observe OR publish)
- [ ] `user_settings.active_platforms` = publishing targets for content studio only
- [ ] These two never conflated in UI, code, or API responses

**Documentation**

- [ ] `CLAUDE.md` status table updated: Step 8 phases 8.3–8.8 marked complete
- [ ] New env vars added to `.env.example` and deployment docs
- [ ] `src/trigger/index.ts` exports github-backfill task correctly
