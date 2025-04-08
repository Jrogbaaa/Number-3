-- Add insights column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS insights JSONB DEFAULT NULL;

-- Add an index on the insights column for better query performance
CREATE INDEX IF NOT EXISTS leads_insights_idx ON leads USING GIN (insights);

-- Comment on the column to document its purpose
COMMENT ON COLUMN leads.insights IS 'JSON object containing analyzed insights about the lead, including topics, interests, and potential value'; 