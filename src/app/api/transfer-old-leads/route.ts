import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  return handleTransfer();
}

export async function POST() {
  return handleTransfer();
}

async function handleTransfer() {
  try {
    console.log('TRANSFER OLD LEADS: Starting transfer process');
    
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
    const newUserId = session.user.id;
    const oldUserId = "112891346719518200192"; // Original account
    
    console.log(`TRANSFER OLD LEADS: Moving leads from ${oldUserId} to ${newUserId}`);
    
    // First, check how many leads exist for the old user
    const { data: oldLeads, error: checkError } = await supabase
      .from('leads')
      .select('id')
      .eq('user_id', oldUserId);
      
    if (checkError) {
      console.error('Error checking old leads:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing leads'
      }, { status: 500 });
    }
    
    const leadCount = oldLeads?.length || 0;
    console.log(`TRANSFER OLD LEADS: Found ${leadCount} leads to transfer`);
    
    if (leadCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No leads found to transfer',
        transferred: 0
      });
    }
    
    // Transfer all leads from old user to new user
    const { data, error } = await supabase
      .from('leads')
      .update({ 
        user_id: newUserId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', oldUserId)
      .select('id');
      
    if (error) {
      console.error('Error transferring leads:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to transfer leads'
      }, { status: 500 });
    }
    
    const transferredCount = data?.length || 0;
    console.log(`TRANSFER OLD LEADS: Successfully transferred ${transferredCount} leads`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${transferredCount} leads to your account`,
      transferred: transferredCount,
      oldUserId,
      newUserId
    });
    
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 