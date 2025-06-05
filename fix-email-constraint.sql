-- Fix Email Constraint Issue
-- This script changes the email constraint from global to per-user
-- Run this in the Supabase SQL Editor

-- Step 1: Drop the existing global unique constraint on email
-- This is the constraint causing the "duplicate key value violates unique constraint leads_email_key" error
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_email_key;

-- Step 2: Drop the old unique index if it exists  
DROP INDEX IF EXISTS leads_email_key;

-- Step 3: Create a partial unique index on (user_id, email) combination
-- This allows the same email to exist for different users, but prevents 
-- the same user from having duplicate emails
-- We exclude empty/null emails from the constraint since multiple leads can have empty emails
CREATE UNIQUE INDEX IF NOT EXISTS leads_user_email_unique_idx 
  ON leads(user_id, email) 
  WHERE email IS NOT NULL AND email != '';

-- Step 4: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id_email ON leads(user_id, email);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL AND email != '';

-- Step 5: Verify the change - check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'leads'
  AND indexname LIKE '%email%'
ORDER BY indexname;

-- Step 6: Check remaining constraints
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'leads' 
  AND constraint_type = 'UNIQUE'
ORDER BY constraint_name;

-- Step 7: Test that the constraint works correctly
-- This should succeed (same email, different users)
-- Note: Replace 'user1' and 'user2' with actual user IDs for testing
-- INSERT INTO leads (user_id, name, email, company, title, source, status, score, value) 
-- VALUES 
--   ('user1', 'Test User 1', 'test@example.com', 'Company A', 'Manager', 'Website', 'New', 0, 0),
--   ('user2', 'Test User 2', 'test@example.com', 'Company B', 'Director', 'LinkedIn', 'New', 0, 0);

-- Step 8: This should succeed (multiple leads with empty emails for same user)
-- INSERT INTO leads (user_id, name, email, company, title, source, status, score, value) 
-- VALUES 
--   ('user1', 'No Email Lead 1', '', 'Company X', 'Manager', 'Website', 'New', 0, 0),
--   ('user1', 'No Email Lead 2', '', 'Company Y', 'Director', 'LinkedIn', 'New', 0, 0);

-- Step 9: This should fail (same email, same user)
-- INSERT INTO leads (user_id, name, email, company, title, source, status, score, value) 
-- VALUES ('user1', 'Duplicate Test', 'test@example.com', 'Company C', 'VP', 'Cold Call', 'New', 0, 0);

-- Step 10: Clean up test data (uncomment if you ran the test inserts)
-- DELETE FROM leads WHERE email = 'test@example.com' OR email = ''; 