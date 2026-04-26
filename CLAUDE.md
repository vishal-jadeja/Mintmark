@AGENTS.md

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

# Mintmark — Project Instructions

## Project

Phase 1 (live): Early Access waitlist system with referral tracking.
Phase 2+: Full dashboard — Content Studio, Unified Heatmap, AI Assistant, Notion Sync, Productivity Suite.

---

## Tech Stack

| Layer                        | Technology                                    |
| ---------------------------- | --------------------------------------------- |
| **Framework**                | Next.js 16.2 + React 19.2 + TypeScript        |
| **Styling**                  | Tailwind CSS v4 + shadcn/ui + Framer Motion   |
| **Server state**             | TanStack Query v5 (`@tanstack/react-query`)   |
| **UI/cross-component state** | Zustand v5                                    |
| **HTTP client**              | Axios — shared instance at `src/lib/axios.ts` |
| **Database**                 | Supabase (PostgreSQL + RLS)                   |
| **Auth**                     | NextAuth.js v5 (beta)                         |
| **Email**                    | Brevo + React Email                           |
| **Rate limiting**            | Upstash Redis                                 |
| **Background jobs**          | Trigger.dev v3                                |

---

## Architecture Rules

- **Server state** → TanStack Query (`src/lib/queries/`). Never use `useState + useEffect` to fetch data.
- **Cross-component / UI state** → Zustand (`src/stores/`). No prop-drilling for shared flags.
- **Local ephemeral state** → `useState` only (controlled inputs, validation errors, one-time reads).
- **Mutations are NOT shared across hook instances.** Use Zustand flags (e.g. `uiStore.waitlistJoined`) to communicate mutation success across the component tree.
- All client-side HTTP calls use the shared Axios instance (`src/lib/axios.ts`, `withCredentials: true`). Never create a second axios instance or use `fetch` in query files.
- Polling is disabled by default — use manual refresh (`refetch`) or query invalidation. Only enable `refetchInterval` where explicitly required.

---

## Query Config (`src/providers/QueryProvider.tsx`)

```
staleTime: 5 minutes
retry: 1
refetchOnWindowFocus: false
refetchOnReconnect: false
```

---

## Key Files

| File                              | Purpose                                             |
| --------------------------------- | --------------------------------------------------- |
| `src/lib/config.ts`               | `REFERRAL_SLOTS_BONUS = 5`, `getEarlyAccessLimit()` |
| `src/lib/axios.ts`                | Shared Axios instance                               |
| `src/lib/queries/`                | All TanStack Query hooks                            |
| `src/stores/uiStore.ts`           | `waitlistJoined`, command palette, sidebar state    |
| `src/stores/adminStore.ts`        | Admin table filters + pagination                    |
| `src/stores/onboardingStore.ts`   | Onboarding wizard step, connected platforms state   |
| `src/types/database.ts`           | Supabase TypeScript types                           |
| `src/providers/QueryProvider.tsx` | React Query global config                           |
| `src/proxy.ts`                    | Next.js 16 Proxy (formerly middleware) — admin + app route protection (NextAuth JWT + Supabase SSR cookie refresh) |
| `src/auth.ts`                     | NextAuth v5 config — Credentials provider + JWT    |
| `src/lib/auth/requireAdmin.ts`    | Server-side admin guard for API routes              |

---

## Database

- All tables have Row Level Security (RLS).
- Use `src/lib/supabase/admin.ts` for server-side writes that bypass RLS.
- Use `src/lib/supabase/server.ts` for server-side reads that respect RLS.
- Use `src/lib/supabase/client.ts` for client-side reads only.
- Early access cap: `getEarlyAccessLimit()` checks `system_config` table → `EARLY_ACCESS_LIMIT` env var → default 100.
- Referral bonus: `get_waitlist_position(p_email)` Postgres function subtracts `REFERRAL_SLOTS_BONUS (5)` per referral, minimum position 1.

---

## Supabase Implementation Rules

