-- Emergency lead table reset script
-- Run this in the Supabase SQL Editor

-- Truncate the leads table (completely removes all data but keeps the table structure)
TRUNCATE TABLE leads RESTART IDENTITY;

-- Verify the deletion
SELECT COUNT(*) FROM leads; 