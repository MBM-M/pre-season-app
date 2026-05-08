-- Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own plans" ON training_plans;

-- Create more permissive policies for development with Clerk
-- These allow inserts from the client side using anon key
CREATE POLICY "Allow public insert for Clerk users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert for user preferences" ON user_preferences
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert for training plans" ON training_plans
  FOR INSERT WITH CHECK (true);

-- Update select policies to work with clerk_id
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view own plans" ON training_plans;

CREATE POLICY "Users can view their own data by clerk_id" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can view all preferences" ON user_preferences
  FOR SELECT USING (true);

CREATE POLICY "Users can view all plans" ON training_plans
  FOR SELECT USING (true);
