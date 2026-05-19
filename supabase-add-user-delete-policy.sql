-- Migration: allow users to delete their own users row
--
-- Required for in-app account deletion (Apple App Store mandate on iOS 16+).
-- Deleting the users row cascades through every dependent table thanks to the
-- ON DELETE CASCADE foreign keys defined in supabase-schema.sql:
--   - user_preferences
--   - training_plans
--   - workout_completions
--   - subscriptions

CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE
  USING (clerk_id = auth.jwt() ->> 'sub');

DO $$
BEGIN
  RAISE NOTICE 'users_delete_own policy added';
END $$;
