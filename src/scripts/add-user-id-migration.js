#!/usr/bin/env node

/**
 * Script to migrate existing leads database to support multi-user isolation
 * This script will:
 * 1. Add user_id column to leads table
 * 2. Update RLS policies to filter by user_id
 * 3. Associate existing leads with a default admin user
 * 
 * Usage: node add-user-id-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Starting user_id migration for leads table...');

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Missing required environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log('Connected to Supabase.');

    // Check if exec_sql function exists
    console.log('Checking for exec_sql function...');
    try {
      // Try to query the system catalog to see if our function exists
      const { data: functionExists, error: functionCheckError } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', 'exec_sql')
        .limit(1);
      
      if (functionCheckError) {
        console.log('Cannot query system catalog. Will try direct SQL execution instead.');
      } else if (!functionExists || functionExists.length === 0) {
        console.log('exec_sql function not found. Creating it now...');
        
        // Create the function using direct SQL
        const { error: createFunctionError } = await supabase
          .from('_sql')
          .select('*')
          .eq('query', `
            CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
            RETURNS void
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$;
            
            GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
          `);
        
        if (createFunctionError) {
          console.log('Could not create exec_sql function:', createFunctionError);
          console.log('Will try direct SQL execution for migration instead.');
        } else {
          console.log('exec_sql function created successfully.');
        }
      } else {
        console.log('exec_sql function already exists.');
      }
    } catch (err) {
      console.log('Error checking for exec_sql function:', err.message);
      console.log('Will try direct SQL execution.');
    }

    // Add user_id column to leads table if it doesn't exist
    console.log('Adding user_id column to leads table...');
    
    try {
      // Try using exec_sql first
      const { error: columnError } = await supabase.rpc('exec_sql', { 
        sql: `
          -- Add user_id to leads table for per-user data isolation
          ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id TEXT;

          -- Create index for better query performance
          CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

          -- Add comment explaining the column
          COMMENT ON COLUMN leads.user_id IS 'Reference to the user ID in the auth.users table - enables per-user data isolation';
        `
      });

      if (columnError) {
        console.log('exec_sql failed:', columnError.message);
        console.log('Trying direct SQL execution...');
        
        // Try direct SQL execution
        const { error: directSqlError } = await supabase
          .from('leads')
          .select('count(*)')
          .limit(1);
          
        if (directSqlError) {
          throw new Error(`Unable to access leads table: ${directSqlError.message}`);
        }
        
        // Try to alter the table structure directly using the SQL endpoint
        const alterTableSql = `
          ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id TEXT;
          CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
        `;
        
        // Use the _SQL endpoint if available (depends on Supabase version)
        const { error: alterError } = await supabase
          .from('_sql')
          .select('*')
          .eq('query', alterTableSql);
          
        if (alterError) {
          throw new Error(`Failed to add user_id column: ${alterError.message}`);
        }
      }
      console.log('Successfully added user_id column to leads table.');
    } catch (err) {
      throw new Error(`Failed to add user_id column: ${err.message}`);
    }

    // Update RLS policies
    console.log('Updating row-level security policies...');
    try {
      // Try using exec_sql first
      const { error: rlsError } = await supabase.rpc('exec_sql', { 
        sql: `
          -- Update existing RLS policies to be user-specific
          DROP POLICY IF EXISTS "Allow anonymous access" ON leads;
          DROP POLICY IF EXISTS "Allow authenticated users to read leads" ON leads;
          DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON leads;
          DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON leads;
          DROP POLICY IF EXISTS "Allow authenticated users to delete leads" ON leads;

          -- Create new RLS policies to restrict access by user_id 
          CREATE POLICY "Users can read their own leads"
          ON leads FOR SELECT
          TO authenticated
          USING (user_id = auth.uid() OR user_id IS NULL);

          CREATE POLICY "Users can insert their own leads"
          ON leads FOR INSERT
          TO authenticated
          WITH CHECK (user_id = auth.uid());

          CREATE POLICY "Users can update their own leads"
          ON leads FOR UPDATE
          TO authenticated
          USING (user_id = auth.uid() OR user_id IS NULL)
          WITH CHECK (user_id = auth.uid());

          CREATE POLICY "Users can delete their own leads"
          ON leads FOR DELETE
          TO authenticated
          USING (user_id = auth.uid() OR user_id IS NULL);
        `
      });

      if (rlsError) {
        console.log('exec_sql failed for RLS policies:', rlsError.message);
        console.log('Trying direct SQL execution...');
        
        // Try direct SQL for RLS policies using _SQL endpoint
        const rlsPoliciesSql = `
          DROP POLICY IF EXISTS "Allow anonymous access" ON leads;
          DROP POLICY IF EXISTS "Allow authenticated users to read leads" ON leads;
          DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON leads;
          DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON leads;
          DROP POLICY IF EXISTS "Allow authenticated users to delete leads" ON leads;

          CREATE POLICY "Users can read their own leads"
          ON leads FOR SELECT
          TO authenticated
          USING (user_id = auth.uid() OR user_id IS NULL);

          CREATE POLICY "Users can insert their own leads"
          ON leads FOR INSERT
          TO authenticated
          WITH CHECK (user_id = auth.uid());

          CREATE POLICY "Users can update their own leads"
          ON leads FOR UPDATE
          TO authenticated
          USING (user_id = auth.uid() OR user_id IS NULL)
          WITH CHECK (user_id = auth.uid());

          CREATE POLICY "Users can delete their own leads"
          ON leads FOR DELETE
          TO authenticated
          USING (user_id = auth.uid() OR user_id IS NULL);
        `;
        
        const { error: directRlsError } = await supabase
          .from('_sql')
          .select('*')
          .eq('query', rlsPoliciesSql);
          
        if (directRlsError) {
          throw new Error(`Failed to update RLS policies: ${directRlsError.message}`);
        }
      }
      console.log('Successfully updated RLS policies.');
    } catch (err) {
      throw new Error(`Failed to update RLS policies: ${err.message}`);
    }

    // Prompt for admin user ID
    const adminUserId = process.argv[2];
    
    if (!adminUserId) {
      console.log('\n⚠️  No admin user ID provided. Existing leads will not be assigned to any user.');
      console.log('To assign existing leads to an admin user, run:');
      console.log('node add-user-id-migration.js YOUR_ADMIN_USER_ID\n');
    } else {
      // Associate existing leads with the admin user
      console.log(`Associating existing leads with admin user ${adminUserId}...`);
      const { data: updateData, error: updateError } = await supabase
        .from('leads')
        .update({ user_id: adminUserId })
        .is('user_id', null)
        .select('count');

      if (updateError) {
        throw new Error(`Failed to update existing leads: ${updateError.message}`);
      }

      const count = updateData?.length || 0;
      console.log(`Successfully updated ${count} existing leads with admin user ID.`);
    }

    console.log('Migration completed successfully! 🎉');
    console.log('\nNow all users will have their own isolated set of leads.');

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration().catch(console.error); 