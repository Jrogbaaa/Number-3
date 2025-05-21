/**
 * Debug utilities for troubleshooting data-related issues
 */

import { supabase } from './supabase';

/**
 * Check if the leads table exists and return its structure
 */
export async function checkLeadsTable() {
  try {
    // Try to query the table directly with a limit
    // If the table doesn't exist, this will return an error
    const { data, error } = await supabase
      .from('leads')
      .select('id')
      .limit(1);
    
    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('Leads table does not exist');
        return { exists: false };
      }
      
      console.error('Error checking for leads table:', error);
      return { exists: false, error: error.message };
    }

    // Table exists, get column info (this will be approximate)
    if (data && data.length > 0) {
      // Extract column names from the first row
      const firstRow = data[0] as Record<string, any>;
      const columns = Object.keys(firstRow).map(column => ({
        column_name: column,
        data_type: typeof firstRow[column],
        is_nullable: 'YES' // We don't know this for sure
      }));
      
      return { 
        exists: true, 
        columns: columns
      };
    } else {
      // Try a describe approach instead
      try {
        // This is a rough approximation - we'll get column names from a dummy lead
        const dummyLead = {
          id: '',
          name: 'Test',
          email: 'test@example.com',
          company: '',
          title: '',
          source: 'Website',
          status: 'New',
          score: 0,
          value: 0,
          created_at: new Date().toISOString(),
          last_contacted_at: undefined,
          insights: {}
        };
        
        const columns = Object.keys(dummyLead).map(column => ({
          column_name: column,
          data_type: typeof dummyLead[column as keyof typeof dummyLead],
          is_nullable: 'YES' // We don't know this for sure
        }));
        
        return { 
          exists: true, 
          columns: columns,
          note: 'Table exists but is empty - column information is approximate'
        };
      } catch (err) {
        console.error('Error getting column info:', err);
        return { 
          exists: true, 
          columns: [],
          error: 'Could not determine column structure'
        };
      }
    }
  } catch (error) {
    console.error('Error in checkLeadsTable:', error);
    return { exists: false, error: String(error) };
  }
}

/**
 * Test connection to Supabase and check authentication
 */
export async function testSupabaseConnection() {
  try {
    // Simple query to test connection
    const startTime = Date.now();
    const { data, error } = await supabase.from('_dummy_query').select('*').limit(1);
    
    // We expect an error because the table doesn't exist, but it should be a specific type of error
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const isConnectionError = error && (
      error.message.includes('connection') || 
      error.message.includes('network') ||
      error.message.includes('timeout')
    );
    
    if (isConnectionError) {
      return { 
        connected: false, 
        error: error.message,
        responseTime 
      };
    }
    
    // Check authentication by getting the user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    return {
      connected: true,
      authenticated: !userError && userData?.user !== null,
      user: userData?.user,
      responseTime,
      error: error ? error.message : null,
      userError: userError ? userError.message : null
    };
  } catch (error) {
    return { 
      connected: false, 
      error: String(error) 
    };
  }
}

/**
 * Validate a lead object against the expected schema
 */
export function validateLead(lead: any) {
  const errors = [];
  
  // Required fields
  if (!lead.name) errors.push('Missing name');
  if (!lead.email) errors.push('Missing email');
  if (!lead.source) errors.push('Missing source');
  if (!lead.status) errors.push('Missing status');
  
  // Type validations
  if (lead.score !== undefined && typeof lead.score !== 'number') {
    errors.push('Score must be a number');
  }
  
  if (lead.value !== undefined && typeof lead.value !== 'number') {
    errors.push('Value must be a number');
  }
  
  if (lead.insights && typeof lead.insights !== 'object') {
    errors.push('Insights must be an object');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 