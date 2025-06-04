import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    console.log('[API:fix-email-constraint] Starting email constraint fix...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[API:fix-email-constraint] Missing Supabase credentials');
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: Missing Supabase credentials.',
      }, { status: 500 });
    }

    // Check authentication
    console.log('[API:fix-email-constraint] Checking authentication...');
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('[API:fix-email-constraint] No session found');
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated',
      }, { status: 401 });
    }

    console.log(`[API:fix-email-constraint] User authenticated, ID: ${session.user.id}`);
    
    // Create Supabase client with service role to modify constraints
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // SQL to fix the email constraint
    const sql = `
      -- Step 1: Drop the existing global unique constraint on email
      ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_email_key;
      
      -- Step 2: Drop the old unique index if it exists
      DROP INDEX IF EXISTS leads_email_key;
      
      -- Step 3: Create a new unique constraint on (user_id, email) combination
      -- This allows the same email to exist for different users
      ALTER TABLE leads ADD CONSTRAINT leads_user_email_unique UNIQUE (user_id, email);
      
      -- Step 4: Create an index on user_id for better performance
      CREATE INDEX IF NOT EXISTS idx_leads_user_id_email ON leads(user_id, email);
      
      -- Step 5: Create a regular index on email for general queries
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    `;
    
    console.log('[API:fix-email-constraint] Executing SQL to fix constraint...');
    
    // Execute the SQL using the execute_sql function
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql
    });
    
    if (error) {
      console.error('[API:fix-email-constraint] Error executing SQL:', error);
      return NextResponse.json({
        success: false,
        error: `Failed to fix email constraint: ${error.message}`,
        details: error
      }, { status: 500 });
    }
    
    console.log('[API:fix-email-constraint] SQL executed successfully');
    
    // Verify the constraint was added correctly
    const verifySQL = `
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'leads' AND constraint_name = 'leads_user_email_unique';
    `;
    
    const { data: verifyData, error: verifyError } = await supabase.rpc('execute_sql', {
      query: verifySQL
    });
    
    if (verifyError) {
      console.warn('[API:fix-email-constraint] Could not verify constraint:', verifyError);
    } else {
      console.log('[API:fix-email-constraint] Constraint verification:', verifyData);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Email constraint fixed successfully! Users can now have the same email addresses as long as they belong to different users.',
      details: {
        constraintAdded: 'leads_user_email_unique (user_id, email)',
        oldConstraintRemoved: 'leads_email_key (email only)',
        effect: 'Same email can now exist for different users'
      }
    });
    
  } catch (error) {
    console.error('[API:fix-email-constraint] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: `Failed to fix email constraint: ${errorMessage}`,
    }, { status: 500 });
  }
} 