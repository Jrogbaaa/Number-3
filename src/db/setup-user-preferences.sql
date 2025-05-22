-- Setup user_preferences table
-- Run this in Supabase SQL Editor

-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  company_name TEXT,
  company_size TEXT,
  industry TEXT,
  target_location TEXT,
  target_industries TEXT[] DEFAULT '{}',
  target_company_sizes TEXT[] DEFAULT '{}',
  target_roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add row level security policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own preferences
DROP POLICY IF EXISTS user_preferences_select_policy ON user_preferences;
CREATE POLICY user_preferences_select_policy ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own preferences
DROP POLICY IF EXISTS user_preferences_insert_policy ON user_preferences;
CREATE POLICY user_preferences_insert_policy ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own preferences
DROP POLICY IF EXISTS user_preferences_update_policy ON user_preferences;
CREATE POLICY user_preferences_update_policy ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a helper function to ensure consistency in creating default user preferences
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences for new users
DROP TRIGGER IF EXISTS create_user_preferences_on_signup ON auth.users;
CREATE TRIGGER create_user_preferences_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_preferences(); 