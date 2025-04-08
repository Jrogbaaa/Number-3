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

-- Add modified_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'modified_at'
    ) THEN
        ALTER TABLE leads ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
    END IF;
END $$;

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_leads_modified_at ON leads;

-- Create trigger for modified_at column
CREATE TRIGGER update_leads_modified_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column(); 