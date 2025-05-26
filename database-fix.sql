-- Fix database schema and user onboarding status
-- Run this in Supabase SQL Editor

-- 1. First, let's check if the user_preferences table exists and create it if needed
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    current_onboarding_step INTEGER DEFAULT 1,
    company_name TEXT,
    company_product TEXT,
    target_demographics JSONB DEFAULT '{}',
    target_roles TEXT[],
    target_company_sizes TEXT[],
    target_industries TEXT[],
    custom_scoring_weights JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add any missing columns to existing user_preferences table (safe to run even if columns exist)
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS current_onboarding_step INTEGER DEFAULT 1;

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS company_product TEXT;

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS target_demographics JSONB DEFAULT '{}';

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS target_roles TEXT[];

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS target_company_sizes TEXT[];

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS target_industries TEXT[];

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS custom_scoring_weights JSONB DEFAULT '{}';

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Fix the incognito user's onboarding status
INSERT INTO user_preferences (
    user_id,
    has_completed_onboarding,
    current_onboarding_step,
    company_name,
    created_at,
    updated_at
) VALUES (
    '117026041918704620390',
    TRUE,
    6,
    'OptiLeads User',
    NOW(),
    NOW()
) ON CONFLICT (user_id) 
DO UPDATE SET 
    has_completed_onboarding = TRUE,
    current_onboarding_step = 6,
    company_name = 'OptiLeads User',
    updated_at = NOW();

-- 4. Check if leads table exists and create it if needed
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    title TEXT,
    phone TEXT,
    linkedinUrl TEXT,
    source TEXT DEFAULT 'Other',
    status TEXT DEFAULT 'New',
    score INTEGER DEFAULT 0,
    value NUMERIC DEFAULT 0,
    location TEXT,
    timezone TEXT,
    optimal_outreach_time TEXT,
    optimal_outreach_time_eastern TEXT,
    outreach_reason TEXT,
    insights JSONB,
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    
    -- Create unique constraint on email per user
    UNIQUE(user_id, email)
);

-- 5. Add any missing columns to leads table (safe to run even if columns exist)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS linkedinUrl TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS optimal_outreach_time TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS optimal_outreach_time_eastern TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS insights JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 7. Enable Row Level Security (RLS) if not already enabled
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for leads table
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
CREATE POLICY "Users can view their own leads" ON leads
    FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- 9. Create RLS policies for user_preferences table  
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- 10. Verify the fix worked
SELECT 
    user_id,
    has_completed_onboarding,
    current_onboarding_step,
    company_name,
    created_at
FROM user_preferences 
WHERE user_id = '117026041918704620390';

-- 11. Check leads count for the user
SELECT COUNT(*) as lead_count
FROM leads 
WHERE user_id = '117026041918704620390'; 