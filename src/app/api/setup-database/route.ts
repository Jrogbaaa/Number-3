import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

// Execute the SQL script to set up the database
async function runSqlScript() {
  try {
    // Read the SQL script file
    const filePath = path.join(process.cwd(), 'setup-database.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // This requires admin privileges, so it may not work with anonymous key
    // It's better to ask users to run the script manually in Supabase dashboard
    const { error } = await supabase.rpc('create_leads_table');
    
    if (error) {
      console.error('Error running SQL script via RPC:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error running SQL script:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const execute = searchParams.get('execute') === 'true';
  
  if (execute) {
    // Execute the SQL script
    const result = await runSqlScript();
    return NextResponse.json(result);
  } else {
    // Return the SQL script content
    try {
      const filePath = path.join(process.cwd(), 'setup-database.sql');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      
      return new NextResponse(fileContents, {
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': 'attachment; filename="setup-database.sql"'
        }
      });
    } catch (error) {
      console.error('Error serving SQL file:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to read SQL file' },
        { status: 404 }
      );
    }
  }
} 