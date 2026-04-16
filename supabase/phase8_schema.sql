-- =============================================================================
-- Mintmark — Phase 8.1: Database Schema Extension
-- Run this file in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- It is idempotent — safe to re-run on a live DB with existing data.
--
-- Execution order:
--   1. Trigger function
--   2. New tables
--   3. Indexes
--   4. ALTER user_settings
--   5. Enable RLS + policies
--   6. Attach updated_at triggers
-- =============================================================================


-- =============================================================================
-- SECTION 1 — TRIGGER FUNCTION: set_updated_at
-- Reusable. Attached to every table with an updated_at column.
-- CREATE OR REPLACE is inherently idempotent.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


-- =============================================================================
-- SECTION 2 — NEW TABLES
-- All reference public.users(id) with ON DELETE CASCADE.
-- All non-nullable columns carry NOT NULL explicitly.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- api_keys
-- BYOK: one encrypted AI provider key per user per provider.
-- Tokens stored as AES-256-GCM ciphertext (iv:authTag:ciphertext, base64).
-- Use src/lib/encryption.ts to encrypt/decrypt — never store plaintext.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider      text        NOT NULL
                            CHECK (provider IN ('anthropic', 'openai', 'gemini', 'groq')),
  encrypted_key text        NOT NULL,
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

COMMENT ON TABLE  public.api_keys IS 'BYOK AI provider keys — encrypted at rest via AES-256-GCM.';
COMMENT ON COLUMN public.api_keys.encrypted_key IS 'Format: iv:authTag:ciphertext (base64). Use src/lib/encryption.ts. Never expose to client.';
COMMENT ON COLUMN public.api_keys.provider      IS 'One of: anthropic, openai, gemini, groq.';

-- ---------------------------------------------------------------------------
-- platform_connections
-- OAuth tokens for each connected platform.
-- All token fields encrypted at rest via AES-256-GCM.
-- Disconnect is a soft-delete (is_active = false), not a hard delete.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_connections (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform         text        NOT NULL
                               CHECK (platform IN ('github', 'linkedin', 'x', 'medium')),
  access_token     text        NOT NULL,
  refresh_token    text,
  token_expires_at timestamptz,
  profile_data     jsonb       NOT NULL DEFAULT '{}',
  is_active        boolean     NOT NULL DEFAULT true,
  connected_at     timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);

COMMENT ON TABLE  public.platform_connections IS 'OAuth platform tokens — all token fields encrypted via AES-256-GCM. Disconnect = set is_active = false.';
COMMENT ON COLUMN public.platform_connections.access_token     IS 'AES-256-GCM ciphertext. Format: iv:authTag:ciphertext (base64).';
COMMENT ON COLUMN public.platform_connections.refresh_token    IS 'AES-256-GCM ciphertext. NULL for GitHub (PAT has no refresh).';
COMMENT ON COLUMN public.platform_connections.token_expires_at IS 'NULL for GitHub PAT (does not expire). Set for LinkedIn, X, Medium OAuth tokens.';
COMMENT ON COLUMN public.platform_connections.profile_data     IS 'Shape: {username, display_name, avatar_url, profile_url, backfill_complete?}.';

-- ---------------------------------------------------------------------------
-- platform_instructions
-- Per-platform AI voice instructions for content generation.
-- Content platforms only (linkedin, x, medium). GitHub excluded — no posts.
-- All fields nullable: null means "not yet configured by user".
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_instructions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform         text        NOT NULL
                               CHECK (platform IN ('linkedin', 'x', 'medium')),
  instruction_text text,
  tone             text
                               CHECK (tone IN ('professional', 'casual', 'educational', 'storytelling')),
  format_rules     text,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);

COMMENT ON TABLE  public.platform_instructions IS 'Per-platform AI content instructions. Nullable fields = not yet set by user. Content platforms only.';
COMMENT ON COLUMN public.platform_instructions.instruction_text IS 'Free-form user instructions to the AI for this platform.';
COMMENT ON COLUMN public.platform_instructions.tone             IS 'One of: professional, casual, educational, storytelling. NULL = not set.';
COMMENT ON COLUMN public.platform_instructions.format_rules     IS 'User-defined format constraints, e.g. "always use bullet points".';

