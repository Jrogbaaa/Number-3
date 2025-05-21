import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Lead } from '@/types/lead';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('API: Missing Supabase credentials. Cannot fetch leads.');
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: Missing Supabase credentials.',
        leads: [],
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log('API: Attempting to fetch leads from Supabase...');

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('API: Error fetching leads from Supabase:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to fetch leads from database.',
        details: error,
        leads: [],
      }, { status: 500 });
    }

    if (!data) {
      console.log('API: No leads data returned from Supabase (data is null/undefined).');
      return NextResponse.json({
        success: true,
        leads: [],
        message: 'No leads found in the database.'
      });
    }
    
    console.log(`API: Successfully fetched ${data.length} leads from Supabase.`);

    const processedLeads = data.map(lead => {
      const parsedInsights = lead.insights ? (
        typeof lead.insights === 'string' ? JSON.parse(lead.insights) : lead.insights
      ) : undefined;

      return {
        ...lead,
        optimalOutreachTime: lead.optimal_outreach_time,
        optimalOutreachTimeEastern: lead.optimal_outreach_time_eastern,
        outreachReason: lead.outreach_reason,
        insights: parsedInsights,
        marketingScore: lead.marketing_score,
        budgetPotential: lead.budget_potential,
        budgetConfidence: lead.budget_confidence,
        businessOrientation: lead.business_orientation,
        orientationConfidence: lead.orientation_confidence,
        intentScore: lead.intent_score,
        spendAuthorityScore: lead.spend_authority_score
      } as Lead;
    });

    return NextResponse.json({
      success: true,
      leads: processedLeads,
    });

  } catch (err) {
    const error = err as Error;
    console.error('API: Unexpected error in GET /api/fetch-leads:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected server error occurred.',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      leads: [],
    }, { status: 500 });
  }
} 