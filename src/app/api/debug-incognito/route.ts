import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('DEBUG INCOGNITO: Starting check');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials'
      }, { status: 500 });
    }
    
    // Check current session
    const session = await getServerSession(authOptions);
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Check leads for the incognito account
    const incognitoUserId = "117026041918704620390";
    const originalUserId = "112891346719518200192";
    
    // Get lead counts for both accounts
    const { data: incognitoLeads, error: incognitoError } = await supabase
      .from('leads')
      .select('id, name, email, created_at')
      .eq('user_id', incognitoUserId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    const { data: originalLeads, error: originalError } = await supabase
      .from('leads')
      .select('id, name, email, created_at')
      .eq('user_id', originalUserId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Get total counts
    const { count: incognitoCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', incognitoUserId);
      
    const { count: originalCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', originalUserId);
    
    return NextResponse.json({
      success: true,
      currentSession: {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        name: session?.user?.name
      },
      accounts: {
        incognito: {
          userId: incognitoUserId,
          email: 'johnbanks8888@gmail.com',
          leadCount: incognitoCount || 0,
          recentLeads: incognitoLeads || [],
          error: incognitoError?.message
        },
        original: {
          userId: originalUserId,
          email: '11jellis@gmail.com', 
          leadCount: originalCount || 0,
          recentLeads: originalLeads || [],
          error: originalError?.message
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('DEBUG INCOGNITO: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 