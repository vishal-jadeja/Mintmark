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
| `src/types/database.ts`           | Supabase TypeScript types                           |
| `src/providers/QueryProvider.tsx` | React Query global config                           |
| `src/proxy.ts`                    | Next.js 16 middleware (replaces `middleware.ts`)    |

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
