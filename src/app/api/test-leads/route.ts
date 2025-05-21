import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create a Supabase client with the service role key (more powerful)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials',
        credentialsPresent: {
          supabaseUrl: !!supabaseUrl,
          serviceRoleKey: !!serviceRoleKey
        }
      }, { status: 500 });
    }
    
    // Initialize the client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    console.log('Attempting to fetch leads from Supabase...');
    
    // Try to get leads
    const { data, error, count } = await supabase
      .from('leads')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        code: error.code
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      count: count,
      leadsFound: (data || []).length,
      firstLead: data && data.length > 0 ? data[0] : null
    });
  } catch (err) {
    const error = err as Error;
    console.error('Unexpected error testing leads:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 