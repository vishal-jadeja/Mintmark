# Mintmark — Step 11: Settings Page

## Overview

Step 11 builds the `/settings` page — the first core app page after the dashboard.
All backend API routes were built in Step 8. This step is purely UI: adapting the
onboarding step components into a persistent settings management page.

```
Phase 11.1  →  Query hooks (useUserSettings, usePlatformInstructions)    ✅
Phase 11.2  →  Settings page + SettingsClient (tab container)            ✅
Phase 11.3  →  ConnectionsTab (all 5 platforms, flat list)               ✅
Phase 11.4  →  PublishingTab (active platforms + AI instructions)         ✅
Phase 11.5  →  ApiKeysTab (4 provider cards, show/delete existing keys)  ✅
Phase 11.6  →  PrivacyTab (Phase 2 placeholder)                          ✅
```

---

## Architecture

```
/settings (server component — auth check)
  └── SettingsClient (client, manages tab state)
        ├── ConnectionsTab   — useConnections(), useDisconnect()
        ├── PublishingTab    — useUserSettings(), usePlatformInstructions(),
        │                      useUpdateActivePlatforms(), useUpsertPlatformInstruction()
        ├── ApiKeysTab       — useApiKeys(), useSaveApiKey(), useDeleteApiKey()
        └── PrivacyTab       — static placeholder
```

`ConnectionsTab` uses `useSearchParams()` and must be wrapped in `<Suspense>` at the
call site in `SettingsClient`. All data fetching happens client-side via TanStack Query.

---

## Phase 11.1 — Query additions to `src/lib/queries/settings.ts`

Two new queries added:

**`useUserSettings()`** — GET `/api/user/settings`
```ts
{ active_platforms: string[], timezone: string | null, theme: string | null, onboarding_completed: boolean }
```

**`usePlatformInstructions()`** — GET `/api/user/platform-instructions`
```ts
[{ platform: string, instruction_text: string | null, tone: string | null, format_rules: string | null }]
```

Also fixed two existing mutations that were missing `onSuccess` cache invalidation:
- `useUpdateActivePlatforms` → invalidates `["user-settings"]`
- `useUpsertPlatformInstruction` → invalidates `["platform-instructions"]`

---

## Phase 11.2 — Settings page

**`src/app/(app)/settings/page.tsx`** — server component
- Auth check via `auth()`, redirects to `/login` if unauthenticated
- `export const dynamic = "force-dynamic"` (no static caching)
- Renders `<SettingsClient />` inside a max-w-3xl container

**`src/components/settings/SettingsClient.tsx`** — client component
- 4 tabs: Connections | Publishing | AI Keys | Privacy
- Tab state: local `useState<Tab>` (ephemeral to this page, no Zustand)
- Active tab: gold background + gold text; inactive: muted text
- `<ConnectionsTab />` wrapped in `<Suspense>` (required for `useSearchParams`)

---

## Phase 11.3 — ConnectionsTab

File: `src/components/settings/ConnectionsTab.tsx`

Adapted from `PlatformConnectionsStep.tsx`. Key differences:
- All 5 platforms (GitHub, Gmail, LinkedIn, X, Medium) shown in a single flat list
- No collapsible "publishing platforms" accordion
- No `comingSoon` prop — all platforms are live in Settings
- Retains: all 5 SVG icons, `BackfillChip`, `useBackfillPoll`, `PlatformCard`
- Retains: error toast for `?error=connection_failed` URL param

---

## Phase 11.4 — PublishingTab

File: `src/components/settings/PublishingTab.tsx`

Adapted from `ActivePlatformsStep.tsx`. Key differences:
- Fetches existing `active_platforms` + `platform_instructions` to prefill form
- `initialized` flag prevents query refetches from overwriting in-progress edits
- Single "Save changes" button (no "Continue" or "Skip")
- `Promise.all` for parallel instruction upserts on save
- Success indicator inline next to the save button (not a page-level toast)

---

## Phase 11.5 — ApiKeysTab

File: `src/components/settings/ApiKeysTab.tsx`

Adapted from `ByokKeyStep.tsx`. Key differences:
- 4 vertically-stacked `ProviderCard` components (not tabs)
- Each `ProviderCard` manages its own local state independently
- If key exists: shows "✓ Key saved [date]" + Update + Delete buttons
- "Update" toggles `updateMode` to show the input again
- Two-step delete: first click → "Confirm delete?" (3s timeout), second click → deletes
- `useApiKeys()` called at tab level; matching key passed as `existingKey` prop per card

---

## Phase 11.6 — PrivacyTab

File: `src/components/settings/PrivacyTab.tsx`

Static placeholder. Three rows:
1. "View all tracked data by category"
2. "Export your data as JSON"
3. "Delete data by time period or source"

Each row has a "Phase 2" pill. Short note about data privacy principles at the bottom.

---

## Files created/modified

| File | Action |
|------|--------|
| `mintmark-step11-settings.md` | New spec (this file) |
| `src/lib/queries/settings.ts` | Added 2 queries + fixed 2 mutations |
| `src/app/(app)/settings/page.tsx` | New |
| `src/components/settings/SettingsClient.tsx` | New |
| `src/components/settings/ConnectionsTab.tsx` | New |
| `src/components/settings/PublishingTab.tsx` | New |
| `src/components/settings/ApiKeysTab.tsx` | New |
| `src/components/settings/PrivacyTab.tsx` | New |
| `CLAUDE.md` | Updated — Step 11 status |
| `README.md` | Updated — current status |

---

## Verification

1. `/settings` loads with tab bar visible
2. **Connections** — connected platforms show profile info + disconnect button;
   unconnected platforms show "Connect [Platform]" → OAuth redirect works
3. **Publishing** — checkboxes match what was set in onboarding; save → reload → same state
4. **AI Keys** — existing BYOK key shows "✓ Key saved [date]"; Update and Delete work
5. **Privacy** — placeholder rows with "Phase 2" pills visible
6. Connection error (`?error=connection_failed`) shows error toast on Connections tab
