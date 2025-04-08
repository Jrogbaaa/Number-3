-- Create migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS _migrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sql TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS migrations_name_idx ON _migrations(name);
CREATE INDEX IF NOT EXISTS migrations_executed_at_idx ON _migrations(executed_at);

-- Enable RLS on migrations table
ALTER TABLE _migrations ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage migrations
CREATE POLICY "Allow service role to manage migrations"
ON _migrations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add comment explaining the table's purpose
COMMENT ON TABLE _migrations IS 'Table for tracking database migrations'; 