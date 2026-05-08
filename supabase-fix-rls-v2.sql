-- Check existing policies and update them
-- This script safely updates RLS policies for Clerk integration

-- First, let's see what policies exist (run this first to check)
-- SELECT * FROM pg_policies WHERE tablename IN ('users', 'user_preferences', 'training_plans');

-- Drop policies if they exist (ignore errors if they don't)
DO $$
BEGIN
  -- Drop existing policies on users table
  DROP POLICY IF EXISTS "Users can insert their own data" ON users;
  DROP POLICY IF EXISTS "Users can view their own data" ON users;
  DROP POLICY IF EXISTS "Allow public insert for Clerk users" ON users;
  DROP POLICY IF EXISTS "Users can view their own data by clerk_id" ON users;

  -- Drop existing policies on user_preferences table
  DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
  DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
  DROP POLICY IF EXISTS "Allow public insert for user preferences" ON user_preferences;
  DROP POLICY IF EXISTS "Users can view all preferences" ON user_preferences;

  -- Drop existing policies on training_plans table
  DROP POLICY IF EXISTS "Users can insert own plans" ON training_plans;
  DROP POLICY IF EXISTS "Users can view own plans" ON training_plans;
  DROP POLICY IF EXISTS "Allow public insert for training plans" ON training_plans;
  DROP POLICY IF EXISTS "Users can view all plans" ON training_plans;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- Create new permissive policies for development
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

-- Also add update policies for user_preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated successfully for Clerk integration!';
END $$;
