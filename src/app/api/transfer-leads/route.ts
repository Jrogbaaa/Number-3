import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  return handleTransfer();
}

export async function GET() {
  return handleTransfer();
}

async function handleTransfer() {
  try {
    console.log('TRANSFER API: Starting lead transfer process');
    
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
    
    const userId = session.user.id;
    console.log('TRANSFER API: Transferring leads to user:', userId);
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get count of leads with system_admin user_id
    const { count: systemAdminCount, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', 'system_admin');
    
    if (countError) {
      console.error('TRANSFER API: Error getting count:', countError);
      return NextResponse.json({
        success: false,
        error: 'Failed to count system_admin leads'
      }, { status: 500 });
    }
    
    console.log(`TRANSFER API: Found ${systemAdminCount} leads to transfer`);
    
    if (!systemAdminCount || systemAdminCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No leads to transfer',
        transferred: 0
      });
    }
    
    // Update all system_admin leads to belong to the current user
    const { data, error: updateError } = await supabase
      .from('leads')
      .update({ user_id: userId })
      .eq('user_id', 'system_admin')
      .select('id');
    
    if (updateError) {
      console.error('TRANSFER API: Error updating leads:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to transfer leads',
        details: updateError.message
      }, { status: 500 });
    }
    
    const transferredCount = data?.length || 0;
    console.log(`TRANSFER API: Successfully transferred ${transferredCount} leads to user ${userId}`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${transferredCount} leads to your account`,
      transferred: transferredCount,
      userId: userId
    });
    
  } catch (error) {
    console.error('TRANSFER API: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 