import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkAuthentication, getAuthenticatedUser } from '@/lib/auth-helpers';

/**
 * Debug API route to test if authentication is working properly
 * Used to diagnose auth issues and cookie handling in Next.js
 */
export async function GET() {
  try {
    console.log('AUTH-DEBUG: Starting authentication test');
    
    // Test 1: Use our auth helper
    console.log('AUTH-DEBUG: Testing checkAuthentication()...');
    const authError = await checkAuthentication();
    
    // Test 2: Try the getAuthenticatedUser helper
    console.log('AUTH-DEBUG: Testing getAuthenticatedUser()...');
    const { user: authHelperUser, error: authHelperError } = await getAuthenticatedUser();
    
    // Test 3: Create a direct Supabase client using the recommended pattern
    console.log('AUTH-DEBUG: Testing direct Supabase client creation...');
    const supabase = createServerComponentClient({ cookies });
    
    // Test 4: Get session with direct client
    console.log('AUTH-DEBUG: Testing direct session access...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Return all diagnostics
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      tests: {
        checkAuthentication: {
          passed: !authError,
          error: authError ? authError.error : null
        },
        getAuthenticatedUser: {
          passed: !!authHelperUser && !authHelperError,
          userId: authHelperUser?.id || null,
          error: authHelperError || null
        },
        directSessionAccess: {
          passed: !!session && !sessionError,
          userId: session?.user?.id || null,
          error: sessionError ? sessionError.message : null
        }
      },
      summary: 
        (!authError && !!authHelperUser && !!session) 
          ? "All authentication checks passed" 
          : "Some authentication checks failed - see details"
    });
  } catch (error) {
    console.error('AUTH-DEBUG: Error during authentication test:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 