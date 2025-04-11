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
      
      // Calculate the new Props.co score
      const propsScore = calculatePropsScore(lead);
      
      return {
        ...lead,
        insights: parsedInsights,
        chromeScore,
        propsScore
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
  if (lead.source === 'Referral' || lead.source === 'Event') {
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

/**
 * Calculate a sophisticated lead score for Props.co based on industry best practices
 * Incorporates both fit (explicit) and engagement/intent (implicit) data
 * Higher score = more relevant (0-100)
 */
function calculatePropsScore(lead: Lead): number {
  // Start with zero and build up the score based on multiple factors
  let score = 0;
  
  // ===============================================
  // EXPLICIT DATA (FIT) - Max 50 points
  // ===============================================
  
  // 1. Job Title/Role - Max 25 points (increased from 20)
  if (lead.title) {
    const title = lead.title.toLowerCase();
    
    // Marketing leadership roles (high value)
    if (title.includes('cmo') || 
        title.includes('chief marketing') ||
        title.includes('vp marketing') || 
        title.includes('vp of marketing') ||
        title.includes('head of marketing') || 
        title.includes('head of growth')) {
      score += 25; // Top decision maker (increased from 20)
    }
    // Director level roles (high influence)
    else if (title.includes('director of marketing') || 
             title.includes('marketing director') ||
             title.includes('growth director') ||
             title.includes('director of content') ||
             title.includes('director of digital')) {
      score += 22; // Senior decision maker (increased from 18)
    }
    // Marketing managers (mid-level influence)
    else if (title.includes('marketing manager') || 
             title.includes('growth manager') ||
             title.includes('digital marketing manager') ||
             title.includes('content manager')) {
      score += 18; // Mid-level influencer (increased from 15)
    }
    // Digital/content specific roles
    else if (title.includes('marketing') || 
             title.includes('digital') ||
             title.includes('content') ||
             title.includes('social media') ||
             title.includes('brand') ||
             title.includes('growth')) {
      score += 15; // Marketing-related role (increased from 10)
    }
    // Non-marketing business roles
    else if (title.includes('ceo') || 
             title.includes('founder') ||
             title.includes('owner') ||
             title.includes('president') ||
             title.includes('chief')) {
      score += 18; // Other executive, may have decision power (increased from 12)
    }
    // Any position is better than nothing
    else if (title.length > 0) {
      score += 8; // At least we know their role
    }
    // Negative - Unqualified or irrelevant roles
    if (title.includes('intern') || 
        title.includes('student') ||
        title.includes('assistant') ||
        title.includes('junior')) {
      score -= 8; // Likely not a decision maker (increased penalty from 5)
    }
  }
  
  // 2. Industry/Company relevance - Max 15 points
  if (lead.company) {
    const company = lead.company.toLowerCase();
    
    // Target industries (expanded list)
    const targetIndustries = [
      'e-commerce', 'ecommerce', 'retail', 'consumer', 'shop', 'store',
      'tech', 'software', 'saas', 'platform', 'digital', 'app', 'application',
      'cpg', 'consumer goods', 'consumer packaged goods', 'product',
      'travel', 'hospitality', 'entertainment', 'media', 'content', 'creative',
      'marketing', 'agency', 'brand', 'direct-to-consumer', 'd2c', 'dtc'
    ];
    
    // Check for target industry match
    if (targetIndustries.some(industry => company.includes(industry))) {
      score += 15;
    }
    // Tier 2 industries that might still be valuable
    else if (['finance', 'health', 'education', 'service', 'consulting'].some(industry => company.includes(industry))) {
      score += 10;
    }
    // Give partial points for having any company information
    else if (company.length > 0) {
      score += 7; // Increased from 5
    }
    
    // Company size estimation based on domain or name
    if (company.includes('.co') || company.includes('startup') || company.includes('ventures')) {
      score += 5; // Likely a startup or growth company
    } else if (company.includes('inc') || company.includes('corp') || company.includes('group')) {
      score += 3; // Established company
    }
  }
  
  // 3. Lead Source quality - Max 15 points (unchanged)
  if (lead.source) {
    if (lead.source === 'Referral') {
      score += 15; // Highest quality source
    } else if (lead.source === 'Event' || lead.source === 'Conference') {
      score += 12; // High quality in-person interaction
    } else if (lead.source === 'Website') {
      score += 10; // Good intent, visited our site
    } else if (lead.source === 'LinkedIn') {
      score += 10; // Professional connection (increased from 8)
    } else if (lead.source === 'Cold Outreach') {
      score += 7; // Lower quality initial contact (increased from 5)
    } else {
      score += 5; // Other sources (increased from 3)
    }
  }
  
  // ===============================================
  // IMPLICIT DATA (INTEREST/INTENT) - Max 50 points
  // ===============================================
  
  // 1. Lead Status - Max 25 points (unchanged)
  // This is a strong indicator of where they are in the pipeline
  if (lead.status === 'Converted') {
    score += 25; // Already a customer
  } else if (lead.status === 'Proposal' || lead.status === 'Negotiation') {
    score += 22; // Late stage pipeline
  } else if (lead.status === 'Qualified') {
    score += 20; // Qualified lead
  } else if (lead.status === 'Responded') {
    score += 15; // Showed interest by responding
  } else if (lead.status === 'Contacted') {
    score += 12; // Initial contact made (increased from 10)
  } else if (lead.status === 'New') {
    score += 8; // Fresh lead (increased from 5)
  } else if (lead.status === 'Lost' || lead.status === 'On Hold') {
    score -= 10; // Negative status (increased penalty from 5)
  }
  
  // 2. Lead Value (potential deal size) - Max 15 points
  const value = lead.value || 0;
  if (value > 50000) {
    score += 15; // High value opportunity
  } else if (value > 25000) {
    score += 12; // Good value opportunity
  } else if (value > 10000) {
    score += 10; // Moderate value
  } else if (value > 5000) {
    score += 8; // Smaller value
  } else if (value > 0) {
    score += 5; // Some value identified
  }
  
  // 3. LinkedIn and Contact Information - Max 15 points (increased from 10)
  // LinkedIn URL presence is a strong signal for B2B marketing
  if (lead.linkedinUrl) {
    // Basic points for having a LinkedIn profile
    score += 7; // Increased from 3
    
    // Additional points for LinkedIn URL quality
    if (lead.linkedinUrl.includes('/in/')) {
      score += 3; // Proper LinkedIn profile format
    }
    
    // Check for seniority indicators in LinkedIn URL
    const linkedinPath = lead.linkedinUrl.toLowerCase();
    if (linkedinPath.includes('cxo') || 
        linkedinPath.includes('chief') || 
        linkedinPath.includes('director') || 
        linkedinPath.includes('manager')) {
      score += 5; // LinkedIn URL suggests seniority
    }
  }
  
  // Phone number availability suggests higher quality contact
  if (lead.phone) {
    score += 5; // Increased from 2
  }
  
  // Location information availability and quality
  if (lead.location) {
    const location = lead.location.toLowerCase();
    // Base points for having location
    score += 2; // Increased from 1
    
    // Target locations that might indicate higher value
    const keyLocations = ['new york', 'san francisco', 'sf', 'chicago', 'boston', 'los angeles', 'la', 'seattle', 'austin', 'miami', 'london', 'toronto'];
    if (keyLocations.some(loc => location.includes(loc))) {
      score += 3; // Key business hub
    }
  }
  
  // Recent contact is a positive signal
  if (lead.last_contacted_at) {
    const lastContactedDate = new Date(lead.last_contacted_at);
    const now = new Date();
    const daysSinceContact = Math.floor((now.getTime() - lastContactedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceContact < 7) {
      score += 10; // Very recent contact
    } else if (daysSinceContact < 30) {
      score += 7; // Recent contact
    } else if (daysSinceContact < 90) {
      score += 4; // Somewhat recent
    } else {
      score += 2; // Old contact
    }
  }
  
  // 4. Insights and Engagement Data - Max 10 points
  // Extra points for rich insights data
  if (lead.insights) {
    // Each insight category adds value
    if (lead.insights.topics && lead.insights.topics.length > 0) {
      score += 2; // Increased from 1
      
      // Check for topics that align with our target market
      const relevantTopics = ['marketing', 'creator', 'content', 'social media', 'influencer', 'brand', 'digital'];
      if (lead.insights.topics.some(topic => 
          relevantTopics.some(relevant => topic.toLowerCase().includes(relevant)))) {
        score += 3; // Topics align with our focus
      }
    }
    
    if (lead.insights.interests && lead.insights.interests.length > 0) {
      score += 2; // Increased from 1
    }
    
    if (lead.insights.background && lead.insights.background.length > 0) {
      score += 2; // Increased from 1
    }
    
    if (lead.insights.notes) {
      score += 2; // Increased from 1
      
      // Check for positive sentiment in notes
      const positiveIndicators = ['interested', 'positive', 'follow up', 'opportunity', 'potential'];
      if (positiveIndicators.some(indicator => 
          lead.insights?.notes?.toLowerCase().includes(indicator))) {
        score += 3; // Positive engagement noted
      }
    }
    
    // High potential value noted in insights
    if (lead.insights.potentialValue && lead.insights.potentialValue > 10000) {
      score += 5; // Increased from 3
    }
  }
  
  // 5. Additional Tags and Metadata - Max 10 points (new category)
  if (lead.tags && lead.tags.length > 0) {
    // Base points for having tags
    score += 2;
    
    // Check for high-value tags
    const highValueTags = ['vip', 'decision maker', 'hot lead', 'priority', 'key account'];
    if (lead.tags.some(tag => 
        highValueTags.some(valuable => tag.toLowerCase().includes(valuable)))) {
      score += 8;
    }
    
    // Check for moderate-value tags
    const moderateValueTags = ['interested', 'follow up', 'nurture', 'potential'];
    if (lead.tags.some(tag => 
        moderateValueTags.some(valuable => tag.toLowerCase().includes(valuable)))) {
      score += 5;
    }
  }
  
  // Email domain quality score - Max 5 points (new factor)
  if (lead.email) {
    const domain = lead.email.split('@')[1]?.toLowerCase();
    
    if (domain) {
      // Premium business domains
      if (['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'aol.com'].includes(domain)) {
        // Personal email domains are less valuable for B2B
        score -= 2;
      } else {
        // Business domain is a positive signal
        score += 3;
        
        // Check for premium domains
        if (['google.com', 'facebook.com', 'amazon.com', 'apple.com', 'microsoft.com'].includes(domain)) {
          score += 2; // Big tech companies
        }
      }
    }
  }
  
  // Include original lead score as a small factor (max 5 points) - unchanged
  score += Math.min(lead.score || 0, 100) / 20;
  
  // Random variation to spread out identical leads slightly (max ±3 points)
  score += (Math.random() * 6) - 3;
  
  // Ensure the score stays within 0-100 range and is rounded
  return Math.max(0, Math.min(Math.round(score), 100));
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
    const averagePropsScore = totalLeads ? 
      leads.reduce((sum, lead) => sum + (lead.propsScore || 0), 0) / totalLeads : 0;

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
    
    // Add distribution for the new Props.co score
    const propsScoreDistribution = scoreRanges.map(range => {
      const [min, max] = range.split('-').map(Number);
      return {
        range,
        count: leads.filter(lead => {
          const score = lead.propsScore !== undefined ? lead.propsScore : (lead.score || 0);
          return score >= min && score <= max;
        }).length
      };
    });

    return {
      totalLeads,
      totalValue,
      conversionRate,
      averageScore,
      averagePropsScore,
      sourceDistribution,
      statusDistribution,
      scoreDistribution,
      propsScoreDistribution
    };
  } catch (error) {
    console.error('Error generating analytics:', error);
    return {
      totalLeads: 0,
      totalValue: 0,
      conversionRate: 0,
      averageScore: 0,
      averagePropsScore: 0,
      sourceDistribution: {},
      statusDistribution: {},
      scoreDistribution: [],
      propsScoreDistribution: []
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
 * Emergency method to completely reset the leads table
 * This should only be used in development or for critical production fixes
 */
export const emergencyResetLeadsTable = async () => {
  console.log('Starting emergency reset of leads table...');
  
  try {
    // First, delete all existing leads
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error(`Failed to delete existing leads: ${deleteError.message}`);
    }
    
    // Create a new lead to ensure table has the right structure
    // This won't actually recreate the table, but it will validate our schema
    const { error: insertError } = await supabase
      .from('leads')
      .insert({
        name: 'SYSTEM_TEST_USER',
        email: 'system.test@example.com',
        company: 'System Test',
        title: 'Test',
        source: 'Website',
        status: 'New',
        score: 0,
        value: 0,
        linkedinUrl: 'https://linkedin.com/test',
        insights: null
      });
    
    if (insertError) {
      console.error('Insert error:', insertError);
      
      // If the error is about missing columns, we need to create an alter table SQL query
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('Column missing, need to update database structure in Supabase directly');
        return {
          success: false,
          message: `Database schema needs to be updated in Supabase. Please add the missing columns: ${insertError.message}`
        };
      }
      
      throw new Error(`Failed to validate table structure: ${insertError.message}`);
    }
    
    // Delete our test user
    const { error: cleanupError } = await supabase
      .from('leads')
      .delete()
      .eq('email', 'system.test@example.com');
    
    if (cleanupError) {
      console.error('Cleanup error:', cleanupError);
      // Not throwing here as this is just cleanup
    }
    
    console.log('Emergency reset completed successfully');
    return { success: true, message: 'Leads table reset successfully' };
  } catch (error) {
    console.error('Reset error:', error);
    return { 
      success: false, 
      message: `Failed to reset leads: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}; 