-- ---------------------------------------------------------------------------
-- unified_activity
-- Single source of truth for the heatmap and week calendar.
-- One row per (user, date, source) — aggregated counts, not per-event.
-- Written by service role only (background jobs + session log API route).
-- The UNIQUE constraint enables safe upserts (ON CONFLICT DO UPDATE).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.unified_activity (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_date  date        NOT NULL,
  source         text        NOT NULL
                             CHECK (source IN ('github', 'session', 'linkedin', 'x', 'medium', 'notes')),
  activity_count int         NOT NULL DEFAULT 1 CHECK (activity_count > 0),
  intensity      int         NOT NULL DEFAULT 1 CHECK (intensity BETWEEN 0 AND 4),
  metadata       jsonb       NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, activity_date, source)
);

COMMENT ON TABLE  public.unified_activity IS 'Aggregated daily activity per source. Service role writes only — use createAdminClient(). The UNIQUE constraint enables idempotent upserts.';
COMMENT ON COLUMN public.unified_activity.activity_date  IS 'ISO date (e.g. 2026-04-11). One row per user per source per calendar day.';
COMMENT ON COLUMN public.unified_activity.intensity      IS '0=none, 1=low, 2=medium, 3=high, 4=very high. Computed on write, not read. GitHub thresholds: 0=0, 1=1-3, 2=4-7, 3=8-14, 4=15+.';
COMMENT ON COLUMN public.unified_activity.activity_count IS 'Raw event count for this source on this date. Always >= 1 when row exists.';
COMMENT ON COLUMN public.unified_activity.metadata       IS 'Source-specific payload. GitHub: {commit_shas:[]}. Session: {session_id, topic, duration_minutes}.';

-- ---------------------------------------------------------------------------
-- topic_nodes
-- Accumulated topic graph. Written by the intelligence layer (service role).
-- topic is stored lowercase + trimmed — enforced at application layer.
-- No updated_at column: counters are atomically incremented via SQL UPDATE.
-- Staleness tracked by last_activity_at (set explicitly by the writer).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.topic_nodes (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic            text        NOT NULL,
  post_count       int         NOT NULL DEFAULT 0 CHECK (post_count >= 0),
  note_count       int         NOT NULL DEFAULT 0 CHECK (note_count >= 0),
  session_count    int         NOT NULL DEFAULT 0 CHECK (session_count >= 0),
  last_activity_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic)
);

COMMENT ON TABLE  public.topic_nodes IS 'Topic intelligence graph. Service role writes only. topic must be lowercase+trimmed (enforced at app layer, not DB).';
COMMENT ON COLUMN public.topic_nodes.topic            IS 'Lowercase, whitespace-trimmed. Application layer must normalise before insert.';
COMMENT ON COLUMN public.topic_nodes.last_activity_at IS 'NULL until first activity is recorded. Drives "topics you have not touched recently" queries.';
COMMENT ON COLUMN public.topic_nodes.session_count    IS 'Incremented atomically via UPDATE session_count = session_count + 1.';


-- =============================================================================
-- SECTION 3 — INDEXES
-- Leading column is always user_id for efficient per-tenant scans.
-- =============================================================================

-- unified_activity: primary heatmap query (user + date range)
CREATE INDEX IF NOT EXISTS idx_unified_activity_user_date
  ON public.unified_activity (user_id, activity_date);

-- unified_activity: per-source filtering (e.g. show only github commits)
CREATE INDEX IF NOT EXISTS idx_unified_activity_user_source_date
  ON public.unified_activity (user_id, source, activity_date);

-- platform_connections: OAuth callback upsert lookup
CREATE INDEX IF NOT EXISTS idx_platform_connections_user_platform
  ON public.platform_connections (user_id, platform);

-- api_keys: BYOK save/load lookup
CREATE INDEX IF NOT EXISTS idx_api_keys_user_provider
  ON public.api_keys (user_id, provider);

-- topic_nodes: upsert ON CONFLICT lookup
CREATE INDEX IF NOT EXISTS idx_topic_nodes_user_topic
  ON public.topic_nodes (user_id, topic);

