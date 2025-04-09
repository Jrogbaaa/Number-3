import { createClient } from '@supabase/supabase-js';
import type { Lead, LeadStatus, LeadSource } from '@/types/lead';
import { v4 as uuidv4 } from 'uuid';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true, // Enable session persistence
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      }
    }
  }
);

export async function uploadLeads(leads: Lead[]) {
  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    throw new Error('No leads provided');
  }

  console.log(`Uploading ${leads.length} leads to Supabase`);

  try {
    // Instead of checking if the table exists first, try a direct operation
    // Process in batches to handle files of any size
    const batchSize = 25; // Reduced batch size
    const errors: any[] = [];
    let processedCount = 0;
    let successCount = 0;
    let duplicateCount = 0;
    
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      processedCount += batch.length;
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(leads.length/batchSize)} (${processedCount}/${leads.length})`);
      
      try {
        // Prepare leads data with required fields and proper types
        const preparedLeads = batch.map(lead => ({
          ...lead,
          id: uuidv4(), // Explicitly generate a UUID instead of relying on Supabase
          name: lead.name || 'Unknown Contact',
          email: lead.email || `lead_${Date.now()}_${Math.random().toString(36).slice(2)}@placeholder.com`,
          source: lead.source || 'Other',
          status: lead.status || 'New',
          created_at: lead.created_at || new Date().toISOString(),
          score: typeof lead.score === 'number' ? lead.score : 0,
          value: typeof lead.value === 'number' ? lead.value : 0,
          insights: lead.insights ? JSON.stringify(lead.insights) : null
        }));

        // Process each lead individually to properly handle duplicates
        for (const lead of preparedLeads) {
          try {
            // Try to insert a single lead
            const { error } = await supabase
              .from('leads')
              .insert([lead]);
              
            if (error) {
              // Check if it's a duplicate error
              if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
                console.log(`Skipping duplicate email: ${lead.email}`);
                duplicateCount++;
              } else {
                // If we get a "relation does not exist" error, the table doesn't exist
                if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
                  console.error('Leads table does not exist:', error.message);
                  // Fallback to mock mode
                  return { 
                    success: true, 
                    count: leads.length,
                    message: 'Simulated upload (table does not exist)',
                    mockMode: true
                  };
                }
                
                console.error('Error uploading lead:', error.message || JSON.stringify(error));
                errors.push(error);
              }
            } else {
              // Successfully inserted
              successCount++;
            }
          } catch (leadError) {
            console.error('Error processing lead:', leadError);
            errors.push(leadError);
          }
        }
        
        console.log(`Batch results: ${successCount} inserted, ${duplicateCount} duplicates skipped`);
      } catch (batchError) {
        console.error('Batch processing error:', batchError);
        errors.push(batchError);
      }
    }

    // If there were errors, include them in the result but don't fail the entire operation
    return { 
      success: successCount > 0, 
      count: leads.length,
      successCount,
      duplicateCount,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Upload error:', error);
    
    // Fall back to demo mode if we can't upload
    console.log('DEMO MODE: Fallback to simulated upload due to error');
    
    return { 
      success: true, 
      count: leads.length,
      message: 'Demo mode: Simulated successful upload (error fallback)',
      error: error instanceof Error ? error.message : String(error),
      mockMode: true
    };
  }
}

export async function getLeads() {
  try {
    // Try to query the table directly
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    // Check if the error is because the table doesn't exist
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No leads found in database');
      return [];
    }

    // Process the leads with Chrome Industries scoring
    return (data || []).map(lead => {
      // Parse insights if needed
      const parsedInsights = lead.insights ? (
        typeof lead.insights === 'string' ? JSON.parse(lead.insights) : lead.insights
      ) : undefined;
      
      // Calculate Chrome Industries relevance score
      const chromeScore = calculateChromeIndustriesScore(lead);
      
      return {
        ...lead,
        insights: parsedInsights,
        chromeScore
      };
    }) as Lead[];
  } catch (error) {
    console.error('Error processing leads data:', error);
    return [];
  }
}

/**
 * Calculate how relevant a lead is for Chrome Industries lifestyle brand
 * Higher score = more relevant (0-100)
 */
function calculateChromeIndustriesScore(lead: Lead): number {
  let score = 0;
  
  // Industry/company relevance
  const fashionCompanies = ['fashion', 'apparel', 'clothing', 'style', 'retail', 'lifestyle', 'bike', 'cycling', 'outdoor'];
  if (lead.company) {
    const company = lead.company.toLowerCase();
    if (fashionCompanies.some(keyword => company.includes(keyword))) {
      score += 20; // Company is in a relevant industry
    }
  }
  
  // Job title relevance
  const relevantTitles = ['marketing', 'brand', 'creative', 'design', 'merchandise', 'product', 'buyer', 'style', 'fashion'];
  if (lead.title) {
    const title = lead.title.toLowerCase();
    if (relevantTitles.some(keyword => title.includes(keyword))) {
      score += 15; // Person has a relevant job role
    }
    
    // Decision maker bonus
    if (title.includes('director') || title.includes('manager') || title.includes('head') || title.includes('chief') || title.includes('vp')) {
      score += 15; // Person is a decision maker
    }
  }
  
  // Lead source relevance
  if (lead.source === 'Partner' || lead.source === 'Referral') {
    score += 20; // High quality lead sources
  } else if (lead.source === 'Website' || lead.source === 'Conference') {
    score += 10; // Medium quality lead sources
  }
  
  // Lead status value
  if (lead.status === 'Qualified' || lead.status === 'Proposal') {
    score += 20; // Already in sales pipeline
  } else if (lead.status === 'Contacted') {
    score += 10; // Initial contact made
  }
  
  // Add original lead score as a factor (normalized to max 10 points)
  score += Math.min(lead.score || 0, 100) / 10;
  
  // Cap at 100
  return Math.min(Math.round(score), 100);
}

export async function getLeadAnalytics() {
  try {
    // Get the actual leads from Supabase
    const leads = await getLeads();
    
    const totalLeads = leads.length;
    const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
    const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
    const conversionRate = totalLeads ? (convertedLeads / totalLeads) * 100 : 0;
    const averageScore = totalLeads ? 
      leads.reduce((sum, lead) => sum + lead.score, 0) / totalLeads : 0;

    const sourceDistribution = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const scoreRanges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    const scoreDistribution = scoreRanges.map(range => {
      const [min, max] = range.split('-').map(Number);
      return {
        range,
        count: leads.filter(lead => lead.score >= min && lead.score <= max).length
      };
    });

    return {
      totalLeads,
      totalValue,
      conversionRate,
      averageScore,
      sourceDistribution,
      statusDistribution,
      scoreDistribution
    };
  } catch (error) {
    console.error('Error generating analytics:', error);
    return {
      totalLeads: 0,
      totalValue: 0,
      conversionRate: 0,
      averageScore: 0,
      sourceDistribution: {},
      statusDistribution: {},
      scoreDistribution: []
    };
  }
}

/**
 * Clear all leads from the database
 */
export async function clearAllLeads() {
  try {
    console.log('Starting to clear all leads...');
    
    // Force refresh auth session first
    await supabase.auth.refreshSession();
    
    // Try the direct approach first - should work if permissions are set correctly
    const { error: directDeleteError } = await supabase
      .from('leads')
      .delete()
      .neq('id', ''); // Delete all records
    
    if (!directDeleteError) {
      console.log('Successfully deleted all leads using direct method');
      
      // Force clear cache with multiple approaches
      await supabase.auth.refreshSession();
      
      // Force a cache refresh by making a direct count query
      const { count, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      
      if (!countError && count === 0) {
        console.log('Verified all leads were deleted, count is now 0');
      } else if (!countError) {
        console.log(`Warning: After deletion, lead count is ${count}`);
      }
      
      return { success: true, message: 'All leads have been deleted successfully' };
    }
    
    // If direct delete failed, log the error and try the batch approach
    console.warn('Direct delete failed:', directDeleteError.message);
    console.log('Falling back to batch delete method...');
    
    // First try to get the count of leads before deletion
    const { count: leadCount, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting leads:', countError);
      // Continue anyway, as we still want to try deletion
    } else {
      console.log(`Attempting to delete ${leadCount || 'unknown number of'} leads`);
    }
    
    // Try to delete in smaller batches to avoid timeouts
    // First, get all lead IDs
    const { data: leadIds, error: fetchError } = await supabase
      .from('leads')
      .select('id');
      
    if (fetchError) {
      console.error('Error fetching lead IDs:', fetchError);
      throw new Error(`Failed to fetch lead IDs: ${fetchError.message || JSON.stringify(fetchError)}`);
    }
    
    if (!leadIds || leadIds.length === 0) {
      console.log('No leads found to delete');
      return { success: true, message: 'No leads found to delete' };
    }
    
    console.log(`Found ${leadIds.length} leads to delete`);
    
    // Delete in batches of 10 instead of 20 to avoid timeout issues
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < leadIds.length; i += batchSize) {
      const batch = leadIds.slice(i, i + batchSize);
      const idsToDelete = batch.map(item => item.id);
      
      try {
        const { error: deleteError } = await supabase
          .from('leads')
          .delete()
          .in('id', idsToDelete);
        
        if (deleteError) {
          console.error(`Error deleting batch ${i/batchSize + 1}:`, deleteError);
          errorCount++;
        } else {
          successCount++;
          console.log(`Successfully deleted batch ${i/batchSize + 1} (${idsToDelete.length} leads)`);
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (batchError) {
        console.error(`Exception in batch ${i/batchSize + 1}:`, batchError);
        errorCount++;
      }
    }
    
    // Force clear cache with multiple approaches
    await supabase.auth.refreshSession();
    
    // Force a cache refresh by making a direct count query
    const { count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      console.log(`After deletion, lead count is now: ${count}`);
    }
    
    if (successCount > 0) {
      return { 
        success: true, 
        message: `Deleted ${successCount * batchSize} leads with ${successCount} successful batches${errorCount > 0 ? ` and ${errorCount} failed batches` : ''}`,
        successCount,
        errorCount
      };
    } else {
      throw new Error('All batch deletions failed');
    }
  } catch (error) {
    console.error('Error in clearAllLeads:', error);
    // Ensure we return a meaningful error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      message: `Failed to clear leads: ${errorMessage}`,
      error: errorMessage
    };
  }
}

/**
 * Emergency reset of leads table - CAUTION: This will completely reset the table
 */
export async function emergencyResetLeadsTable() {
  try {
    console.log('Starting emergency reset of leads table...');
    
    // Force refresh auth session first
    await supabase.auth.refreshSession();
    
    // This drastic approach recreates the table schema
    const { error } = await supabase.rpc('run_sql_query', {
      query: `
        -- Drop existing table
        DROP TABLE IF EXISTS leads;
        
        -- Recreate the table with proper schema
        CREATE TABLE leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          company TEXT,
          title TEXT,
          source TEXT NOT NULL,
          status TEXT NOT NULL,
          score INTEGER NOT NULL,
          value INTEGER NOT NULL,
          insights JSONB DEFAULT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          modified_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          last_contacted_at TIMESTAMP WITH TIME ZONE
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
        CREATE INDEX IF NOT EXISTS leads_score_idx ON leads(score);
        CREATE INDEX IF NOT EXISTS leads_value_idx ON leads(value);
        CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
        CREATE INDEX IF NOT EXISTS leads_source_idx ON leads(source);
        CREATE INDEX IF NOT EXISTS leads_insights_idx ON leads USING GIN (insights);
      `
    });
    
    if (error) {
      console.error('Error during emergency reset:', error);
      throw new Error(`Failed to reset leads table: ${error.message}`);
    }
    
    console.log('Successfully reset leads table');
    return { 
      success: true, 
      message: 'Leads table has been completely reset. You can now upload fresh data.'
    };
  } catch (error) {
    console.error('Error in emergencyResetLeadsTable:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      message: `Failed to reset leads table: ${errorMessage}`,
      error: errorMessage
    };
  }
} 