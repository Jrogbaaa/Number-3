import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Get session using server-side method
    const session = await getServerSession(authOptions);
    
    // Check environment variables (without revealing values)
    const envVars = {
      hasNextAuthSecret: typeof process.env.NEXTAUTH_SECRET === 'string' && process.env.NEXTAUTH_SECRET.length > 0,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
      hasGoogleClientId: typeof process.env.GOOGLE_CLIENT_ID === 'string' && process.env.GOOGLE_CLIENT_ID.length > 0,
      hasGoogleClientSecret: typeof process.env.GOOGLE_CLIENT_SECRET === 'string' && process.env.GOOGLE_CLIENT_SECRET.length > 0,
      environmentMode: process.env.NODE_ENV || 'not set',
      hasSupabaseUrl: typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' && process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0,
    };
    
    // Return diagnostic information
    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        userId: session.user?.id || 'not available',
        userEmail: session.user?.email || 'not available',
        userName: session.user?.name || 'not available',
        // Don't include the full session object for security
      } : null,
      environmentVariables: envVars,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Return error information
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 