import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Attempt to get the session
    const session = await getServerSession(authOptions);
    
    // Return session info
    return NextResponse.json({
      success: true,
      authenticated: !!session,
      session: session,
      timestamp: new Date().toISOString(),
      message: session ? 'User is authenticated' : 'User is not authenticated',
    });
  } catch (error) {
    console.error('Error in test-auth API:', error);
    
    // Return error info
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 