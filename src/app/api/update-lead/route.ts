import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a server-side client with service role key
// This bypasses RLS policies for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key instead of anon key
  {
    auth: { persistSession: false }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    console.log(`Updating lead ${id} with data:`, updateData);

    // Field name mapping between frontend and database
    const fieldMap: Record<string, string> = {
      optimalOutreachTime: 'optimal_outreach_time',
      optimalOutreachTimeEastern: 'optimal_outreach_time_eastern',
      outreachReason: 'outreach_reason',
      // Add other fields that need mapping here
    };

    // Apply field mapping
    const dbUpdateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateData)) {
      // Use mapped field name if it exists, otherwise use the original
      const dbField = fieldMap[key] || key;
      dbUpdateData[dbField] = value;
    }

    // Always add updated_at timestamp
    dbUpdateData.updated_at = new Date().toISOString();

    console.log('Mapped data for database update:', dbUpdateData);

    // Use supabaseAdmin instead of supabase
    const { data, error } = await supabaseAdmin
      .from('leads')
      .update(dbUpdateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating lead in database:', error);

      // Check if it's a column not found error
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Database schema issue', 
          message: 'Database needs schema update. Please fix schema first.',
          needsSchemaFix: true
        }, { status: 400 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Lead updated successfully',
      data 
    });
  } catch (error) {
    console.error('Unexpected error in update-lead API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 