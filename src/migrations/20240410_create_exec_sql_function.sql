-- Create function to execute SQL statements
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

-- Add comment explaining the function's purpose
COMMENT ON FUNCTION public.exec_sql(text) IS 'Function for executing SQL statements during migrations. Only accessible to service role.'; 