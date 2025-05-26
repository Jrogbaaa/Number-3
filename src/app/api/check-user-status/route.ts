import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get total leads count
    const { data: allLeads, error: totalError } = await supabase
      .from('leads')
      .select('user_id')
      .limit(1000);
      
    if (totalError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leads'
      }, { status: 500 });
    }
    
    // Count leads by user_id
    const userCounts: Record<string, number> = {};
    allLeads?.forEach(lead => {
      const userId = lead.user_id || 'unknown';
      userCounts[userId] = (userCounts[userId] || 0) + 1;
    });
    
    // Get recent leads (last 10)
    const { data: recentLeads, error: recentError } = await supabase
      .from('leads')
      .select('id, name, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    return NextResponse.json({
      success: true,
      totalLeads: allLeads?.length || 0,
      userCounts,
      recentLeads: recentLeads || [],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 