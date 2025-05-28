-- Add website scraping fields to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS scraped_website_content TEXT,
ADD COLUMN IF NOT EXISTS scraped_linkedin_content TEXT;

-- Add comments for the new columns
COMMENT ON COLUMN user_preferences.website_url IS 'Company website URL provided during onboarding';
COMMENT ON COLUMN user_preferences.linkedin_url IS 'Company LinkedIn profile URL provided during onboarding';
COMMENT ON COLUMN user_preferences.scraped_website_content IS 'Scraped content from the company website for context';
COMMENT ON COLUMN user_preferences.scraped_linkedin_content IS 'Scraped content from the LinkedIn profile for context'; 