-- Add advanced scoring columns to the leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS marketing_score INTEGER,
ADD COLUMN IF NOT EXISTS budget_potential INTEGER,
ADD COLUMN IF NOT EXISTS budget_confidence TEXT,
ADD COLUMN IF NOT EXISTS business_orientation TEXT,
ADD COLUMN IF NOT EXISTS orientation_confidence TEXT,
ADD COLUMN IF NOT EXISTS intent_score INTEGER,
ADD COLUMN IF NOT EXISTS spend_authority_score INTEGER,
ADD COLUMN IF NOT EXISTS optimal_outreach_time_eastern TEXT;

-- Add indexes for the new scoring columns
CREATE INDEX IF NOT EXISTS leads_marketing_score_idx ON leads(marketing_score);
CREATE INDEX IF NOT EXISTS leads_budget_potential_idx ON leads(budget_potential);
CREATE INDEX IF NOT EXISTS leads_business_orientation_idx ON leads(business_orientation);
CREATE INDEX IF NOT EXISTS leads_intent_score_idx ON leads(intent_score);
CREATE INDEX IF NOT EXISTS leads_spend_authority_score_idx ON leads(spend_authority_score);

-- Add comments for documentation
COMMENT ON COLUMN leads.marketing_score IS 'Score (0-100) indicating marketing focus based on role, company, behavior';
COMMENT ON COLUMN leads.budget_potential IS 'Score (0-100) estimating potential budget size';
COMMENT ON COLUMN leads.budget_confidence IS 'Confidence level (Low/Medium/High) for budget estimate';
COMMENT ON COLUMN leads.business_orientation IS 'Business focus classification (B2B/B2C/Mixed/Unknown)';
COMMENT ON COLUMN leads.orientation_confidence IS 'Confidence level (Low/Medium/High) for business orientation';
COMMENT ON COLUMN leads.intent_score IS 'Score (0-100) indicating purchase intent signals';
COMMENT ON COLUMN leads.spend_authority_score IS 'Score (0-100) indicating decision-making authority';
COMMENT ON COLUMN leads.optimal_outreach_time_eastern IS 'Suggested outreach time window converted to Eastern Time'; 