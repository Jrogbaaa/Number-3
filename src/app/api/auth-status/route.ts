import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// This is a debug route that returns authentication status
// It should be protected in production environments or removed
export async function GET() {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_AUTH_DEBUG !== 'true') {
    return NextResponse.json({ error: 'Debug endpoints disabled in production' }, { status: 403 });
  }

  try {
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    
    // Check Supabase connection
    let supabaseConnectionStatus = 'unknown';
    let supabaseError = null;
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        // Test connection by making a simple query
        const { data, error } = await supabase.from('leads').select('count(*)', { count: 'exact' }).limit(1);
        
        if (error) {
          supabaseConnectionStatus = 'error';
          supabaseError = error.message;
        } else {
          supabaseConnectionStatus = 'connected';
        }
      } catch (e) {
        supabaseConnectionStatus = 'error';
        supabaseError = e instanceof Error ? e.message : 'Unknown error';
      }
    } else {
      supabaseConnectionStatus = 'missing_credentials';
    }
    
    // Get environment info (mask sensitive values)
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '[set]' : 'not set',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '[set]' : 'not set',
      hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      hasSupabaseCredentials: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
    };
    
    return NextResponse.json({
      authenticated: !!session,
      sessionExists: !!session,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      supabase: {
        connectionStatus: supabaseConnectionStatus,
        error: supabaseError
      },
      environment: envInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json(
      { 
        error: 'Error checking authentication status',
        message: error instanceof Error ? error.message : 'Unknown error',
        authenticated: false
      }, 
      { status: 500 }
    );
  }
} 