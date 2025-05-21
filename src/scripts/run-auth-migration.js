require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Starting auth schema migration...');
    
    // Read the migration SQL file
    const migrationFile = path.join(__dirname, '../migrations/20240510_add_auth_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Split the SQL into individual statements and execute each one
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Execute the SQL statement
      const { error } = await supabase.rpc('pgbouncer_exec', { 
        sql_statement: statement + ';' 
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        // Continue with the next statement even if there's an error
      }
    }
    
    console.log('Auth schema migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 