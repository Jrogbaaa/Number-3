const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    // Read the migration file
    const migrationSql = fs.readFileSync(
      path.join(__dirname, 'src', 'migrations', '20240615_add_user_preferences.sql'), 
      'utf8'
    );
    
    console.log('Applying user_preferences migration...');
    console.log('Migration SQL content:', migrationSql.substring(0, 100) + '...');
    
    // First, check if the table already exists
    try {
      const { data, error: checkError } = await supabase
        .from('user_preferences')
        .select('count(*)', { count: 'exact', head: true });
        
      if (!checkError) {
        console.log('Table already exists, no need to run migration.');
        process.exit(0);
      }
    } catch (err) {
      console.log('Table check failed, proceeding with migration...');
    }

    // Try different approaches for applying migrations
    const approachResults = [];
    
    // Approach 1: Using execute_sql RPC function
    try {
      console.log('\nAttempt 1: Using execute_sql RPC function...');
      const { data, error } = await supabase.rpc('execute_sql', { sql: migrationSql });
      
      approachResults.push({
        approach: 'execute_sql',
        success: !error,
        error: error ? error.message : null,
        data
      });
      
      if (!error) {
        console.log('Success with execute_sql approach!');
      }
    } catch (err) {
      console.error('Exception with execute_sql approach:', err.message);
      approachResults.push({
        approach: 'execute_sql',
        success: false,
        error: err.message
      });
    }
    
    // Approach 2: Using exec_sql RPC function
    try {
      console.log('\nAttempt 2: Using exec_sql RPC function...');
      const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSql });
      
      approachResults.push({
        approach: 'exec_sql',
        success: !error,
        error: error ? error.message : null,
        data
      });
      
      if (!error) {
        console.log('Success with exec_sql approach!');
      }
    } catch (err) {
      console.error('Exception with exec_sql approach:', err.message);
      approachResults.push({
        approach: 'exec_sql',
        success: false,
        error: err.message
      });
    }
    
    // Approach 3: Using SQL via REST API
    try {
      console.log('\nAttempt 3: Using direct SQL API...');
      
      // Split SQL into individual statements
      const statements = migrationSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      // Execute each statement individually  
      for (const stmt of statements) {
        console.log(`Executing statement: ${stmt.substring(0, 50)}...`);
        
        // Try the most reliable approach - may or may not be supported by your Supabase instance
        const { error } = await supabase.auth.admin.executeSql(stmt + ';');
        
        if (error) {
          console.error('Error executing statement:', error);
          approachResults.push({
            approach: 'direct_sql',
            success: false,
            error: error.message
          });
          break;
        }
      }
      
      console.log('Successfully applied direct SQL statements');
      approachResults.push({
        approach: 'direct_sql',
        success: true
      });
    } catch (err) {
      console.error('Exception with direct SQL approach:', err.message);
      approachResults.push({
        approach: 'direct_sql',
        success: false,
        error: err.message
      });
    }
    
    // Verify the table exists after migration attempts
    try {
      console.log('\nVerifying if migration was successful...');
      const { data, error } = await supabase
        .from('user_preferences')
        .select('count(*)', { count: 'exact', head: true });
        
      if (error) {
        console.error('Verification failed, table does not exist:', error);
        console.log('\nSummary of migration attempts:');
        console.table(approachResults);
        console.log('\nMigration failed. Please check your Supabase database permissions.');
      } else {
        console.log('SUCCESS! user_preferences table exists and is accessible.');
        console.log('\nSummary of successful approaches:');
        console.table(approachResults.filter(r => r.success));
      }
    } catch (verifyErr) {
      console.error('Verification failed with exception:', verifyErr);
      console.log('\nSummary of migration attempts:');
      console.table(approachResults);
      console.log('\nMigration may have failed. Please check your Supabase database permissions.');
    }
    
  } catch (error) {
    console.error('Error in migration process:', error);
  }
}

applyMigration(); 