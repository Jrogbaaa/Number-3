const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Get the migration file path from command line argument or use the default
    const migrationFile = process.argv[2] || '20240510_add_scoring_columns.sql';
    const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
    
    console.log(`Running migration from file: ${migrationPath}`);

    // Read the migration SQL file
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('SQL migration loaded successfully:');
    console.log('-'.repeat(50));
    console.log(sql.substring(0, 300) + (sql.length > 300 ? '...' : '')); // Preview the SQL
    console.log('-'.repeat(50));

    // Execute the SQL with rpc - using the correct function name and parameter name
    console.log('Executing migration...');
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });

    if (error) {
      console.error('Migration failed:', error);
      throw error;
    }

    console.log('Migration completed successfully!');
    
    // Alternative approach: Query a sample lead to check if the columns exist
    try {
      console.log('Verifying migration by fetching a sample lead...');
      const { data: sampleLead, error: sampleError } = await supabase
        .from('leads')
        .select('*')
        .limit(1)
        .single();
      
      if (sampleError) {
        console.error('Warning: Could not fetch a sample lead to verify columns:', sampleError);
      } else {
        console.log('Sample lead retrieved, available columns:');
        console.log(Object.keys(sampleLead));
        
        // Check for the new columns in the lead
        const migrationColumns = [
          'marketing_score', 
          'budget_potential',
          'budget_confidence',
          'business_orientation',
          'orientation_confidence',
          'intent_score',
          'spend_authority_score',
          'optimal_outreach_time_eastern'
        ];
        
        const existingColumns = Object.keys(sampleLead);
        const missingColumns = migrationColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.warn('WARNING: Some columns may not have been added:', missingColumns);
        } else {
          console.log('All expected columns added successfully');
        }
      }
    } catch (verifyError) {
      console.error('Warning: Error during verification step (non-critical):', verifyError);
      console.log('Continuing with the migration process...');
    }
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 