import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('DEBUG: Checking user ID consistency...');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`DEBUG: Current session user ID: ${userId}`);

    // Create Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check all leads for this user
    const { data: userLeads, error: userLeadsError } = await supabase
      .from('leads')
      .select('id, email, user_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Check all unique user IDs in the database
    const { data: allUserIds, error: allUserIdsError } = await supabase
      .from('leads')
      .select('user_id')
      .order('created_at', { ascending: false });

    const uniqueUserIds = allUserIds ? Array.from(new Set(allUserIds.map(lead => lead.user_id))) : [];

    // Check user preferences
    const { data: userPrefs, error: userPrefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);

    // Check recent uploads (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentLeads, error: recentLeadsError } = await supabase
      .from('leads')
      .select('id, email, user_id, created_at')
      .eq('user_id', userId)
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      debug: {
        sessionUserId: userId,
        sessionUser: session.user,
        userLeadsCount: userLeads?.length || 0,
        userLeadsSample: userLeads?.slice(0, 3) || [],
        recentLeadsCount: recentLeads?.length || 0,
        recentLeadsSample: recentLeads?.slice(0, 3) || [],
        allUniqueUserIds: uniqueUserIds,
        userIdExistsInDatabase: uniqueUserIds.includes(userId),
        userPreferences: userPrefs || [],
        errors: {
          userLeadsError: userLeadsError?.message,
          allUserIdsError: allUserIdsError?.message,
          userPrefsError: userPrefsError?.message,
          recentLeadsError: recentLeadsError?.message
        }
      }
    });

  } catch (error) {
    console.error('DEBUG: Error during user ID check:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 