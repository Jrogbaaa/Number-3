import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('TEST: Starting upload test...');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`TEST: User authenticated: ${userId}`);

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

    // Test 1: Check user preferences
    console.log('TEST: Checking user preferences...');
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);

    console.log('TEST: User preferences result:', { data: prefsData, error: prefsError });

    // Test 2: Check current leads count
    console.log('TEST: Checking current leads...');
    const { data: leadsData, error: leadsError, count: leadsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    console.log('TEST: Current leads result:', { count: leadsCount, error: leadsError });

    // Test 3: Try to insert a test lead
    console.log('TEST: Attempting to insert test lead...');
    const testLead = {
      name: 'Test Lead from API',
      email: `test-${Date.now()}@example.com`,
      company: 'Test Company',
      title: 'Test Title',
      source: 'Other',
      status: 'New',
      score: 50,
      value: 1000,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('leads')
      .insert([testLead])
      .select();

    console.log('TEST: Insert result:', { data: insertData, error: insertError });

    // Test 4: Check leads count after insert
    console.log('TEST: Checking leads count after insert...');
    const { count: newLeadsCount, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    console.log('TEST: New leads count:', { count: newLeadsCount, error: countError });

    return NextResponse.json({
      success: true,
      testResults: {
        userId,
        userPreferences: {
          data: prefsData,
          error: prefsError?.message || null
        },
        initialLeadsCount: {
          count: leadsCount,
          error: leadsError?.message || null
        },
        testLeadInsert: {
          data: insertData,
          error: insertError?.message || null
        },
        finalLeadsCount: {
          count: newLeadsCount,
          error: countError?.message || null
        }
      }
    });

  } catch (error) {
    console.error('TEST: Error during test:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('TEST: Testing CSV upload flow...');
    
    // Create test leads data like the CSV upload would
    const testLeads = [
      {
        name: 'CSV Test Lead 1',
        email: 'csvtest1@example.com',
        company: 'CSV Test Company 1',
        title: 'Marketing Manager',
        source: 'Website',
        status: 'New',
        score: 75,
        value: 5000
      },
      {
        name: 'CSV Test Lead 2',
        email: 'csvtest2@example.com',
        company: 'CSV Test Company 2',
        title: 'CEO',
        source: 'LinkedIn',
        status: 'New',
        score: 90,
        value: 10000
      }
    ];

    // Call the actual upload API
    const uploadResponse = await fetch(new URL('/api/upload-leads', 'http://localhost:3000'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers - this might be the issue
        'Cookie': ''
      },
      body: JSON.stringify({ leads: testLeads })
    });

    const uploadResult = await uploadResponse.json();
    console.log('TEST: Upload API result:', uploadResult);

    return NextResponse.json({
      success: true,
      uploadTest: {
        status: uploadResponse.status,
        result: uploadResult
      }
    });

  } catch (error) {
    console.error('TEST: Error during CSV upload test:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 