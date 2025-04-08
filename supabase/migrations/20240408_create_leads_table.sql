-- Drop existing table if it exists
DROP TABLE IF EXISTS leads;

-- Create leads table with exact column names
CREATE TABLE leads (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    company TEXT,
    title TEXT,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    score INTEGER NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_contacted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_score_idx ON leads(score);
CREATE INDEX IF NOT EXISTS leads_value_idx ON leads(value);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_source_idx ON leads(source); 