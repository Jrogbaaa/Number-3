import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Simplified SQL to create the table directly
const createTableSQL = `
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  has_completed_onboarding BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 1,
  company_name TEXT,
  company_industry TEXT,
  company_size TEXT,
  company_product TEXT,
  target_roles TEXT[] DEFAULT '{}',
  target_demographics JSONB DEFAULT '{}',
  target_company_sizes TEXT[] DEFAULT '{}',
  target_industries TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Add row level security policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own preferences
DROP POLICY IF EXISTS user_preferences_select_policy ON public.user_preferences;
CREATE POLICY user_preferences_select_policy ON public.user_preferences
  FOR SELECT USING (user_id = auth.uid()::text);

-- Policy to allow users to insert their own preferences
DROP POLICY IF EXISTS user_preferences_insert_policy ON public.user_preferences;
CREATE POLICY user_preferences_insert_policy ON public.user_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Policy to allow users to update their own preferences
DROP POLICY IF EXISTS user_preferences_update_policy ON public.user_preferences;
CREATE POLICY user_preferences_update_policy ON public.user_preferences
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Create a service role policy to allow your application to access user data
DROP POLICY IF EXISTS "Service role can access all user preferences" ON public.user_preferences;
CREATE POLICY "Service role can access all user preferences"
  ON public.user_preferences
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
`;

export async function GET(request: NextRequest) {
  try {
    // For this specific API, we want to allow public access for initialization
    // Check if the user is authenticated, but don't require it
    const session = await getServerSession(authOptions);

    console.log('[API:migration-status] Session check:', {
      hasSession: !!session,
      userId: session?.user?.id || 'none'
    });

    // Check if the user_preferences table exists
    console.log('[API:migration-status] Checking if table exists...');
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('user_preferences')
      .select('count(*)', { count: 'exact', head: true });

    if (tableCheckError) {
      console.log('[API:migration-status] Table check error:', tableCheckError);

      // Try multiple methods to create the table
      console.log('[API:migration-status] Attempting to create table using direct SQL...');
      
      // Method 1: Try using pgql RPC
      try {
        console.log('[API:migration-status] Attempt 1: Using pgql RPC function');
        const { error: pgqlError } = await supabase.rpc('pgql', { query: createTableSQL });
        
        if (pgqlError) {
          console.error('[API:migration-status] Method 1 failed:', pgqlError);
        } else {
          console.log('[API:migration-status] Method 1 succeeded!');
          return NextResponse.json({ 
            status: 'success',
            message: 'User preferences table created successfully with pgql RPC.' 
          });
        }
      } catch (method1Error) {
        console.error('[API:migration-status] Method 1 exception:', method1Error);
      }
      
      // Method 2: Try using execute_sql RPC if it exists
      try {
        console.log('[API:migration-status] Attempt 2: Using execute_sql RPC function');
        const { error: execError } = await supabase.rpc('execute_sql', { sql_query: createTableSQL });
        
        if (execError) {
          console.error('[API:migration-status] Method 2 failed:', execError);
        } else {
          console.log('[API:migration-status] Method 2 succeeded!');
          return NextResponse.json({ 
            status: 'success',
            message: 'User preferences table created successfully with execute_sql RPC.' 
          });
        }
      } catch (method2Error) {
        console.error('[API:migration-status] Method 2 exception:', method2Error);
      }
      
      // Method 3: Try using exec RPC if it exists
      try {
        console.log('[API:migration-status] Attempt 3: Using exec RPC function');
        const { error: execError } = await supabase.rpc('exec', { sql: createTableSQL });
        
        if (execError) {
          console.error('[API:migration-status] Method 3 failed:', execError);
        } else {
          console.log('[API:migration-status] Method 3 succeeded!');
          return NextResponse.json({ 
            status: 'success',
            message: 'User preferences table created successfully with exec RPC.' 
          });
        }
      } catch (method3Error) {
        console.error('[API:migration-status] Method 3 exception:', method3Error);
      }
      
      // If all methods failed, return a warning to use localStorage fallback
      console.log('[API:migration-status] All table creation methods failed, using localStorage fallback');
      return NextResponse.json({ 
        status: 'warning',
        message: 'Unable to create user_preferences table. The application will use localStorage fallback until database access is restored.' 
      });
    }

    console.log('[API:migration-status] Table exists');
    return NextResponse.json({ 
      status: 'success',
      tableExists: true 
    });
  } catch (err) {
    console.error('[API:migration-status] Unexpected error:', err);
    return NextResponse.json({ 
      status: 'error',
      error: 'Failed to check migration status'
    }, { status: 500 });
  }
} 