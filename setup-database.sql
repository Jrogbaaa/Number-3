-- Create the leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  company TEXT,
  title TEXT,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  value INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  insights JSONB
);

-- Create index on common search fields
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);

-- Set up row-level security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Public leads read access" ON leads;
DROP POLICY IF EXISTS "Public leads insert access" ON leads;
DROP POLICY IF EXISTS "Public leads update access" ON leads;
DROP POLICY IF EXISTS "Public leads delete access" ON leads;
DROP POLICY IF EXISTS "Anonymous users cannot access leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON leads;
DROP POLICY IF EXISTS "Public leads delete access" ON leads;
DROP POLICY IF EXISTS "Public leads insert access" ON leads;
DROP POLICY IF EXISTS "Allow anonymous access" ON leads;

-- Create a single simple policy for anonymous access
CREATE POLICY "Allow anonymous access" ON leads
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE leads IS 'Customer leads and prospects';
COMMENT ON COLUMN leads.id IS 'Unique identifier for the lead';
COMMENT ON COLUMN leads.name IS 'Full name of the lead';
COMMENT ON COLUMN leads.email IS 'Email address (used as unique identifier)';
COMMENT ON COLUMN leads.company IS 'Company or organization name';
COMMENT ON COLUMN leads.title IS 'Job title or position';
COMMENT ON COLUMN leads.source IS 'Lead acquisition source';
COMMENT ON COLUMN leads.status IS 'Current status in the sales pipeline';
COMMENT ON COLUMN leads.score IS 'Lead score (0-100)';
COMMENT ON COLUMN leads.value IS 'Estimated value in currency';
COMMENT ON COLUMN leads.created_at IS 'When the lead was created';
COMMENT ON COLUMN leads.last_contacted_at IS 'When the lead was last contacted';
COMMENT ON COLUMN leads.insights IS 'Additional insights and analysis about the lead'; 