-- Enable RLS on leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all leads
CREATE POLICY "Allow authenticated users to read leads"
ON leads FOR SELECT
TO authenticated
USING (true);

-- Create policy for authenticated users to insert their own leads
CREATE POLICY "Allow authenticated users to insert leads"
ON leads FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy for authenticated users to update leads
CREATE POLICY "Allow authenticated users to update leads"
ON leads FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy for authenticated users to delete leads
CREATE POLICY "Allow authenticated users to delete leads"
ON leads FOR DELETE
TO authenticated
USING (true);

-- Create policy for anon users to read leads (if needed)
CREATE POLICY "Allow anonymous users to read leads"
ON leads FOR SELECT
TO anon
USING (true);

-- Add comment explaining the policies
COMMENT ON TABLE leads IS 'Table storing lead information with RLS policies allowing authenticated users full access and anonymous users read-only access.'; 