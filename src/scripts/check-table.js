#!/usr/bin/env node

/**
 * This script checks if the user_preferences table exists in Supabase
 * Run with: node src/scripts/check-table.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

console.log('🔍 PROPS User Preferences Table Check 🔍');
console.log('=========================================\n');

// Check Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials:');
  if (!supabaseUrl) console.log('   - NEXT_PUBLIC_SUPABASE_URL not found');
  if (!supabaseKey) console.log('   - SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    // Check if table exists
    console.log('Checking if user_preferences table exists...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Error querying tables:', tablesError.message);
      process.exit(1);
    }
    
    const userPrefsTableExists = tables.some(t => t.table_name === 'user_preferences');
    
    if (userPrefsTableExists) {
      console.log('✅ user_preferences table exists!');
      
      // Check table structure
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'user_preferences')
        .eq('table_schema', 'public');
      
      if (columnsError) {
        console.log('❌ Error querying table structure:', columnsError.message);
      } else {
        console.log('\n📋 Table structure:');
        columns.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`);
        });
      }
    } else {
      console.log('❌ user_preferences table does not exist!');
      console.log('\n🛠️ Creating user_preferences table...');
      
      // Try to read the migration SQL file
      try {
        const migrationPath = path.join(process.cwd(), 'src', 'db', 'migrations', '003_create_user_preferences.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Found migration file, applying directly...');
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql: migrationSQL });
        
        if (sqlError) {
          console.log('❌ Error applying migration SQL:', sqlError.message);
          console.log('\nTrying to call RPC function...');
          
          // Fall back to RPC
          const { error: createError } = await supabase.rpc('create_user_preferences_table');
          
          if (createError) {
            console.log('❌ Error creating table:', createError.message);
            console.log('\nYou need to create the table manually or run the migration script:');
            console.log('node src/scripts/apply-migration.js');
          } else {
            console.log('✅ user_preferences table created successfully via RPC!');
          }
        } else {
          console.log('✅ user_preferences table created successfully via migration SQL!');
        }
      } catch (fsError) {
        console.log('❌ Could not read migration file:', fsError.message);
        
        // Try RPC as fallback
        const { error: createError } = await supabase.rpc('create_user_preferences_table');
        
        if (createError) {
          console.log('❌ Error creating table:', createError.message);
          console.log('\nYou need to create the table manually or run the migration script:');
          console.log('node src/scripts/apply-migration.js');
        } else {
          console.log('✅ user_preferences table created successfully via RPC!');
        }
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

main(); 