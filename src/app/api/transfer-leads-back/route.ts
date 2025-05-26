import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    console.log('TRANSFER LEADS BACK: Starting process');
    
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
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'User not authenticated'
      }, { status: 401 });
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const currentUserId = session.user.id;
    const incognitoUserId = "117026041918704620390"; // The incognito account with all the leads
    
    console.log(`TRANSFER LEADS BACK: Moving leads from ${incognitoUserId} to ${currentUserId}`);
    
    // First, check how many leads exist for the incognito user
    const { data: incognitoLeads, error: checkError } = await supabase
      .from('leads')
      .select('id')
      .eq('user_id', incognitoUserId);
      
    if (checkError) {
      console.error('Error checking incognito leads:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing leads'
      }, { status: 500 });
    }
    
    const leadCount = incognitoLeads?.length || 0;
    console.log(`TRANSFER LEADS BACK: Found ${leadCount} leads to transfer`);
    
    if (leadCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No leads found to transfer from incognito account',
        transferred: 0
      });
    }
    
    // Transfer all leads from incognito user to current user
    const { data, error } = await supabase
      .from('leads')
      .update({ 
        user_id: currentUserId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', incognitoUserId)
      .select('id');
      
    if (error) {
      console.error('Error transferring leads:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to transfer leads'
      }, { status: 500 });
    }
    
    const transferredCount = data?.length || 0;
    console.log(`TRANSFER LEADS BACK: Successfully transferred ${transferredCount} leads`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${transferredCount} leads to your account`,
      transferred: transferredCount,
      fromUserId: incognitoUserId,
      toUserId: currentUserId
    });
    
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 