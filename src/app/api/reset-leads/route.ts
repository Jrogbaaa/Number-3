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
    
    // Delete all existing leads
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Use a valid UUID for filtering
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to reset leads: ${deleteError.message || JSON.stringify(deleteError)}` 
      }, { status: 500 });
    }
    
    // Create a test lead to validate the schema
    const { error: insertError } = await supabase
      .from('leads')
      .insert({
        name: 'SYSTEM_TEST_USER',
        email: 'system.test@example.com',
        company: 'System Test',
        title: 'Test',
        source: 'Website',
        status: 'New',
        score: 0,
        value: 0,
        linkedinUrl: 'https://linkedin.com/test',
        insights: null
      });
    
    if (insertError) {
      console.error('Insert error:', insertError);
      
      // Check if the error is about a missing column
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        return NextResponse.json({ 
          success: false, 
          error: `Database schema needs to be updated in Supabase. Please add the missing columns: ${insertError.message}` 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: `Failed to validate table structure: ${insertError.message}` 
      }, { status: 500 });
    }
    
    // Clean up the test user
    const { error: cleanupError } = await supabase
      .from('leads')
      .delete()
      .eq('email', 'system.test@example.com');
    
    if (cleanupError) {
      console.error('Cleanup error:', cleanupError);
      // Not failing the operation for cleanup errors
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