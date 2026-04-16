@AGENTS.md

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
| Step 8 (Phase 8.3) | Platform OAuth connections (GitHub, LinkedIn, X, Medium) | ⬜ |
| Step 8 (Phase 8.4) | GitHub commit backfill via Trigger.dev | ⬜ |
| Step 8 (Phase 8.5) | Active platforms + per-platform AI instructions | ⬜ |
| Step 8 (Phase 8.6) | First manual session log | ⬜ |
| Step 8 (Phase 8.7) | BYOK API key (optional step) | ⬜ |
| Step 8 (Phase 8.8) | Dashboard scaffold (heatmap, calendar, streak) | ⬜ |

See `mintmark-step8-onboarding.md` for the full Step 8 spec and `mintmark-project-intelligence.md` for the broader roadmap.
