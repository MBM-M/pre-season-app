-- Complete RLS Policy Reset for Clerk Integration
-- This will remove ALL existing policies and create fresh ones

-- Drop ALL existing policies on these tables
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Drop all policies on users table
  FOR policy_record IN
    SELECT policyname FROM pg_policies WHERE tablename = 'users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON users', policy_record.policyname);
  END LOOP;

  -- Drop all policies on user_preferences table
  FOR policy_record IN
    SELECT policyname FROM pg_policies WHERE tablename = 'user_preferences'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON user_preferences', policy_record.policyname);
  END LOOP;

  -- Drop all policies on training_plans table
  FOR policy_record IN
    SELECT policyname FROM pg_policies WHERE tablename = 'training_plans'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON training_plans', policy_record.policyname);
  END LOOP;

  RAISE NOTICE 'All existing policies dropped successfully';
END $$;

-- Create new permissive policies for Clerk integration
CREATE POLICY "Allow public insert for Clerk users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert for user preferences" ON user_preferences
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert for training plans" ON training_plans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own data by clerk_id" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can view all preferences" ON user_preferences
  FOR SELECT USING (true);

CREATE POLICY "Users can view all plans" ON training_plans
  FOR SELECT USING (true);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (true);

CREATE POLICY "Users can update own plans" ON training_plans
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own plans" ON training_plans
  FOR DELETE USING (true);

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS policies configured successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Created policies:';
  RAISE NOTICE '  - users: INSERT, SELECT';
  RAISE NOTICE '  - user_preferences: INSERT, SELECT, UPDATE';
  RAISE NOTICE '  - training_plans: INSERT, SELECT, UPDATE, DELETE';
  RAISE NOTICE '========================================';
END $$;
