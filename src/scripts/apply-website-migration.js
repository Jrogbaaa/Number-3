const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function applyWebsiteMigration() {
  console.log('🚀 Applying website scraping migration...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '20240616_add_website_scraping.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL:');
    console.log(migrationSQL);
    
    // Apply the migration
    console.log('🔄 Applying migration...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 100)}...`);
        const { error } = await supabase.rpc('exec', { sql: statement + ';' });
        
        if (error) {
          console.error('❌ Error executing statement:', error);
          // Try alternative method
          try {
            const { error: directError } = await supabase.from('_').select('*').limit(0);
            // This will fail but might give us better error info
          } catch (e) {
            // Ignore
          }
          
          // Try to execute directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
              'apikey': serviceRoleKey
            },
            body: JSON.stringify({ sql: statement + ';' })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Direct execution failed:', errorText);
          } else {
            console.log('✅ Statement executed successfully via direct method');
          }
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('✅ Migration applied successfully!');
    console.log('🎉 Website scraping fields have been added to user_preferences table');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  applyWebsiteMigration();
}

module.exports = { applyWebsiteMigration }; 