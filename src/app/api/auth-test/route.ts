import { NextResponse } from 'next/server';
import { checkAuthentication, getAuthenticatedUser } from '@/lib/auth-helpers';

/**
 * Test API route to check authentication status and cookies handling
 * This will help us diagnose the authentication issues
 */
export async function GET() {
  try {
    console.log('Auth Test API: Starting authentication test');
    
    // Step 1: Check general authentication status
    console.log('Auth Test API: Checking authentication with utility...');
    const authError = await checkAuthentication();
    
    if (authError) {
      console.log('Auth Test API: Authentication check failed:', authError);
      return NextResponse.json({
        success: false,
        message: 'Authentication failed',
        error: authError.error,
        authStatus: 'failed'
      }, { status: authError.status });
    }
    
    // Step 2: If authenticated, get the user details
    console.log('Auth Test API: Getting authenticated user details...');
    const { user, error } = await getAuthenticatedUser();
    
    if (error || !user) {
      console.log('Auth Test API: Failed to get user details:', error);
      return NextResponse.json({
        success: false,
        message: 'Authentication successful, but failed to get user details',
        error: error || 'No user found',
        authStatus: 'partial'
      }, { status: 500 });
    }
    
    // Authentication successful and user details retrieved
    console.log('Auth Test API: Authentication successful, user ID:', user.id);
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      authStatus: 'success',
      userId: user.id,
      email: user.email,
      // Only include minimal identifiable information for security
      // Don't include tokens or full user object
    });
    
  } catch (err) {
    console.error('Auth Test API: Unexpected error:', err);
    return NextResponse.json({
      success: false,
      message: 'Unexpected error testing authentication',
      error: err instanceof Error ? err.message : String(err),
      authStatus: 'error'
    }, { status: 500 });
  }
} 