-- topic_nodes: "topics not touched recently" query — DESC NULLS LAST so new
-- nodes (last_activity_at = NULL) sort to the end, not the front
CREATE INDEX IF NOT EXISTS idx_topic_nodes_user_last_activity
  ON public.topic_nodes (user_id, last_activity_at DESC NULLS LAST);


-- =============================================================================
-- SECTION 4 — ALTER TABLE user_settings
-- Safe to run on a live DB:
--   ADD COLUMN IF NOT EXISTS is non-blocking (PostgreSQL 12+)
--   active_platforms cast: '[]'::text → '[]'::jsonb is always valid
-- =============================================================================

-- Add new onboarding state columns
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step      int     NOT NULL DEFAULT 1
    CHECK (onboarding_step BETWEEN 1 AND 4);

-- NOTE: If Phase 8.2 changes the wizard step count, update this CHECK constraint:
--   ALTER TABLE user_settings DROP CONSTRAINT user_settings_onboarding_step_check;
--   ALTER TABLE user_settings ADD CONSTRAINT ... CHECK (onboarding_step BETWEEN 1 AND N);

COMMENT ON COLUMN public.user_settings.onboarding_completed IS 'Set to true when the user finishes all onboarding steps. Middleware reads this to decide redirect.';
COMMENT ON COLUMN public.user_settings.onboarding_step      IS '1–4, mirrors the current wizard step. Persisted so users can resume a half-finished onboarding.';

-- Change active_platforms from text to jsonb.
-- Idempotent: checks information_schema before altering — skips if already jsonb.
-- The existing accept_invite_account RPC inserts the literal '[]' which is valid
-- JSON. PostgreSQL implicitly casts text '[]' to jsonb after this ALTER — no RPC
-- change needed.
--
-- PRE-FLIGHT CHECK (run manually before executing if DB has live rows):
--   SELECT user_id, active_platforms FROM user_settings
--   WHERE active_platforms IS NOT NULL AND active_platforms NOT LIKE '[%';
-- Any rows returned contain non-JSON values and must be fixed before proceeding.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM   information_schema.columns
    WHERE  table_schema = 'public'
    AND    table_name   = 'user_settings'
    AND    column_name  = 'active_platforms'
    AND    data_type    = 'text'
  ) THEN
    -- Drop the text default first — PostgreSQL cannot auto-cast a column default
    -- when changing the column type. We re-set it as jsonb immediately after.
    ALTER TABLE public.user_settings
      ALTER COLUMN active_platforms DROP DEFAULT;

    ALTER TABLE public.user_settings
      ALTER COLUMN active_platforms TYPE jsonb USING active_platforms::jsonb;

    ALTER TABLE public.user_settings
      ALTER COLUMN active_platforms SET DEFAULT '[]'::jsonb;
  END IF;
END;
$$;

COMMENT ON COLUMN public.user_settings.active_platforms IS 'jsonb array of platform strings the user posts on, e.g. ["linkedin","x"]. Empty array = not yet configured.';


-- =============================================================================
-- SECTION 5 — ROW LEVEL SECURITY
-- Pattern: DROP IF EXISTS then CREATE (idempotent, readable).
-- All policies use auth.uid() — Supabase injects the authenticated user's UUID.
-- Service role (createAdminClient) bypasses RLS entirely — no explicit policy needed.
-- =============================================================================

ALTER TABLE public.api_keys              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_connections  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_activity      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_nodes           ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- api_keys — authenticated user manages own rows
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "api_keys: user select own"  ON public.api_keys;
CREATE POLICY "api_keys: user select own"
  ON public.api_keys FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "api_keys: user insert own"  ON public.api_keys;
CREATE POLICY "api_keys: user insert own"
  ON public.api_keys FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "api_keys: user update own"  ON public.api_keys;
CREATE POLICY "api_keys: user update own"
  ON public.api_keys FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "api_keys: user delete own"  ON public.api_keys;
CREATE POLICY "api_keys: user delete own"
  ON public.api_keys FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- platform_connections — user SELECT/INSERT/UPDATE; no user DELETE