**Before implementing any new Supabase feature, read the relevant source in `node_modules/@supabase/` first.** API signatures, method names, and SSR patterns have breaking changes that differ from training data — always verify against the installed version.

Key naming convention (this project uses the new Supabase naming):

| Env var | Role | Used in |
|---------|------|---------|
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon key — respects RLS, safe for browser | `client.ts`, `server.ts`, `proxy.ts` |
| `SUPABASE_SECRET_KEY` | Service role key — bypasses RLS, **server-side only** | `admin.ts` |

- The admin client passes `SUPABASE_SECRET_KEY` as the `supabaseKey` arg to `createClient()`. The SDK automatically sets both the `apikey` and `Authorization: Bearer` headers from this arg — do not override them in `global.headers`.
- In the proxy, always call `supabase.auth.getUser()` after `createServerClient()` to refresh session cookies. Never use `getSession()` in the proxy (it reads from cookies and is unverified).
- Admin users have no `user_settings` row — never query `user_settings` without accounting for a `null` result from admins. The proxy redirects admins away from `/dashboard` and `/onboarding` to `/admin` before any page code runs.

---

## README.md — Standing Update Rule

**Whenever a change affects any of the following, update `README.md` in the same task — do not wait to be asked:**

- Tech stack (library added, removed, or version bumped significantly)
- Environment variables (new var required or removed)
- API routes (new endpoint added or existing one removed)
- Architecture (new provider, store, or pattern introduced)
- Setup / installation steps
- Features or capabilities

---

## Code Conventions

- TypeScript strict — no `any`, no implicit types.
- `const` over `let`, no `var`.
- Named exports for components; default exports for pages, layouts, and providers.
- Comments only where logic is non-obvious.
- No unused variables, dead code, or backwards-compat shims.

## Micro-animations

Use Framer Motion to add micro-animations wherever they naturally improve feel. Apply them by default on all frontend work — don't wait to be asked. Treat them as part of the standard output, not an extra.

Good candidates (non-exhaustive):
- Buttons and interactive elements: subtle scale/opacity on hover and tap (`whileHover`, `whileTap`)
- List items and cards entering the DOM: fade + slide-up (`initial`, `animate`, staggered with `variants`)
- Modals, drawers, popovers: fade + scale or slide in/out (`AnimatePresence`)
- Sidebar collapse/expand: already uses CSS transition — enhance only if Framer Motion is already imported in that file
- Toast/alert notifications: slide in from edge, fade out
- Empty states and loading skeletons: fade in when content arrives
- Tab/page transitions: subtle cross-fade

Rules:
- Keep durations short: enter 150–250ms, exit 100–150ms. Never exceed 400ms.
- Use `ease: [0.25, 0.1, 0.25, 1]` (ease-out) for enters; `ease: "easeIn"` for exits.
- Never animate layout-shifting properties (width, height, padding) on hot paths — use opacity/transform only.
- Don't add animations to elements that are already animated by a library (e.g., shadcn Radix primitives with their own transitions).
- `AnimatePresence` is required whenever an element conditionally unmounts.

---

## Current Development State

### Phase 1 — Early Access System ✅ Complete

| Step | Feature | Status |
|------|---------|--------|
| Step 1–5 | Waitlist landing, referral tracking, API routes, TanStack Query | ✅ |
| Step 6 | Invite acceptance page `/invite/[token]`, login page, NextAuth v5 | ✅ |
| Step 7 | Admin dashboard `/admin`, 5 API routes, proxy protection | ✅ |

### Phase 2 — Main App 🟡 In Progress

