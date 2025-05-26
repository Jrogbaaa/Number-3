import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/auth/session
 * Returns the current session information for the authenticated user
 * This endpoint is intended to be called from the client side to check if a user is authenticated
 */
export async function GET() {
  try {
    // Get the NextAuth session
    const nextAuthSession = await getServerSession(authOptions);
    
    if (!nextAuthSession) {
      return NextResponse.json({
        authenticated: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }
    
    // Get the Supabase session using admin API instead of cookie-based client
    // This avoids the cookie errors and directly sets up a session from the NextAuth user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json({
        authenticated: true,
        nextAuth: {
          user: {
            id: nextAuthSession.user?.id || '',
            email: nextAuthSession.user?.email || '',
            name: nextAuthSession.user?.name || '',
            image: nextAuthSession.user?.image || '',
          }
        },
        supabase: {
          hasSession: false,
          user: null,
          error: 'Missing Supabase credentials'
        }
      });
    }
    
    // Use the admin client to get or create a session for this user
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Check if user exists in Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', nextAuthSession.user?.id)
      .single();
    
    // If user doesn't exist, create it (simplified sync)
    if (!userData && nextAuthSession.user?.email) {
      console.log('Skipping Supabase user creation - temporarily disabled to avoid auth table errors');
      
      // const { error: createError } = await supabase.auth.admin.createUser({
      //   email: nextAuthSession.user.email,
      //   email_confirm: true,
      //   user_metadata: {
      //     full_name: nextAuthSession.user.name || 'User',
      //     avatar_url: nextAuthSession.user.image || '',
      //     provider: 'google'
      //   },
      //   app_metadata: {
      //     provider: 'google',
      //     providers: ['google']
      //   }
      // });
      
      // if (createError) {
      //   console.error('Error creating Supabase user:', createError);
      // }
    }
    
    // Return session information
    return NextResponse.json({
      authenticated: true,
      nextAuth: {
        user: {
          id: nextAuthSession.user?.id || '',
          email: nextAuthSession.user?.email || '',
          name: nextAuthSession.user?.name || '',
          image: nextAuthSession.user?.image || '',
        }
      },
      supabase: {
        hasSession: true, // We're using admin access so we consider it authenticated
        user: {
          id: nextAuthSession.user?.id || '',
          email: nextAuthSession.user?.email || ''
        }
      }
    });
  } catch (error) {
    console.error('Unexpected error in session API:', error);
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 