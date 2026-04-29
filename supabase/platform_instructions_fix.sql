-- =============================================================================
-- Mintmark — platform_instructions fix
-- Run in Supabase SQL Editor. Idempotent.
--
-- Fixes:
--   1. Adds max_length column (user's preferred max character limit per platform)
--   2. Expands tone CHECK constraint to include UI tones:
--      witty | authoritative | inspirational
-- =============================================================================

-- 1. Add max_length column
ALTER TABLE public.platform_instructions
  ADD COLUMN IF NOT EXISTS max_length int CHECK (max_length IS NULL OR max_length > 0);

COMMENT ON COLUMN public.platform_instructions.max_length
  IS 'User-defined max character limit for this platform. NULL = use platform default. Must be <= platform hard limit (LinkedIn 3000, X 280, Medium unlimited).';

-- 2. Replace tone CHECK constraint with expanded set matching the UI
ALTER TABLE public.platform_instructions
  DROP CONSTRAINT IF EXISTS platform_instructions_tone_check;

ALTER TABLE public.platform_instructions
  ADD CONSTRAINT platform_instructions_tone_check
  CHECK (tone IN (
    'professional',
    'casual',
    'educational',
    'storytelling',
    'witty',
    'authoritative',
    'inspirational'
  ));

-- Verification
-- SELECT column_name, data_type, character_maximum_length
-- FROM   information_schema.columns
-- WHERE  table_schema = 'public' AND table_name = 'platform_instructions'
-- ORDER BY ordinal_position;
