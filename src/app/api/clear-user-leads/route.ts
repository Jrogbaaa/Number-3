import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: Request) {
  try {
    console.log('[API:clear-user-leads] Starting user-specific lead deletion...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[API:clear-user-leads] Missing Supabase credentials');
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: Missing Supabase credentials.',
      }, { status: 500 });
    }

    // Check authentication using NextAuth
    console.log('[API:clear-user-leads] Checking authentication via NextAuth...');
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('[API:clear-user-leads] No NextAuth session found');
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated',
      }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`[API:clear-user-leads] User authenticated, ID: ${userId}`);

    // Parse request body for confirmation
    const body = await request.json();
    if (!body.confirmDelete) {
      return NextResponse.json({
        success: false,
        error: 'Delete confirmation required',
      }, { status: 400 });
    }
    
    // Create Supabase client with service role to bypass RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // First, count the user's leads before deletion
    const { count: userLeadCount, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) {
      console.error('[API:clear-user-leads] Error counting user leads:', countError);
      return NextResponse.json({
        success: false,
        error: `Failed to count user leads: ${countError.message}`,
      }, { status: 500 });
    }
    
    const totalUserLeads = userLeadCount || 0;
    console.log(`[API:clear-user-leads] User ${userId} has ${totalUserLeads} leads to delete`);
    
    if (totalUserLeads === 0) {
      return NextResponse.json({
        success: true,
        message: 'No leads found for user',
        deletedCount: 0,
      });
    }
    
    // Delete all leads for this specific user
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('user_id', userId); // Only delete leads belonging to this user
    
    if (deleteError) {
      console.error('[API:clear-user-leads] Error deleting user leads:', deleteError);
      return NextResponse.json({
        success: false,
        error: `Failed to delete user leads: ${deleteError.message}`,
      }, { status: 500 });
    }
    
    // Verify deletion was successful
    const { count: remainingCount, error: verifyError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (verifyError) {
      console.warn('[API:clear-user-leads] Could not verify deletion:', verifyError);
    }
    
    const remainingLeads = remainingCount || 0;
    console.log(`[API:clear-user-leads] Deletion complete. Remaining leads for user: ${remainingLeads}`);
    
    if (remainingLeads > 0) {
      console.warn(`[API:clear-user-leads] Warning: ${remainingLeads} leads still remain for user ${userId}`);
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${totalUserLeads} leads for user`,
      deletedCount: totalUserLeads,
      remainingLeads: remainingLeads,
    });
    
  } catch (error) {
    console.error('[API:clear-user-leads] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: `Failed to clear user leads: ${errorMessage}`,
    }, { status: 500 });
  }
} 