const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
  try {
    console.log('Checking if user_preferences table exists...');
    
    // Try a simple query to check if table exists
    const { data, error, status, statusText } = await supabase
      .from('user_preferences')
      .select('count(*)', { count: 'exact', head: true });
      
    console.log('Query status:', status, statusText);
    
    if (error) {
      console.error('Error checking table:', error);
      
      if (error.code === 'PGRST301') {
        console.log('Table does not exist - need to create it');
      }
    } else {
      console.log('Table exists! Count result:', data);
    }
    
    // Also check information_schema.tables
    console.log('\nChecking information_schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (schemaError) {
      console.error('Error checking information_schema:', schemaError);
    } else {
      console.log('Available tables in public schema:');
      if (schemaData && schemaData.length > 0) {
        schemaData.forEach(table => console.log(`- ${table.table_name}`));
        
        // Check if our table is in the list
        const hasUserPrefsTable = schemaData.some(
          table => table.table_name === 'user_preferences'
        );
        
        console.log(`\nuser_preferences table exists: ${hasUserPrefsTable}`);
      } else {
        console.log('No tables found in public schema');
      }
    }
    
    // Try to run a raw SQL query if we have access
    try {
      console.log('\nAttempting to use Supabase Storage API as diagnostic...');
      // Just checking if we have valid credentials by using a different API
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
        
      if (bucketsError) {
        console.error('Storage bucket listing error:', bucketsError);
      } else {
        console.log('Storage bucket access works, authentication is valid!');
        console.log('Available buckets:', buckets.map(b => b.name).join(', ') || 'none');
      }
    } catch (apiError) {
      console.error('Storage API error:', apiError);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTable(); 