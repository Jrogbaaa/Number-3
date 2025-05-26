import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    console.log('FIX ONBOARDING: Starting process');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'User not authenticated'
      }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const userId = session.user.id;

    console.log(`FIX ONBOARDING: Setting onboarding complete for user ${userId}`);

    // First, try to update existing preferences
    const { data: updateData, error: updateError } = await supabase
      .from('user_preferences')
      .update({
        has_completed_onboarding: true,
        onboarding_step: 7,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError && updateError.code === 'PGRST116') {
      // No existing record, create one
      console.log('FIX ONBOARDING: No existing preferences, creating new record');
      
      const { data: insertData, error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          has_completed_onboarding: true,
          onboarding_step: 7,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('FIX ONBOARDING: Error creating preferences:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create onboarding preferences'
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Onboarding status set to completed (new record created)',
        data: insertData
      });
    }

    if (updateError) {
      console.error('FIX ONBOARDING: Error updating preferences:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update onboarding preferences'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding status set to completed',
      data: updateData
    });

  } catch (error) {
    console.error('FIX ONBOARDING: Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 