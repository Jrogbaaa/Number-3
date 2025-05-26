const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function migrateDatabase() {
  try {
    console.log('Starting user_id migration');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log('Connected to Supabase');
    
    // Get migration SQL
    const fs = require('fs');
    const path = require('path');
    const migrationSql = fs.readFileSync(path.join(__dirname, '../migrations/add_user_id_to_leads.sql'), 'utf8');
    console.log('Read migration SQL file');
    
    // Execute SQL using RPC function
    console.log('Executing migration - this may take a moment...');
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: migrationSql });
    
    if (error) {
      console.error('Error executing migration:', error);
      return;
    }
    
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrateDatabase(); 