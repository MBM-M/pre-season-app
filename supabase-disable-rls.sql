-- COMPLETE RLS FIX - Disable RLS for development
-- This will completely disable Row Level Security for development with Clerk

-- Disable RLS on all tables (for development only!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS DISABLED for development';
  RAISE NOTICE 'All tables now allow full access';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables affected:';
  RAISE NOTICE '  - users';
  RAISE NOTICE '  - user_preferences';
  RAISE NOTICE '  - training_plans';
  RAISE NOTICE '  - subscriptions';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'NOTE: For production, you should enable';
  RAISE NOTICE 'RLS and create proper security policies';
  RAISE NOTICE '========================================';
END $$;
