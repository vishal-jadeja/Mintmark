-- =============================================================================
-- Mintmark — Phase 12: Notes Schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Idempotent — safe to re-run on a live DB.
--
-- Creates: folders, notes tables
-- RLS policies: full CRUD for authenticated owner
-- =============================================================================


-- =============================================================================
-- SECTION 1 — FOLDERS TABLE
-- User-scoped note folders. Soft colors for visual organisation.
-- parent_id reserved for Phase 2 nested folders (always NULL in Phase 1).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.folders (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name       text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  color      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.folders IS 'User-scoped note folders. Color is optional CSS color string.';
COMMENT ON COLUMN public.folders.color IS 'Optional CSS hex color, e.g. "#3b82f6". NULL = default grey.';


-- =============================================================================
-- SECTION 2 — NOTES TABLE
-- Lightweight but capable markdown notes.
-- body stores raw markdown text — rendering happens client-side.
-- tags: text[] for manual topic tags; auto-extraction in Phase 2.
-- embedding: NOT included in Phase 1 (pgvector / RAG is Phase 2).
-- notion_page_id / notion_synced_at: Phase 2 Notion sync.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  folder_id  uuid        REFERENCES public.folders(id) ON DELETE SET NULL,
  title      text        NOT NULL DEFAULT '',
  body       text        NOT NULL DEFAULT '',
  tags       text[]      NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.notes IS 'User markdown notes. body is raw markdown rendered client-side.';
COMMENT ON COLUMN public.notes.tags     IS 'Manual topic tags as text array. Phase 2 adds auto-extraction via AI.';
COMMENT ON COLUMN public.notes.folder_id IS 'FK → folders.id. SET NULL on folder delete — note is unfiled, not deleted.';


-- =============================================================================
-- SECTION 3 — INDEXES
-- =============================================================================

-- Notes: primary list query (user + recency)
CREATE INDEX IF NOT EXISTS idx_notes_user_updated
  ON public.notes (user_id, updated_at DESC);

-- Notes: folder filter
CREATE INDEX IF NOT EXISTS idx_notes_user_folder
  ON public.notes (user_id, folder_id);

-- Folders: list by user
CREATE INDEX IF NOT EXISTS idx_folders_user
  ON public.folders (user_id, created_at);


-- =============================================================================
-- SECTION 4 — ROW LEVEL SECURITY
-- Full CRUD for authenticated owner. Service role bypasses RLS.
-- =============================================================================

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes   ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- folders
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "folders: user select own" ON public.folders;
CREATE POLICY "folders: user select own"
  ON public.folders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "folders: user insert own" ON public.folders;
CREATE POLICY "folders: user insert own"
  ON public.folders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "folders: user update own" ON public.folders;
CREATE POLICY "folders: user update own"
  ON public.folders FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "folders: user delete own" ON public.folders;
CREATE POLICY "folders: user delete own"
  ON public.folders FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "notes: user select own" ON public.notes;
CREATE POLICY "notes: user select own"
  ON public.notes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notes: user insert own" ON public.notes;
CREATE POLICY "notes: user insert own"
  ON public.notes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notes: user update own" ON public.notes;
CREATE POLICY "notes: user update own"
  ON public.notes FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notes: user delete own" ON public.notes;
CREATE POLICY "notes: user delete own"
  ON public.notes FOR DELETE TO authenticated
  USING (user_id = auth.uid());


-- =============================================================================
-- SECTION 5 — TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS trg_notes_updated_at ON public.notes;
CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- 1. Confirm tables exist:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name IN ('folders', 'notes');

-- 2. Confirm RLS policies:
-- SELECT tablename, policyname, cmd FROM pg_policies
-- WHERE schemaname = 'public' AND tablename IN ('folders', 'notes');
