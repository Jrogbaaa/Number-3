-- First, ensure the execute_sql function exists
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate the user_preferences table with the correct type
DROP TABLE IF EXISTS public.user_preferences;
CREATE TABLE public.user_preferences (
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