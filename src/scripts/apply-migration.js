#!/usr/bin/env node

/**
 * This script applies the user_preferences table migration to Supabase
 * Run with: node src/scripts/apply-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

console.log('🛠️ OptiLeads User Preferences Migration Tool 🛠️');
console.log('============================================\n');

// Check Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials:');
  if (!supabaseUrl) console.log('   - NEXT_PUBLIC_SUPABASE_URL not found');
  if (!supabaseKey) console.log('   - SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    // SQL for creating user_preferences table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        company_name TEXT,
        company_size TEXT,
        industry TEXT,
        target_location TEXT,
        target_industries TEXT[],
        target_company_sizes TEXT[],
        target_roles TEXT[],
        onboarding_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
      
      -- Add row level security policies
      ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
      
      -- Policy to allow users to see only their own preferences
      DROP POLICY IF EXISTS user_preferences_select_policy ON user_preferences;
      CREATE POLICY user_preferences_select_policy ON user_preferences
        FOR SELECT USING (auth.uid() = user_id);
      
      -- Policy to allow users to insert their own preferences
      DROP POLICY IF EXISTS user_preferences_insert_policy ON user_preferences;
      CREATE POLICY user_preferences_insert_policy ON user_preferences
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      -- Policy to allow users to update their own preferences
      DROP POLICY IF EXISTS user_preferences_update_policy ON user_preferences;
      CREATE POLICY user_preferences_update_policy ON user_preferences
        FOR UPDATE USING (auth.uid() = user_id);
    `;

    // Apply migration
    console.log('Applying user_preferences table migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.log('❌ Error applying migration:', error.message);
      
      // Fall back to creating a stored procedure and then calling it
      console.log('\nTrying alternative approach: creating a stored procedure...');
      
      const createProcedureSQL = `
        CREATE OR REPLACE FUNCTION create_user_preferences_table()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          ${createTableSQL}
        END;
        $$;
      `;
      
      const { error: procError } = await supabase.rpc('exec_sql', { sql: createProcedureSQL });
      
      if (procError) {
        console.log('❌ Error creating stored procedure:', procError.message);
        console.log('\n⚠️ You may need to run this SQL manually in the Supabase SQL editor:');
        console.log(createTableSQL);
      } else {
        console.log('✅ Stored procedure created successfully!');
        
        // Call the procedure
        const { error: callError } = await supabase.rpc('create_user_preferences_table');
        
        if (callError) {
          console.log('❌ Error calling procedure:', callError.message);
        } else {
          console.log('✅ Migration applied successfully!');
        }
      }
    } else {
      console.log('✅ Migration applied successfully!');
    }
    
    // Verify table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_preferences');
    
    if (tablesError) {
      console.log('❌ Error verifying table creation:', tablesError.message);
    } else if (tables && tables.length > 0) {
      console.log('✅ Verified user_preferences table exists!');
    } else {
      console.log('❌ Failed to create user_preferences table');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

main(); 