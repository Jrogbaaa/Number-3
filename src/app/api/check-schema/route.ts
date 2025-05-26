import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('SCHEMA CHECK: Checking leads table schema');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Check what columns exist by getting a sample lead
    const { data: sampleLead, error } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
      
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    
    const columns = sampleLead && sampleLead.length > 0 ? Object.keys(sampleLead[0]) : [];
    
    return NextResponse.json({
      success: true,
      columns: columns.sort(),
      sampleRecord: sampleLead?.[0] || null
    });
    
  } catch (error) {
    console.error('SCHEMA CHECK Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 