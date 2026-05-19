-- Migration: add started_at to training_plans
--
-- Lets the app answer "what's today's workout?" by deriving the current week
-- from (now() - started_at). Existing rows are backfilled from created_at so
-- the historical plan is still navigable.
--
-- Run in Supabase dashboard → SQL Editor.

-- 1. Add the column (nullable so backfill can succeed)
ALTER TABLE public.training_plans
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- 2. Backfill existing rows from created_at
UPDATE public.training_plans
  SET started_at = created_at
  WHERE started_at IS NULL;

-- 3. Lock the column down: default to NOW() for new rows, not null going forward
ALTER TABLE public.training_plans
  ALTER COLUMN started_at SET DEFAULT NOW();

ALTER TABLE public.training_plans
  ALTER COLUMN started_at SET NOT NULL;

DO $$
BEGIN
  RAISE NOTICE 'started_at added to training_plans; backfilled from created_at';
END $$;
