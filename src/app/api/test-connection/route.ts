import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Define the diagnostics type to include pingStatus
type DiagnosticsInfo = {
  envVariables: {
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    supabaseServiceKey: boolean;
  };
  urlDetails: {
    url: string;
    hostname: string;
    protocol: string;
  } | null;
  nodeVersion: string;
  platform: string;
  time: string;
  pingStatus?: {
    success: boolean;
    status?: number;
    statusText?: string;
    error?: string;
  };
};

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Collect diagnostic information
    const diagnostics: DiagnosticsInfo = {
      envVariables: {
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey,
        supabaseServiceKey: !!supabaseServiceKey
      },
      urlDetails: supabaseUrl ? {
        url: supabaseUrl,
        hostname: new URL(supabaseUrl).hostname,
        protocol: new URL(supabaseUrl).protocol
      } : null,
      nodeVersion: process.version,
      platform: process.platform,
      time: new Date().toISOString()
    };

    // If missing environment variables, return early
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing required Supabase environment variables',
        diagnostics
      }, { status: 500 });
    }

    // Try to ping the Supabase URL (without authentication) to check basic connectivity
    let pingSuccess = false;
    try {
      const pingResponse = await fetch(`${supabaseUrl}/ping`, { 
        method: 'GET',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });
      pingSuccess = pingResponse.ok;
      diagnostics.pingStatus = {
        success: pingSuccess,
        status: pingResponse.status,
        statusText: pingResponse.statusText
      };
    } catch (pingError) {
      diagnostics.pingStatus = {
        success: false,
        error: pingError instanceof Error ? pingError.message : 'Unknown ping error'
      };
    }

    // Test connection with a simple query
    console.log('Testing Supabase connection...');
    const { data, error, count } = await supabase
      .from('leads')
      .select('count', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return NextResponse.json({
        success: false,
        error: `Database connection error: ${error.message}`,
        details: error,
        diagnostics
      }, { status: 500 });
    }

    // Connection successful
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase',
      leadsCount: count || 0,
      diagnostics
    });
  } catch (err) {
    console.error('Unexpected error in test-connection:', err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
      stack: err instanceof Error ? err.stack : undefined
    }, { status: 500 });
  }
} 