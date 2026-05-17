-- Migration: workout_completions
--
-- One row per (user, plan, week, day) session that the athlete has marked
-- complete. The UNIQUE constraint makes mark/unmark idempotent and lets the
-- UI toggle via upsert/delete on the natural key.
--
-- Run this in Supabase dashboard → SQL Editor → New query.

CREATE TABLE IF NOT EXISTS workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  UNIQUE (user_id, plan_id, week_number, day)
);

-- Lookup paths used by the app: "all completions for this plan" and
-- "all completions for this user".
CREATE INDEX IF NOT EXISTS idx_workout_completions_plan ON workout_completions(plan_id);
CREATE INDEX IF NOT EXISTS idx_workout_completions_user ON workout_completions(user_id);

-- Match the dev posture of the rest of the schema (RLS off until Clerk JWT
-- integration lands; see supabase-disable-rls.sql).
ALTER TABLE workout_completions DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'workout_completions table created';
  RAISE NOTICE 'RLS disabled (dev mode)';
  RAISE NOTICE '========================================';
END $$;
