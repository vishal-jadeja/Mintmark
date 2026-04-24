# Mintmark — Step 12: Notes Page

## Overview

Step 12 builds the `/notes` page — a lightweight markdown editor with folder
organisation and search. Notes feed the AI's understanding of the user.
Topic auto-extraction and pgvector embeddings are Phase 2; this step handles
the core CRUD and UI.

```
Phase 12.1  →  DB schema (folders + notes tables)              ✅
Phase 12.2  →  Types (src/types/database.ts)                   ✅
Phase 12.3  →  API routes (notes + folders CRUD)               ✅
Phase 12.4  →  Query hooks (src/lib/queries/notes.ts)          ✅
Phase 12.5  →  Page + components                               ✅
Phase 12.6  →  Proxy protection                                ✅
Phase 12.7  →  Markdown preview CSS                            ✅
```

---

## Architecture

```
/notes (server component — auth check)
  └── NotesClient (client, manages split-pane state)
        ├── NotesSidebar
        │     ├── Search input
        │     ├── "All Notes" shortcut
        │     ├── Folder list (create / delete folders)
        │     └── Note list (filtered by folder + search)
        └── NoteEditor (key={noteId} → remounts on note switch)
              ├── Edit / Preview tab toggle
              ├── Title input
              ├── Textarea (edit mode) or MarkdownPreview (preview mode)
              └── Toolbar: Save (⌘S) · Delete (two-step)
```

---

## Phase 12.1 — DB Schema (`supabase/phase12_schema.sql`)

**`folders`**
```sql
id uuid PK, user_id FK→users, name text (1–100 chars),
color text (nullable CSS color), created_at timestamptz
```

**`notes`**
```sql
id uuid PK, user_id FK→users, folder_id FK→folders ON DELETE SET NULL,
title text DEFAULT '', body text DEFAULT '',
tags text[] DEFAULT '{}', created_at timestamptz, updated_at timestamptz
```

RLS: full CRUD for authenticated owner. Service role bypasses RLS for
heatmap writes.

**Deferred to Phase 2:** `embedding vector(1536)`, `notion_page_id`,
`notion_synced_at`.

---

## Phase 12.3 — API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/notes` | GET, POST | List (filter by folder_id, search) + create |
| `/api/notes/[id]` | GET, PATCH, DELETE | Single note operations |
| `/api/folders` | GET, POST | List (with note counts) + create |
| `/api/folders/[id]` | DELETE | Delete folder (notes unfiled via ON DELETE SET NULL) |

### Heatmap integration

On note create (`POST /api/notes`) and note save (`PATCH /api/notes/[id]`
when title or body changes): upsert `unified_activity` for `source='notes'`
with intensity thresholds: 0=0, 1=1-2, 2=3-5, 3=6-9, 4=10+.

---

## Phase 12.4 — Query Hooks (`src/lib/queries/notes.ts`)

| Hook | Purpose |
|------|---------|
| `useNotes(params?)` | List notes — optional `folder_id` + `search` filter |
| `useNote(id)` | Single note (full body) |
| `useFolders()` | Folder list with `note_count` |
| `useCreateNote()` | POST — returns created `Note`, invalidates `["notes"]` |
| `useUpdateNote()` | PATCH — invalidates `["notes"]`, updates `["note", id]` cache |
| `useDeleteNote()` | DELETE — invalidates `["notes"]`, removes `["note", id]` |
| `useCreateFolder()` | POST — invalidates `["folders"]` |
| `useDeleteFolder()` | DELETE — invalidates `["folders"]` + `["notes"]` |

---

## Phase 12.5 — Components

### `NotesClient`
- Split-pane layout: sidebar (w-64) + editor (flex-1)
- Mobile: sidebar slides in from left (overlay), hamburger in editor header
- State: `selectedFolderId`, `selectedNoteId`, `search`, `sidebarOpen`
- `handleNewNote()` → `useCreateNote()` → sets `selectedNoteId` to new note id

