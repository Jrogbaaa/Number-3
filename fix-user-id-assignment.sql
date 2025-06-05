-- Quick fix to assign existing leads to the current user account (handling duplicates)
-- This will transfer leads from user '105747573834147139856' to user '112891346719518200192'
-- but skip any that would create duplicate email constraints
-- Run this in your Supabase SQL Editor

-- First, let's see what we're working with
SELECT 
  user_id,
  COUNT(*) as lead_count,
  COUNT(CASE WHEN linkedinUrl IS NOT NULL AND linkedinUrl != '' THEN 1 END) as leads_with_linkedin_camelcase,
  COUNT(CASE WHEN linkedinurl IS NOT NULL AND linkedinurl != '' THEN 1 END) as leads_with_linkedin_lowercase
FROM leads 
GROUP BY user_id;

-- Update leads but only if they won't create email duplicates
UPDATE leads 
SET user_id = '112891346719518200192'
WHERE user_id = '105747573834147139856'
  AND email NOT IN (
    SELECT email 
    FROM leads 
    WHERE user_id = '112891346719518200192' 
    AND email IS NOT NULL 
    AND email != ''
  );

-- For leads with empty emails, we can safely update all of them since empty emails are allowed to duplicate
UPDATE leads 
SET user_id = '112891346719518200192'
WHERE user_id = '105747573834147139856'
  AND (email IS NULL OR email = '');

-- Verify the update
SELECT 
  user_id,
  COUNT(*) as lead_count,
  COUNT(CASE WHEN linkedinUrl IS NOT NULL AND linkedinUrl != '' THEN 1 END) as leads_with_linkedin_camelcase,
  COUNT(CASE WHEN linkedinurl IS NOT NULL AND linkedinurl != '' THEN 1 END) as leads_with_linkedin_lowercase
FROM leads 
GROUP BY user_id;

-- Show remaining leads that couldn't be transferred due to email conflicts
SELECT 
  COUNT(*) as remaining_old_user_leads,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_emails
FROM leads 
WHERE user_id = '105747573834147139856';

-- Show a sample of leads with LinkedIn URLs for the current user
SELECT 
  id,
  name,
  email,
  user_id,
  linkedinUrl,
  linkedinurl
FROM leads 
WHERE user_id = '112891346719518200192'
  AND ((linkedinUrl IS NOT NULL AND linkedinUrl != '') 
       OR (linkedinurl IS NOT NULL AND linkedinurl != ''))
LIMIT 5; 