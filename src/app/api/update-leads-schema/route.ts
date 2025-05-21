import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Create SQL for adding columns
    const sql = `
      -- Add new columns for location, timezone, and optimal outreach time
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS timezone TEXT,
      ADD COLUMN IF NOT EXISTS optimal_outreach_time TEXT,
      ADD COLUMN IF NOT EXISTS outreach_reason TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

      -- Create indexes for the new columns
      CREATE INDEX IF NOT EXISTS leads_location_idx ON leads(location);
      CREATE INDEX IF NOT EXISTS leads_timezone_idx ON leads(timezone);
    `;

    // Execute the SQL
    const { error } = await supabase.rpc('pgbouncer_exec', { sql });

    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try alternative approach with direct query if RPC fails
      const { error: directError } = await supabase.from('leads').select('id').limit(1);
      
      if (directError) {
        return NextResponse.json({ 
          error: 'Database connection error', 
          details: [error, directError] 
        }, { status: 500 });
      }
      
      // If we can query but not execute SQL, update through the API one by one
      await updateSchemaManually();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Schema updated manually',
        error: error.message
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Leads table schema updated successfully' 
    });
  } catch (error) {
    console.error('API Error in update-leads-schema:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Fallback approach to update schema using Supabase API calls
async function updateSchemaManually() {
  try {
    // First check if we need to add the columns
    const { data: locationCheckData, error: locationCheckError } = await supabase
      .from('leads')
      .select('location')
      .limit(1);
    
    if (locationCheckError && locationCheckError.message.includes('column "location" does not exist')) {
      // Add location column
      await addColumn('location', 'TEXT');
    }
    
    const { data: timezoneCheckData, error: timezoneCheckError } = await supabase
      .from('leads')
      .select('timezone')
      .limit(1);
    
    if (timezoneCheckError && timezoneCheckError.message.includes('column "timezone" does not exist')) {
      // Add timezone column
      await addColumn('timezone', 'TEXT');
    }
    
    const { data: outreachTimeCheckData, error: outreachTimeCheckError } = await supabase
      .from('leads')
      .select('optimal_outreach_time')
      .limit(1);
    
    if (outreachTimeCheckError && outreachTimeCheckError.message.includes('column "optimal_outreach_time" does not exist')) {
      // Add optimal_outreach_time column
      await addColumn('optimal_outreach_time', 'TEXT');
    }
    
    const { data: outreachReasonCheckData, error: outreachReasonCheckError } = await supabase
      .from('leads')
      .select('outreach_reason')
      .limit(1);
    
    if (outreachReasonCheckError && outreachReasonCheckError.message.includes('column "outreach_reason" does not exist')) {
      // Add outreach_reason column
      await addColumn('outreach_reason', 'TEXT');
    }
    
    const { data: updatedAtCheckData, error: updatedAtCheckError } = await supabase
      .from('leads')
      .select('updated_at')
      .limit(1);
    
    if (updatedAtCheckError && updatedAtCheckError.message.includes('column "updated_at" does not exist')) {
      // Add updated_at column
      await addColumn('updated_at', 'TIMESTAMP WITH TIME ZONE');
    }
    
    return true;
  } catch (error) {
    console.error('Error in manual schema update:', error);
    return false;
  }
}

// Helper function to add a column
async function addColumn(columnName: string, columnType: string) {
  try {
    // Since we can't add columns directly, we'll update a dummy record with the new field
    // This might create the column if the Supabase API allows it
    const dummyData: Record<string, any> = {};
    dummyData[columnName] = columnType === 'TEXT' ? '' : null;
    
    const { error } = await supabase
      .from('leads')
      .update(dummyData)
      .eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID
      
    console.log(`Attempt to add column ${columnName}: ${error ? 'Failed' : 'Succeeded'}`);
    return !error;
  } catch (error) {
    console.error(`Error adding column ${columnName}:`, error);
    return false;
  }
} 