| Step | Feature | Status |
|------|---------|--------|
| Step 8 (Phase 8.1) | DB schema extension — 5 new tables (`supabase/phase8_schema.sql`) | ✅ |
| Step 8 (Phase 8.2) | Routing + onboarding wizard shell — layout, wizard, store, PATCH route | ✅ |
| Step 8 (Phase 8.3) | Platform OAuth connections (GitHub, Gmail, LinkedIn, X, Medium) | ✅ |
| Step 8 (Phase 8.4) | GitHub commit backfill via Trigger.dev | ✅ |
| Step 8 (Phase 8.5) | Active platforms + per-platform AI instructions | ✅ |
| Step 8 (Phase 8.6) | First manual session log | ✅ |
| Step 8 (Phase 8.7) | BYOK API key (optional step) | ✅ |
| Step 8 (Phase 8.8) | Dashboard scaffold (heatmap, calendar, streak) | ✅ |

See `mintmark-step8-onboarding.md` for the full Step 8 spec and `mintmark-project-intelligence.md` for the broader roadmap.

### Step 9 — Background Jobs (Trigger.dev) ✅ Complete

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 9.1 | `send-batch-invites` task | ✅ |
| Phase 9.2 | `cleanup-expired-tokens` cron (2am UTC) | ✅ |
| Phase 9.3 | `daily-intelligence` stub | ✅ |
| Phase 9.4 | `topic-extraction` stub | ✅ |

See `mintmark-step9-background-jobs.md` for the full Step 9 spec.

### Step 10 — Deploy ✅ Complete

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 10.1 | Production config — `next.config.ts` (security headers, image config), `vercel.json` | ✅ |
| Phase 10.2 | Environment variable reference — `.env.example` (all 22 vars documented) | ✅ |
| Phase 10.3–10.9 | Vercel deploy, Supabase schema, Upstash, Trigger.dev cloud, OAuth apps, Brevo — see `mintmark-step10-deploy.md` | ⬜ (manual infra steps) |

See `mintmark-step10-deploy.md` for the full Step 10 spec and deployment checklist.

### Step 11 — Settings Page ✅ Complete

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 11.1 | Query hooks — `useUserSettings`, `usePlatformInstructions`; fixed `invalidateQueries` on `useUpdateActivePlatforms` + `useUpsertPlatformInstruction` | ✅ |
| Phase 11.2 | `/settings` server page + `SettingsClient` tab container (4 tabs, local state, `<Suspense>` for ConnectionsTab) | ✅ |
| Phase 11.3 | `ConnectionsTab` — all 5 platforms flat, connect/disconnect, backfill chip | ✅ |
| Phase 11.4 | `PublishingTab` — active platforms + AI instructions, seeded from queries with `initialized` guard | ✅ |
| Phase 11.5 | `ApiKeysTab` — 4 provider cards, show/delete existing keys, two-step delete | ✅ |
| Phase 11.6 | `PrivacyTab` — Phase 2 placeholder | ✅ |

See `mintmark-step11-settings.md` for the full Step 11 spec.

### Step 12 — Notes Page ✅ Complete

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 12.1 | DB schema — `folders` + `notes` tables, RLS, indexes (`supabase/phase12_schema.sql`) | ✅ |
| Phase 12.2 | Types — `folders` + `notes` added to `src/types/database.ts` | ✅ |
| Phase 12.3 | API routes — `GET/POST /api/notes`, `GET/PATCH/DELETE /api/notes/[id]`, `GET/POST /api/folders`, `DELETE /api/folders/[id]` | ✅ |
| Phase 12.4 | Query hooks — `useNotes`, `useNote`, `useFolders`, `useCreateNote`, `useUpdateNote`, `useDeleteNote`, `useCreateFolder`, `useDeleteFolder` | ✅ |
| Phase 12.5 | Notes page — `NotesClient` (split pane), `NotesSidebar` (folders + note list + search), `NoteEditor` (markdown editor + preview, ⌘S save, two-step delete) | ✅ |
| Phase 12.6 | Proxy protection — `/notes`, `/api/notes`, `/api/folders`, `/api/activity` routes added | ✅ |
| Phase 12.7 | Markdown preview styles — `.prose-notes` CSS in `globals.css` | ✅ |

See `mintmark-step12-notes.md` for the full Step 12 spec.
