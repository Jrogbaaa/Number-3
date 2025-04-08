-- Create the update_modified_column function with explicit search path
CREATE OR REPLACE FUNCTION public.update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = CURRENT_TIMESTAMP;
    RETURN NEW;   
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Drop existing table if it exists (be careful with this in production!)
DROP TABLE IF EXISTS leads;

-- Create leads table with all necessary columns
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    company TEXT,
    title TEXT,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    score INTEGER NOT NULL,
    value INTEGER NOT NULL,
    insights JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_contacted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_score_idx ON leads(score);
CREATE INDEX IF NOT EXISTS leads_value_idx ON leads(value);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_source_idx ON leads(source);
CREATE INDEX IF NOT EXISTS leads_insights_idx ON leads USING GIN (insights);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON leads;
DROP POLICY IF EXISTS "Anonymous users cannot access leads" ON leads;

-- Create more permissive policies for authenticated users
CREATE POLICY "Authenticated users can view leads"
    ON leads FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert leads"
    ON leads FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
    ON leads FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete leads"
    ON leads FOR DELETE
    TO authenticated
    USING (true);

-- Create restrictive policy for anonymous users
CREATE POLICY "Anonymous users cannot access leads"
    ON leads FOR ALL
    TO anon
    USING (false);

-- Create trigger for modified_at column
CREATE TRIGGER update_leads_modified_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

-- Add comments to document the table and its columns
COMMENT ON TABLE leads IS 'Table storing lead information and insights';
COMMENT ON COLUMN leads.insights IS 'JSON column storing analyzed insights about the lead including topics, interests, and potential value'; 