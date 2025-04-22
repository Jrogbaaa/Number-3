-- Add new columns for location, timezone, and optimal outreach time
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS optimal_outreach_time TEXT,
ADD COLUMN IF NOT EXISTS outreach_reason TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS leads_location_idx ON leads(location);
CREATE INDEX IF NOT EXISTS leads_timezone_idx ON leads(timezone); 