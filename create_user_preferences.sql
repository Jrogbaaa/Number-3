-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  has_completed_onboarding BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 1,
  company_name TEXT,
  company_industry TEXT,
  company_size TEXT,
  company_product TEXT,
  target_roles TEXT[] DEFAULT '{}',
  target_demographics JSONB DEFAULT '{}',
  target_company_sizes TEXT[] DEFAULT '{}',
  target_industries TEXT[] DEFAULT '{}',
  custom_scoring_weights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id)
);

-- Add RLS (Row Level Security) policy to restrict access
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own preferences
DROP POLICY IF EXISTS "Users can read their own preferences" ON public.user_preferences;
CREATE POLICY "Users can read their own preferences" 
  ON public.user_preferences
  FOR SELECT 
  USING (user_id = auth.uid()::text);

-- Allow users to insert their own preferences
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert their own preferences" 
  ON public.user_preferences
  FOR INSERT 
  WITH CHECK (user_id = auth.uid()::text);

-- Allow users to update their own preferences
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences
  FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Create a service role policy to allow your application to access user data
DROP POLICY IF EXISTS "Service role can access all user preferences" ON public.user_preferences;
CREATE POLICY "Service role can access all user preferences"
  ON public.user_preferences
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE user_preferences IS 'Stores user onboarding preferences that affect lead scoring';
COMMENT ON COLUMN user_preferences.user_id IS 'Reference to the user ID';
COMMENT ON COLUMN user_preferences.company_name IS 'User company name';
COMMENT ON COLUMN user_preferences.company_industry IS 'Industry the user company operates in';
COMMENT ON COLUMN user_preferences.company_size IS 'Size category of the user company';
COMMENT ON COLUMN user_preferences.company_product IS 'Main product or service the user company provides';
COMMENT ON COLUMN user_preferences.target_roles IS 'JSON array of job roles the user wants to target';
COMMENT ON COLUMN user_preferences.target_demographics IS 'JSON object with demographic preferences like gender, age, etc.';
COMMENT ON COLUMN user_preferences.target_company_sizes IS 'JSON array of company sizes the user wants to target';
COMMENT ON COLUMN user_preferences.target_industries IS 'JSON array of industries the user wants to target';
COMMENT ON COLUMN user_preferences.custom_scoring_weights IS 'JSON object with custom weights for different scoring components';
COMMENT ON COLUMN user_preferences.has_completed_onboarding IS 'Indicates if the user has completed the onboarding process';
COMMENT ON COLUMN user_preferences.onboarding_step IS 'Tracks the current step in the onboarding process';

-- Create execute_sql function if it doesn't exist
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$; 