### `NotesSidebar`
- Search input (passed to `useNotes` as search param)
- "All Notes" shortcut (sets `selectedFolderId = null`)
- Folder list: color dot + name + note count + hover delete (two-step confirm)
- "New Folder" inline form: name + color picker (7 muted colors) + create
- Note list: title, body preview, date — selected note highlighted in gold
- "New Note" gold button at bottom

### `NoteEditor`
- `key={noteId}` — remounts when switching notes, avoids stale state
- Seeds `title` + `body` from `useNote(noteId)` when note loads
- `isDirty` = local state differs from fetched note
- Edit/Preview toggle — Preview uses `MarkdownPreview` (dynamic import of `marked`)
- Toolbar: Edit|Preview tabs · spacer · Save button · Saved chip · ⌘S hint · Delete
- Two-step delete: "Delete" → "Confirm delete?" (3s timeout) → deletes + calls `onNoteDeleted()`
- ⌘S / Ctrl+S keyboard shortcut to save
- Empty state when no note selected: illustration + "New Note" CTA

### `MarkdownPreview`
- Dynamically imports `marked` (`import("marked")`) to avoid SSR bundle impact
- Renders `dangerouslySetInnerHTML` — user's own content, no XSS risk between users
- Uses `.prose-notes` CSS class defined in `globals.css`

---

## Phase 12.7 — Markdown CSS (`.prose-notes`)

Added to `src/app/globals.css`:
- `h1`–`h4`: Sora font, `#e5e2e1`, margin top/bottom
- `p`: 0.75em margin-bottom
- `code`: JetBrains Mono, gold (`#e6c364`), subtle background
- `pre`: dark background, border, rounded
- `ul`, `ol`: indented list
- `a`: gold underlined
- `blockquote`: gold left border, muted italic
- `hr`: subtle border

---

## Files Created/Modified

| File | Action |
|------|--------|
| `mintmark-step12-notes.md` | New spec (this file) |
| `supabase/phase12_schema.sql` | New DB migration |
| `src/types/database.ts` | Added `folders` + `notes` table types |
| `src/app/api/notes/route.ts` | New — GET list + POST create |
| `src/app/api/notes/[id]/route.ts` | New — GET + PATCH + DELETE |
| `src/app/api/folders/route.ts` | New — GET list + POST create |
| `src/app/api/folders/[id]/route.ts` | New — DELETE |
| `src/lib/queries/notes.ts` | New — all query hooks |
| `src/app/(app)/notes/page.tsx` | New — server component |
| `src/components/notes/NotesClient.tsx` | New |
| `src/components/notes/NotesSidebar.tsx` | New |
| `src/components/notes/NoteEditor.tsx` | New |
| `src/app/globals.css` | Added `.prose-notes` markdown styles |
| `src/proxy.ts` | Added `/notes`, `/api/notes`, `/api/folders`, `/api/activity` protection |
| `CLAUDE.md` | Step 12 status block added |
| `README.md` | Notes page marked `[x]` complete |
| `package.json` | Added `marked` dependency |

---

## Verification Checklist

1. `/notes` loads — sidebar visible, empty state in editor
2. **New Note** → blank note created, editor opens, title focused
3. Type title + body → toolbar shows unsaved state
4. **Save** (button or ⌘S) → "Saved" chip appears, note appears in sidebar list
5. **Preview toggle** → markdown rendered with correct styles (h1, bold, code, etc.)
6. **Create folder** → color picker → Create → folder appears in sidebar
7. **Move note to folder** (via PATCH or future drag) → note count updates
8. **Delete note** → "Confirm delete?" → deleted → editor shows empty state
9. **Delete folder** → notes in that folder unfiled (moved to All Notes)
10. **Search** → filters note list in real time (server-side ilike)
11. **Heatmap** → after saving a note, `unified_activity` row exists for today with `source='notes'`
12. **Mobile** → hamburger opens sidebar overlay, tap outside closes it
