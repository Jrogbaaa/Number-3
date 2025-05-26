import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for server components/API routes with proper cookie handling
 * Uses the recommended pattern for Next.js 14+ to handle cookies
 */
export async function getAuthenticatedUser() {
  try {
    // Get authentication from Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Get session and user
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error in getAuthenticatedUser:', error.message);
      return { user: null, error: error.message };
    }
    
    if (!session?.user) {
      return { user: null, error: 'No authenticated user found' };
    }
    
    return { 
      user: session.user, 
      error: null 
    };
    
  } catch (err) {
    console.error('Unexpected error in getAuthenticatedUser:', err);
    return { 
      user: null, 
      error: err instanceof Error ? err.message : 'Unknown authentication error' 
    };
  }
}

/**
 * Helper function to check if a user is authenticated and return appropriate API response
 * Returns null if authenticated, or an API response object if not authenticated
 */
export async function checkAuthentication() {
  try {
    // Get authentication from Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Check session directly to avoid nested async calls
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('API: Authentication check failed (session error):', error.message);
      return {
        success: false,
        error: 'Authentication error',
        status: 401
      };
    }
    
    if (!session?.user) {
      console.log('API: Authentication check failed: No authenticated user found');
      return {
        success: false,
        error: 'User not authenticated',
        status: 401
      };
    }
    
    // User is authenticated
    return null;
  } catch (err) {
    console.error('Unexpected error in checkAuthentication:', err);
    return {
      success: false,
      error: 'Authentication error',
      status: 500
    };
  }
}

/**
 * Helper function to get the current user with proper error handling
 * Returns the user object and a boolean indicating success
 */
export async function getCurrentUser() {
  try {
    // Get authentication from Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Get session directly to avoid nested async calls
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      return {
        user: null,
        isAuthenticated: false
      };
    }
    
    return { 
      user: session.user, 
      isAuthenticated: true 
    };
  } catch (err) {
    console.error('Unexpected error in getCurrentUser:', err);
    return {
      user: null,
      isAuthenticated: false
    };
  }
} 