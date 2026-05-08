-- Create users table (extends Clerk auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_preferences table (stores onboarding data)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'football',
  position TEXT,
  fitness_level TEXT NOT NULL,
  weeks_available INTEGER NOT NULL,
  days_per_week INTEGER NOT NULL,
  equipment TEXT[] NOT NULL DEFAULT '{}',
  injury TEXT NOT NULL,
  injury_details TEXT,
  goal TEXT NOT NULL,
  season_start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create training_plans table
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (clerk_id = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (clerk_id = auth.uid()::TEXT);

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::TEXT));

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::TEXT));

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::TEXT));

CREATE POLICY "Users can view own plans" ON training_plans
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::TEXT));

CREATE POLICY "Users can insert own plans" ON training_plans
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::TEXT));

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::TEXT));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_user_id ON training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
