import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * GET /api/auth-status
 * Returns detailed information about the current authentication state
 * This is a debugging API to help troubleshoot auth issues
 */
export async function GET() {
  try {
    // Check NextAuth session
    const nextAuthSession = await getServerSession(authOptions);
    
    // Configuration check
    const configInfo = {
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hostname: process.env.NEXT_PUBLIC_HOSTNAME || 'not set',
    };
    
    // If we have no session, just return config and session info
    if (!nextAuthSession) {
      return NextResponse.json({
        authenticated: false,
        message: 'No NextAuth session found',
        nextAuthSession: null,
        config: configInfo
      });
    }
    
    // We have a NextAuth session, check Supabase connectivity
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        authenticated: true,
        message: 'NextAuth authenticated but missing Supabase credentials',
        nextAuthSession: {
          userId: nextAuthSession.user?.id,
          userEmail: nextAuthSession.user?.email
        },
        supabaseConnected: false,
        config: configInfo
      });
    }
    
    // Check Supabase user
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
      nextAuthSession.user?.id || ''
    );
    
    // Check if user exists in public.leads table
    let leadsData = null;
    let leadsError: PostgrestError | Error | string | null = null;
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email')
        .eq('user_id', nextAuthSession.user?.id)
        .limit(5);
      
      leadsData = data;
      leadsError = error;
    } catch (err) {
      leadsError = err instanceof Error ? err : 'Unknown error checking leads';
    }
    
    // Get error message based on type
    const getErrorMessage = (error: PostgrestError | Error | string | null): string | null => {
      if (!error) return null;
      if (typeof error === 'string') return error;
      if ('message' in error) return error.message;
      return String(error);
    };
    
    // Return all information
    return NextResponse.json({
      authenticated: true,
      nextAuthSession: {
        userId: nextAuthSession.user?.id,
        userEmail: nextAuthSession.user?.email,
        userName: nextAuthSession.user?.name,
      },
      supabase: {
        connected: true,
        authUser: authUser ? {
          id: authUser.user?.id,
          email: authUser.user?.email,
          emailConfirmed: authUser.user?.email_confirmed_at ? true : false
        } : null,
        authError: authError ? authError.message : null,
        hasLeads: leadsData ? leadsData.length > 0 : false,
        leadCount: leadsData ? leadsData.length : 0,
        leadsError: getErrorMessage(leadsError)
      },
      config: configInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in auth-status API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 