import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 });
    }

    console.log('DEBUG: Current user ID:', session.user.id);

    // Call the user-preferences API directly
    const prefsResponse = await fetch('http://localhost:3000/api/user-preferences', {
      headers: {
        'Content-Type': 'application/json',
        // Need to simulate the session
      }
    });

    let prefsResult;
    try {
      prefsResult = await prefsResponse.json();
    } catch (e) {
      prefsResult = { error: 'Failed to parse JSON', status: prefsResponse.status };
    }

    return NextResponse.json({
      success: true,
      debug: {
        userId: session.user.id,
        sessionFull: session,
        preferencesApiResponse: {
          status: prefsResponse.status,
          data: prefsResult
        }
      }
    });

  } catch (error) {
    console.error('DEBUG: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 