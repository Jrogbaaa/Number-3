-- Add user_id to leads table for per-user data isolation
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

-- Update existing RLS policies to be user-specific
DROP POLICY IF EXISTS "Allow anonymous access" ON leads;
DROP POLICY IF EXISTS "Allow authenticated users to read leads" ON leads;
DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON leads;
DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON leads;
DROP POLICY IF EXISTS "Allow authenticated users to delete leads" ON leads;

-- Create new RLS policies to restrict access by user_id with proper type casting
CREATE POLICY "Users can read their own leads"
ON leads FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Users can insert their own leads"
ON leads FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own leads"
ON leads FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text OR user_id IS NULL)
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own leads"
ON leads FOR DELETE
TO authenticated
USING (user_id = auth.uid()::text OR user_id IS NULL);

-- Update any existing rows to associate with the system admin user
-- This is a placeholder - in production you would need to decide how to handle existing data
UPDATE leads 
SET user_id = 'system_admin'
WHERE user_id IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN leads.user_id IS 'Reference to the user ID in the auth.users table - enables per-user data isolation. Stored as TEXT to match auth.uid()::text'; 