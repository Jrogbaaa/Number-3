import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('[DEBUG-ONBOARDING] Starting diagnostic check');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    const authStatus = {
      hasSession: !!session,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      userName: session?.user?.name || null
    };
    
    console.log('[DEBUG-ONBOARDING] Auth status:', authStatus);
    
    // Check Supabase connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabaseStatus = {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      urlLength: supabaseUrl?.length || 0
    };
    
    let databaseChecks = {
      canConnect: false,
      userPreferencesTableExists: false,
      leadsTableExists: false,
      userHasPreferences: false,
      userHasLeads: false,
      preferenceDetails: null as any,
      leadCount: 0
    };
    
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        
        // Test basic connection
        const { data: testData, error: testError } = await supabase
          .from('leads')
          .select('count(*)', { count: 'exact' })
          .limit(1);
        
        if (!testError) {
          databaseChecks.canConnect = true;
          databaseChecks.leadsTableExists = true;
        }
        
        // Check user preferences table
        if (authStatus.userId) {
          const { data: prefsData, error: prefsError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', authStatus.userId)
            .single();
          
          if (!prefsError && prefsData) {
            databaseChecks.userPreferencesTableExists = true;
            databaseChecks.userHasPreferences = true;
            databaseChecks.preferenceDetails = {
              hasCompletedOnboarding: prefsData.has_completed_onboarding,
              onboardingStep: prefsData.onboarding_step,
              companyName: prefsData.company_name,
              targetRoles: prefsData.target_roles
            };
          } else if (prefsError && !prefsError.message.includes('No rows')) {
            console.log('[DEBUG-ONBOARDING] Preferences error:', prefsError);
          }
          
          // Check user leads
          const { data: leadsData, error: leadsError } = await supabase
            .from('leads')
            .select('count(*)', { count: 'exact' })
            .eq('user_id', authStatus.userId);
          
          if (!leadsError) {
            databaseChecks.userHasLeads = (leadsData as any)?.[0]?.count > 0;
            databaseChecks.leadCount = (leadsData as any)?.[0]?.count || 0;
          }
        }
        
      } catch (dbError) {
        console.error('[DEBUG-ONBOARDING] Database error:', dbError);
      }
    }
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      auth: authStatus,
      supabase: supabaseStatus,
      database: databaseChecks,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    };
    
    console.log('[DEBUG-ONBOARDING] Diagnostics complete:', diagnostics);
    
    return NextResponse.json({
      success: true,
      diagnostics
    });
    
  } catch (error) {
    console.error('[DEBUG-ONBOARDING] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 