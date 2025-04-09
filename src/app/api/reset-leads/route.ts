import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET() {
  try {
    console.log('Starting emergency reset of leads table...');
    
    // First approach: Try to delete all records
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .neq('id', '');
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
      
      // Second approach: Try to truncate the table via SQL
      const { error: sqlError } = await supabase.rpc('run_sql_query', {
        query: 'TRUNCATE TABLE leads RESTART IDENTITY;'
      });
      
      if (sqlError) {
        console.error('SQL error:', sqlError);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to reset leads: ${sqlError.message || JSON.stringify(sqlError)}` 
        }, { status: 500 });
      }
    }
    
    // Verify the result
    const { count, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Verification error:', countError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Leads table has been reset successfully',
      remainingLeads: count || 0
    });
    
  } catch (error) {
    console.error('Error in reset API:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
} 