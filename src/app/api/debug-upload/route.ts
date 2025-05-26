import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    console.log('DEBUG API: Processing debug upload request');
    
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
    console.log('DEBUG API: Session status:', !!session);
    console.log('DEBUG API: User ID:', session?.user?.id);
    
    // Parse request
    const requestBody = await request.json();
    const { leads } = requestBody;
    
    if (!leads || !Array.isArray(leads)) {
      return NextResponse.json({
        success: false,
        error: 'No leads provided',
        receivedData: { leads: !!leads, isArray: Array.isArray(leads) }
      }, { status: 400 });
    }
    
    console.log(`DEBUG API: Received ${leads.length} leads`);
    console.log('DEBUG API: First lead sample:', leads[0]);
    
    // Test database connection
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    if (session?.user?.id) {
      // Try authenticated upload
      console.log('DEBUG API: Attempting authenticated upload');
      
      const testLead = {
        id: uuidv4(),
        name: 'Debug Test Lead',
        email: `debug-${Date.now()}@test.com`,
        company: 'Debug Company',
        title: 'Debug Title',
        source: 'Other',
        status: 'New',
        created_at: new Date().toISOString(),
        score: 50,
        value: 0,
        user_id: session.user.id,
        insights: null
      };
      
      const { data, error } = await supabase
        .from('leads')
        .insert([testLead])
        .select();
      
      if (error) {
        console.error('DEBUG API: Database insert error:', error);
        return NextResponse.json({
          success: false,
          error: 'Database insert failed',
          details: error.message,
          session: { hasSession: !!session, userId: session?.user?.id }
        });
      }
      
      console.log('DEBUG API: Successfully inserted test lead:', data);
      
      return NextResponse.json({
        success: true,
        message: 'Debug upload successful',
        session: { hasSession: !!session, userId: session?.user?.id },
        testInsert: { success: true, insertedId: data[0]?.id },
        receivedLeads: leads.length
      });
    } else {
      // Unauthenticated flow
      console.log('DEBUG API: No session - simulating unauthenticated flow');
      
      return NextResponse.json({
        success: true,
        message: 'Debug upload - unauthenticated mode',
        session: { hasSession: false },
        receivedLeads: leads.length,
        note: 'In real flow, these would be saved to localStorage'
      });
    }
    
  } catch (error) {
    console.error('DEBUG API: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 