-- Disconnect is a soft-delete (is_active = false via UPDATE).
-- OAuth callbacks write via createAdminClient() which bypasses RLS.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "platform_connections: user select own"  ON public.platform_connections;
CREATE POLICY "platform_connections: user select own"
  ON public.platform_connections FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "platform_connections: user insert own"  ON public.platform_connections;
CREATE POLICY "platform_connections: user insert own"
  ON public.platform_connections FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "platform_connections: user update own"  ON public.platform_connections;
CREATE POLICY "platform_connections: user update own"
  ON public.platform_connections FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- No user-level DELETE policy. Hard deletes are service role only.

-- ---------------------------------------------------------------------------
-- platform_instructions — full user CRUD
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "platform_instructions: user select own"  ON public.platform_instructions;
CREATE POLICY "platform_instructions: user select own"
  ON public.platform_instructions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "platform_instructions: user insert own"  ON public.platform_instructions;
CREATE POLICY "platform_instructions: user insert own"
  ON public.platform_instructions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "platform_instructions: user update own"  ON public.platform_instructions;
CREATE POLICY "platform_instructions: user update own"
  ON public.platform_instructions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "platform_instructions: user delete own"  ON public.platform_instructions;
CREATE POLICY "platform_instructions: user delete own"
  ON public.platform_instructions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- unified_activity — user SELECT only; no user INSERT/UPDATE/DELETE
-- All writes go through createAdminClient() (background jobs, session log route).
-- IMPORTANT: Using createClient() (server client) to write here will silently
-- fail because there is no authenticated INSERT policy — this is intentional.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "unified_activity: user select own"  ON public.unified_activity;
CREATE POLICY "unified_activity: user select own"
  ON public.unified_activity FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- topic_nodes — user SELECT only; no user INSERT/UPDATE/DELETE
-- Intelligence layer writes via createAdminClient().
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "topic_nodes: user select own"  ON public.topic_nodes;
CREATE POLICY "topic_nodes: user select own"
  ON public.topic_nodes FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- =============================================================================
-- SECTION 6 — TRIGGERS: attach set_updated_at to all tables with updated_at
-- DROP IF EXISTS + CREATE is idempotent.
-- topic_nodes intentionally excluded — it has no updated_at column.
-- =============================================================================

DROP TRIGGER IF EXISTS trg_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER trg_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_platform_connections_updated_at ON public.platform_connections;
CREATE TRIGGER trg_platform_connections_updated_at
  BEFORE UPDATE ON public.platform_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_platform_instructions_updated_at ON public.platform_instructions;
CREATE TRIGGER trg_platform_instructions_updated_at
  BEFORE UPDATE ON public.platform_instructions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_unified_activity_updated_at ON public.unified_activity;
CREATE TRIGGER trg_unified_activity_updated_at
  BEFORE UPDATE ON public.unified_activity
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Retroactively attach to user_settings (existing table, no prior trigger)
DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- VERIFICATION — uncomment and run each block to spot-check after execution
-- =============================================================================

-- 1. Confirm all 5 new tables exist alongside the Phase 1 tables:
-- SELECT table_name
-- FROM   information_schema.tables
-- WHERE  table_schema = 'public'
-- ORDER  BY table_name;

-- 2. Confirm user_settings has the new columns and active_platforms is jsonb:
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM   information_schema.columns
-- WHERE  table_schema = 'public' AND table_name = 'user_settings'
-- ORDER  BY ordinal_position;

-- 3. Confirm all RLS policies are active:
-- SELECT tablename, policyname, cmd
-- FROM   pg_policies
-- WHERE  schemaname = 'public'
-- ORDER  BY tablename, policyname;

-- 4. Confirm all updated_at triggers are attached:
-- SELECT trigger_name, event_object_table
-- FROM   information_schema.triggers
-- WHERE  trigger_schema = 'public'
-- ORDER  BY event_object_table;

-- 5. Smoke-test CHECK constraints (each should error with a constraint violation):
-- INSERT INTO api_keys (user_id, provider, encrypted_key) VALUES (gen_random_uuid(), 'invalid', 'x');
-- INSERT INTO unified_activity (user_id, activity_date, source, intensity) VALUES (gen_random_uuid(), CURRENT_DATE, 'github', 5);
