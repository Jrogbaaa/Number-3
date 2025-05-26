import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('DEBUG LEADS: Checking leads in database');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials'
      }, { status: 500 });
    }
    
    // Check session
    const session = await getServerSession(authOptions);
    console.log('DEBUG LEADS: Session status:', !!session);
    console.log('DEBUG LEADS: User ID:', session?.user?.id);
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get total count of all leads
    const { count: totalLeads, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('DEBUG LEADS: Error getting total count:', countError);
    }
    
    // Get all leads (limited to 10 for debugging)
    const { data: allLeads, error: allError } = await supabase
      .from('leads')
      .select('id, name, email, user_id, created_at')
      .limit(10);
    
    if (allError) {
      console.error('DEBUG LEADS: Error getting all leads:', allError);
    }
    
    // Get leads for current user if authenticated
    let userLeads = null;
    let userLeadsError = null;
    if (session?.user?.id) {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email, user_id, created_at')
        .eq('user_id', session.user.id);
      
      userLeads = data;
      userLeadsError = error;
      
      if (error) {
        console.error('DEBUG LEADS: Error getting user leads:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      session: {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      },
      database: {
        totalLeads: totalLeads || 0,
        userLeads: userLeads?.length || 0,
        allLeadsPreview: allLeads || [],
        userLeadsPreview: userLeads || []
      },
      errors: {
        countError: countError?.message,
        allError: allError?.message,
        userLeadsError: userLeadsError?.message
      }
    });
    
  } catch (error) {
    console.error('DEBUG LEADS: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 