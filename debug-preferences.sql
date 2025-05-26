-- Debug query to check user preferences state
-- Run this in Supabase SQL Editor

-- 1. Check if user_preferences table exists and show its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
ORDER BY ordinal_position;

-- 2. Show all user_preferences records
SELECT * FROM user_preferences;

-- 3. Check specifically for the incognito user
SELECT 
    user_id,
    has_completed_onboarding,
    current_onboarding_step,
    company_name,
    created_at,
    updated_at
FROM user_preferences 
WHERE user_id = '117026041918704620390'
   OR user_id LIKE '%117026041918704620390%';

-- 4. Check if leads table exists and show its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- 5. Show all leads for the incognito user
SELECT * FROM leads WHERE user_id = '117026041918704620390';

-- 6. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('user_preferences', 'leads');

-- 7. Check if tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_preferences', 'leads'); 