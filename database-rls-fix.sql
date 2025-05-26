-- Fix RLS policies to work with NextAuth instead of Supabase Auth
-- Run this in Supabase SQL Editor after the main database-fix.sql

-- 1. Disable RLS temporarily to test
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;

-- 3. Create simple policies that allow access based on user_id column
-- Since we're using NextAuth (not Supabase auth), we need different policies

-- Enable RLS back
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 4. Create policies that work with our setup
-- Allow service role to bypass RLS completely for now
CREATE POLICY "Service role can access all leads" ON leads
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can access all user_preferences" ON user_preferences
    FOR ALL TO service_role USING (true);

-- 5. Test query to make sure everything works
SELECT 
    user_id,
    has_completed_onboarding,
    current_onboarding_step,
    company_name
FROM user_preferences 
WHERE user_id = '117026041918704620390';

SELECT COUNT(*) as lead_count
FROM leads 
WHERE user_id = '117026041918704620390'; 