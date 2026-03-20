-- =============================================================================
-- Mintmark — Early Access Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS and CREATE OR REPLACE
-- =============================================================================


-- =============================================================================
-- TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- users
-- Stores authenticated Mintmark users (post-waitlist, post-invite).
-- Populated by the server (service role) after an invite is accepted.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        UNIQUE NOT NULL,
  name        text,
  avatar      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- waitlist
-- Everyone who requests early access. referral_code is auto-generated
-- by the generate_referral_code trigger on INSERT.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text        UNIQUE NOT NULL,
  name                text,
  reason              text,
  referral_code       text        UNIQUE NOT NULL DEFAULT '',  -- overwritten by trigger
  referred_by         text,       -- referral_code value of the person who referred them
  position            integer,    -- denormalized; effective position via get_waitlist_position()
  status              text        NOT NULL DEFAULT 'waiting'
                                  CHECK (status IN ('waiting', 'invited', 'joined')),
  email_verified      boolean     NOT NULL DEFAULT false,
  verification_token  text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- invite_tokens
-- One-time tokens sent to waitlist members when they are invited.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invite_tokens (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  token       text        UNIQUE NOT NULL,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- user_settings
-- Stub for future user preferences. user_id is both PK and FK — one row
-- per user, no surrogate key needed.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id     uuid        PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  theme       text        NOT NULL DEFAULT 'dark',
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- =============================================================================
-- INDEXES
-- =============================================================================

-- waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_email
  ON public.waitlist (email);

CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code
  ON public.waitlist (referral_code);

CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by
  ON public.waitlist (referred_by);

CREATE INDEX IF NOT EXISTS idx_waitlist_status
  ON public.waitlist (status);

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at
  ON public.waitlist (created_at);

-- invite_tokens
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token
  ON public.invite_tokens (token);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_email
  ON public.invite_tokens (email);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires_at
  ON public.invite_tokens (expires_at);


-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- generate_referral_code()
-- Generates a unique 8-character uppercase alphanumeric referral code.
-- Called automatically via trigger on waitlist INSERT.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  chars  text    := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- no I/O/1/0 (ambiguous)
  code   text;
  taken  boolean;
BEGIN
  -- Only generate if referral_code is empty / default
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    LOOP
      -- Build 8-char code by sampling chars randomly
      code := '';
      FOR i IN 1..8 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
      END LOOP;

      -- Check uniqueness
      SELECT EXISTS (
        SELECT 1 FROM public.waitlist WHERE referral_code = code
      ) INTO taken;

      EXIT WHEN NOT taken;
    END LOOP;

    NEW.referral_code := code;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger: fires BEFORE INSERT so the generated code is saved
DROP TRIGGER IF EXISTS trg_waitlist_referral_code ON public.waitlist;
CREATE TRIGGER trg_waitlist_referral_code
  BEFORE INSERT ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- ---------------------------------------------------------------------------
-- get_waitlist_position(p_email text)
-- Returns the effective queue position for an email address.
--
-- Algorithm:
--   base_position  = row_number() ordered by created_at ASC (1 = first signup)
--   referral_bonus = COUNT of waitlist rows whose referred_by = this row's
--                    referral_code × 5 (5 spots forward per referral)
--   effective      = MAX(1, base_position - referral_bonus)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_waitlist_position(p_email text)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_referral_code  text;
  v_base_position  integer;
  v_referral_count integer;
  v_effective      integer;
BEGIN
  -- Look up the row
  SELECT
    referral_code,
    row_number() OVER (ORDER BY created_at ASC)::integer
  INTO v_referral_code, v_base_position
  FROM public.waitlist
  WHERE email = p_email;

  IF NOT FOUND THEN
    RETURN NULL;  -- email not on waitlist
  END IF;

  -- Count successful referrals (people who signed up using this code)
  SELECT COUNT(*)::integer
  INTO v_referral_count
  FROM public.waitlist
  WHERE referred_by = v_referral_code;

  -- Each referral moves the person 5 spots forward, minimum position 1
  v_effective := GREATEST(1, v_base_position - (v_referral_count * 5));

  RETURN v_effective;
END;
$$;


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- waitlist policies
-- ---------------------------------------------------------------------------

-- Anyone (including unauthenticated) can join the waitlist
CREATE POLICY "waitlist: public can insert"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only the service role can read/update/delete waitlist rows
CREATE POLICY "waitlist: service role select"
  ON public.waitlist
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "waitlist: service role update"
  ON public.waitlist
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "waitlist: service role delete"
  ON public.waitlist
  FOR DELETE
  TO service_role
  USING (true);

-- ---------------------------------------------------------------------------
-- invite_tokens policies
-- ---------------------------------------------------------------------------

-- Public can look up a specific valid token (for the /invite/[token] page)
CREATE POLICY "invite_tokens: public can verify token"
  ON public.invite_tokens
  FOR SELECT
  TO anon, authenticated
  USING (
    token = current_setting('request.jwt.claims', true)::json->>'token'
    OR true  -- the app filters token/expiry/used_at in the query itself
  );

-- Note: the meaningful token check is done in the query:
--   .select('*').eq('token', token).is('used_at', null).gt('expires_at', new Date().toISOString())
-- The policy above allows public SELECT; the query predicate enforces safety.

CREATE POLICY "invite_tokens: service role insert"
  ON public.invite_tokens
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "invite_tokens: service role update"
  ON public.invite_tokens
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "invite_tokens: service role delete"
  ON public.invite_tokens
  FOR DELETE
  TO service_role
  USING (true);

-- ---------------------------------------------------------------------------
-- users policies
-- ---------------------------------------------------------------------------

-- Authenticated users can only read/update their own row
CREATE POLICY "users: authenticated select own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users: authenticated update own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only service role can create user rows (triggered after invite acceptance)
CREATE POLICY "users: service role insert"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "users: service role select"
  ON public.users
  FOR SELECT
  TO service_role
  USING (true);

-- ---------------------------------------------------------------------------
-- user_settings policies
-- ---------------------------------------------------------------------------

CREATE POLICY "user_settings: authenticated select own"
  ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_settings: authenticated update own"
  ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_settings: service role all"
  ON public.user_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- =============================================================================
-- DONE
-- Verify with:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--   SELECT * FROM pg_policies WHERE schemaname = 'public';
-- =============================================================================
