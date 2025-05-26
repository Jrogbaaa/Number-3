#!/usr/bin/env node

/**
 * This script checks and fixes Supabase database issues
 * Run with: node src/scripts/check-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

console.log('🔍 OptiLeads Supabase Database Check 🔍');
console.log('====================================\n');

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
    console.log('🔑 Connected to Supabase at:', supabaseUrl);
    
    // Simple test query to check connection
    const { data: test, error: testError } = await supabase
      .from('leads')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Error connecting to Supabase:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ Successfully connected to Supabase!');
    
    // Check if user_preferences table exists
    console.log('\nChecking if user_preferences table exists...');
    
    // Direct approach using RawBuilder
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences'"
      });
    
    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message);
      console.log('\nTrying alternative approach...');
      
      // Try simple query on the table itself to see if it exists
      const { error: testTableError } = await supabase
        .from('user_preferences')
        .select('id')
        .limit(1);
      
      if (testTableError && testTableError.code === '42P01') { // Table doesn't exist
        console.log('❌ user_preferences table does not exist');
        await createTable();
      } else if (testTableError) {
        console.log('❌ Error querying user_preferences:', testTableError.message);
      } else {
        console.log('✅ user_preferences table exists!');
      }
    } else {
      const tableExists = tables && tables.length > 0;
      
      if (tableExists) {
        console.log('✅ user_preferences table exists!');
      } else {
        console.log('❌ user_preferences table does not exist');
        await createTable();
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function createTable() {
  console.log('\n🛠️ Creating user_preferences table...');
  
  // SQL for creating user_preferences table
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL,
      onboarding_completed BOOLEAN DEFAULT FALSE,
      onboarding_step INTEGER DEFAULT 1,
      company_name TEXT,
      company_size TEXT,
      industry TEXT,
      target_location TEXT,
      target_industries TEXT[] DEFAULT '{}',
      target_company_sizes TEXT[] DEFAULT '{}',
      target_roles TEXT[] DEFAULT '{}',
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
  
  const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
  
  if (createError) {
    console.log('❌ Error creating table:', createError.message);
    console.log('\nTrying to create simple table without RLS...');
    
    const simpleCreateSQL = `
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        onboarding_step INTEGER DEFAULT 1,
        company_name TEXT,
        company_size TEXT,
        industry TEXT,
        target_location TEXT,
        target_industries TEXT[] DEFAULT '{}',
        target_company_sizes TEXT[] DEFAULT '{}',
        target_roles TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    
    const { error: simpleError } = await supabase.rpc('exec_sql', { sql: simpleCreateSQL });
    
    if (simpleError) {
      console.log('❌ Error creating simple table:', simpleError.message);
      console.log('\n⚠️ You will need to create the table manually in Supabase SQL editor.');
    } else {
      console.log('✅ Simple table created successfully!');
    }
  } else {
    console.log('✅ Table created successfully with RLS policies!');
  }
}

main(); 