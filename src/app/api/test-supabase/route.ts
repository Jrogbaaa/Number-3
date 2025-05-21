import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create a Supabase client with the same credentials used in your app
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Check if credentials exist
    const credentialStatus = {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseKey,
      serviceRoleKey: !!serviceRoleKey,
    };
    
    // Initialize the client with service role key if available (preferred for server operations)
    const supabase = createClient(
      supabaseUrl || '',
      serviceRoleKey || supabaseKey || ''
    );
    
    // Test a simple query
    const { data, error } = await supabase
      .from('leads')
      .select('count')
      .limit(1);
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        credentials: credentialStatus
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data,
      credentials: credentialStatus
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 