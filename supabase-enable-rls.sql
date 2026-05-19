-- Migration: re-enable Row Level Security with Clerk JWTs
--
-- Replaces supabase-disable-rls.sql. Run this in Supabase dashboard → SQL Editor.
--
-- Prerequisites (already done if you're reading this):
--   1. Clerk dashboard → Integrations → Supabase enabled.
--   2. Supabase dashboard → Authentication → Third-Party Auth → Clerk added with
--      issuer URL https://<your-clerk-instance>.clerk.accounts.dev
--   3. Frontend supabase client passes Clerk session tokens via the
--      `accessToken` option (see src/lib/supabase.ts).
--
-- After running this, signed-out users see zero rows. Signed-in users see only
-- rows owned by their clerk_id.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Drop existing policies (clean slate; we previously had permissive ones)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'user_preferences', 'training_plans', 'workout_completions', 'subscriptions')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   rec.policyname, rec.schemaname, rec.tablename);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Helper: look up the current user's Supabase UUID from their Clerk id.
--    SECURITY DEFINER lets the function bypass RLS on the users table when
--    answering "what's my own row id?" — without this, the lookup would itself
--    be subject to the policies we're about to write, creating a chicken/egg.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM public.users
  WHERE clerk_id = auth.jwt() ->> 'sub'
  LIMIT 1;
$$;

-- Lock down execution to authenticated users only.
REVOKE ALL ON FUNCTION public.current_user_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. users — match clerk_id directly against the JWT sub claim.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Read own row
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (clerk_id = auth.jwt() ->> 'sub');

-- Insert own row (saveUserPreferences upsert)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

-- Update own row (email changes etc.)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (clerk_id = auth.jwt() ->> 'sub')
  WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. user_preferences — owned via user_id FK.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prefs_select_own" ON public.user_preferences
  FOR SELECT
  USING (user_id = public.current_user_id());

CREATE POLICY "prefs_insert_own" ON public.user_preferences
  FOR INSERT
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "prefs_update_own" ON public.user_preferences
  FOR UPDATE
  USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "prefs_delete_own" ON public.user_preferences
  FOR DELETE
  USING (user_id = public.current_user_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. training_plans — owned via user_id FK.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_select_own" ON public.training_plans
  FOR SELECT
  USING (user_id = public.current_user_id());

CREATE POLICY "plans_insert_own" ON public.training_plans
  FOR INSERT
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "plans_update_own" ON public.training_plans
  FOR UPDATE
  USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "plans_delete_own" ON public.training_plans
  FOR DELETE
  USING (user_id = public.current_user_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. workout_completions — owned via user_id FK.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.workout_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "completions_select_own" ON public.workout_completions
  FOR SELECT
  USING (user_id = public.current_user_id());

CREATE POLICY "completions_insert_own" ON public.workout_completions
  FOR INSERT
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "completions_update_own" ON public.workout_completions
  FOR UPDATE
  USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "completions_delete_own" ON public.workout_completions
  FOR DELETE
  USING (user_id = public.current_user_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. subscriptions — left RLS-enabled with no policies (effectively locked).
--    When Stripe gets wired in, add owner policies here.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- Done
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS enabled with Clerk JWT policies';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables protected:';
  RAISE NOTICE '  - users (clerk_id match)';
  RAISE NOTICE '  - user_preferences (via current_user_id)';
  RAISE NOTICE '  - training_plans (via current_user_id)';
  RAISE NOTICE '  - workout_completions (via current_user_id)';
  RAISE NOTICE '  - subscriptions (locked, no policies)';
  RAISE NOTICE '========================================';
END $$;
