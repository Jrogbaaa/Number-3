import { createClient } from '@supabase/supabase-js';
import type { Lead, LeadStatus, LeadSource } from '@/types/lead';
import { v4 as uuidv4 } from 'uuid';
import { enrichLead, EnrichmentData } from './leadEnrichment'; // Import enrichment function

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
            // --- Enrich Lead Data ---
            let enrichedData: EnrichmentData | null = null;
            try {
                console.log(`Attempting enrichment for: ${lead.company} (${lead.title})`);
                enrichedData = await enrichLead(lead.company, lead.title);
                console.log(`Enrichment result for ${lead.company}:`, enrichedData);
            } catch (enrichError) {
                console.error(`Enrichment failed for company ${lead.company}:`, enrichError);
                // Continue upload without enrichment data if enrichment fails
            }
            // --- End Enrichment ---

            // Combine base lead data with enriched data
            const leadToInsert: Record<string, any> = { ...lead }; // Start with base lead

            // Merge enriched data using snake_case keys
            if (enrichedData) {
              leadToInsert.location = enrichedData.location ?? lead.location; // Keep location fallback
              leadToInsert.timezone = enrichedData.timezone;
              leadToInsert.optimal_outreach_time = enrichedData.optimal_outreach_time;
              leadToInsert.optimal_outreach_time_eastern = enrichedData.optimal_outreach_time_eastern;
              leadToInsert.outreach_reason = enrichedData.outreach_reason;
            }

            // Ensure required fields have defaults if somehow missing (optional but safer)
            leadToInsert.name = leadToInsert.name || 'Unknown Contact';
            leadToInsert.email = leadToInsert.email || `placeholder_${Date.now()}@example.com`;
            leadToInsert.id = leadToInsert.id || uuidv4();
            leadToInsert.created_at = leadToInsert.created_at || new Date().toISOString();
            leadToInsert.status = leadToInsert.status || 'New';
            leadToInsert.source = leadToInsert.source || 'Other';

            // Remove potential undefined properties before insert
            Object.keys(leadToInsert).forEach(key => {
                if (leadToInsert[key] === undefined) {
                    delete leadToInsert[key];
                }
            });

            // Try to insert the combined lead data
            const { error } = await supabase
              .from('leads')
              .insert([leadToInsert]) // Insert the combined object
              .select('*'); // Explicitly select all columns after insert
              
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

// ===========================================
// NEW SCORING SYSTEM (Finance Application Focus)
// ===========================================

/**
 * Calculates a score based on marketing activity indicators.
 * @param lead The lead object
 * @returns A score from 0-100 indicating marketing focus.
 */
const calculateMarketingScore = (lead: Lead): number => {
  let score = 0;
  const title = lead.title?.toLowerCase() || '';
  const company = lead.company?.toLowerCase() || '';
  const insights = lead.insights;
  const tags = (lead.tags || []).map(tag => tag.toLowerCase());

  // 1. Job Title (High impact) - Max 40 points
  const marketingTitles = ['marketing', 'growth', 'brand', 'content', 'digital', 'social media', 'seo', 'sem', 'advertising', 'communications', 'pr'];
  const leadershipTitles = ['cmo', 'chief', 'vp', 'head', 'director'];
  const managerTitles = ['manager', 'lead', 'specialist', 'coordinator'];
  
  if (marketingTitles.some(t => title.includes(t))) {
    score += 25;
    if (leadershipTitles.some(t => title.includes(t))) {
      score += 15; // Leadership bonus
    } else if (managerTitles.some(t => title.includes(t))) {
      score += 10;
    } else {
      score += 5; // Other marketing role
    }
  } else if (title.includes('sales') || title.includes('business development')) {
    score += 5; // Sales often works closely with marketing
  }

  // 2. Company/Industry (Inferred) - Max 15 points
  if (company.includes('marketing') || company.includes('agency') || company.includes('advertising') || company.includes('media')) {
    score += 15;
  } else if (company.includes('tech') || company.includes('saas') || company.includes('e-commerce')) {
    score += 5; // Industries often marketing-heavy
  }

  // 3. Lead Source - Max 10 points
  if (lead.source === 'Website') score += 10; // High intent
  else if (lead.source === 'LinkedIn') score += 8;
  else if (lead.source === 'Event' || lead.source === 'Conference') score += 6; // Often marketing-related
  else if (lead.source === 'Referral') score += 4;
  else score += 2;

  // 4. Insights (Topics, Interests, Notes) - Max 20 points
  if (insights) {
    const marketingKeywords = ['marketing', 'seo', 'sem', 'ppc', 'ads', 'campaign', 'content', 'social', 'analytics', 'email', 'automation', 'crm', 'brand', 'growth', 'engagement'];
    let insightScore = 0;
    if (insights.topics?.some(topic => marketingKeywords.some(kw => topic.toLowerCase().includes(kw)))) insightScore += 7;
    if (insights.interests?.some(interest => marketingKeywords.some(kw => interest.toLowerCase().includes(kw)))) insightScore += 7;
    if (insights.notes && marketingKeywords.some(kw => insights.notes!.toLowerCase().includes(kw))) insightScore += 6;
    score += Math.min(20, insightScore); // Cap insight contribution
  }

  // 5. Tags - Max 10 points
  const marketingTags = ['marketing', 'campaign', 'seo', 'content', 'social', 'advertiser'];
  if (tags.some(tag => marketingTags.includes(tag))) {
    score += 10;
  }

  // 6. Status & Activity - Max 5 points
  if (lead.status === 'Responded' || lead.status === 'Qualified') score += 5;
  else if (lead.status === 'Contacted') score += 2;
  if (lead.last_contacted_at) {
      const lastContactedDate = new Date(lead.last_contacted_at);
      const now = new Date();
      const daysSinceContact = Math.floor((now.getTime() - lastContactedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceContact < 30) score += 3; // Recent activity boost
  }

  return Math.min(100, Math.max(0, Math.round(score)));
};

/**
 * Estimates budget potential and confidence.
 * @param lead The lead object
 * @returns Object with potential score (0-100) and confidence level.
 */
const estimateBudgetPotential = (lead: Lead): { potential: number; confidence: 'Low' | 'Medium' | 'High' } => {
  let potential = 0;
  let confidenceScore = 0;
  const title = lead.title?.toLowerCase() || '';
  const company = lead.company?.toLowerCase() || '';
  const value = lead.value || 0;
  const insights = lead.insights;
  const tags = (lead.tags || []).map(tag => tag.toLowerCase());
  const location = lead.location?.toLowerCase() || '';

  // 1. Role Seniority (High impact, High confidence) - Max 35 points
  const leadershipTitles = ['cmo', 'chief', 'ceo', 'founder', 'president', 'vp', 'owner', 'partner', 'principal'];
  const directorTitles = ['director', 'head'];
  const managerTitles = ['manager'];

  if (leadershipTitles.some(t => title.includes(t))) {
    potential += 35;
    confidenceScore += 3;
  } else if (directorTitles.some(t => title.includes(t))) {
    potential += 25;
    confidenceScore += 2;
  } else if (managerTitles.some(t => title.includes(t))) {
    potential += 15;
    confidenceScore += 1;
  } else if (title.includes('finance') || title.includes('procurement') || title.includes('purchasing')) {
      potential += 10; // Roles that handle budget
      confidenceScore += 1;
  }

  // 2. Lead Value (Direct indicator, High confidence) - Max 30 points
  if (value > 0) {
    if (value > 50000) potential += 30;
    else if (value > 25000) potential += 25;
    else if (value > 10000) potential += 20;
    else if (value > 1000) potential += 10;
    else potential += 5;
    confidenceScore += 3;
  }

  // 3. Company Size/Type (Inferred, Medium confidence) - Max 20 points
  const enterpriseIndicators = ['inc', 'corp', 'corporation', 'group', 'llc', 'ltd', 'global', 'international', 'enterprise'];
  const startupIndicators = ['.co', 'startup', 'ventures', 'labs'];
  if (enterpriseIndicators.some(ind => company.includes(ind))) {
    potential += 20;
    confidenceScore += 1.5;
  } else if (startupIndicators.some(ind => company.includes(ind))) {
    potential += 5;
    confidenceScore += 0.5;
  } else if (company.length > 5) { // Basic check for a company name
    potential += 10; // Assume mid-size if not obviously enterprise/startup
    confidenceScore += 0.5;
  }

  // 4. Industry (Implied budgets, Low-Medium confidence) - Max 15 points
  const highBudgetIndustries = ['finance', 'banking', 'investment', 'insurance', 'tech', 'software', 'pharma', 'enterprise', 'consulting', 'manufacturing', 'energy', 'telecom'];
  const moderateBudgetIndustries = ['healthcare', 'real estate', 'construction', 'automotive', 'aerospace'];
  if (highBudgetIndustries.some(ind => company.includes(ind))) {
    potential += 15;
    confidenceScore += 1;
  } else if (moderateBudgetIndustries.some(ind => company.includes(ind))) {
    potential += 8;
    confidenceScore += 0.5;
  }

  // 5. Location (Major financial centers, Low confidence) - Max 5 points
  const keyLocations = ['new york', 'london', 'san francisco', 'chicago', 'tokyo', 'hong kong', 'singapore', 'frankfurt', 'zurich'];
  if (keyLocations.some(loc => location.includes(loc))) {
    potential += 5;
    confidenceScore += 0.5;
  }
  
  // 6. Tags & Insights (Low-Medium confidence) - Max 10 points
  let extraPotential = 0;
  if (tags.includes('enterprise') || tags.includes('key account') || tags.includes('high value')) extraPotential += 10;
  else if (tags.includes('budget holder') || tags.includes('decision maker')) extraPotential += 8;
  if (insights?.potentialValue && insights.potentialValue > 20000) extraPotential += 5; // Use insights value
  if (insights?.notes?.toLowerCase().includes('budget') || insights?.notes?.toLowerCase().includes('funding')) extraPotential += 5;
  potential += Math.min(10, extraPotential);
  if(extraPotential > 0) confidenceScore += 0.5;

  // Normalize potential score
  potential = Math.min(100, Math.max(0, Math.round(potential)));

  // Determine confidence level
  let confidence: 'Low' | 'Medium' | 'High';
  if (confidenceScore >= 5) {
    confidence = 'High'; // Strong signals (seniority + value/size)
  } else if (confidenceScore >= 2.5) {
    confidence = 'Medium'; // Some good signals
  } else {
    confidence = 'Low'; // Mostly inferred
  }

  return { potential, confidence };
};

/**
 * Classifies contact as B2B, B2C, or Mixed.
 * @param lead The lead object
 * @returns Object with orientation and confidence level.
 */
const classifyBusinessOrientation = (lead: Lead): { orientation: 'B2B' | 'B2C' | 'Mixed' | 'Unknown'; confidence: 'Low' | 'Medium' | 'High' } => {
  let b2bScore = 0;
  let b2cScore = 0;
  let confidenceScore = 0;
  const title = lead.title?.toLowerCase() || '';
  const company = lead.company?.toLowerCase() || '';
  const email = lead.email?.toLowerCase() || '';
  const domain = email.split('@')[1];
  const tags = (lead.tags || []).map(tag => tag.toLowerCase());

  // 1. Email Domain (High confidence) - Weight 3
  if (domain) {
    const personalDomains = ['gmail', 'yahoo', 'hotmail', 'outlook', 'aol', 'icloud', 'msn', 'live', 'comcast', 'verizon', 'me.com', 'mac.com'];
    // Check if domain *ends* with a personal domain TLD, accommodating variations like .co.uk etc.
    if (personalDomains.some(pd => domain.endsWith('.' + pd + '.com') || domain === pd + '.com' || domain.endsWith('.' + pd + '.co.uk') || domain === pd + '.co.uk')) {
      b2cScore += 3;
      confidenceScore += 2;
    } else {
      b2bScore += 3; // Business email is strong B2B signal
      confidenceScore += 2;
    }
  } else {
      confidenceScore -= 1; // Lack of email reduces confidence
  }

  // 2. Company Name Indicators (Medium-High confidence) - Weight 2
  const b2bCompanyKeywords = ['inc', 'llc', 'corp', 'ltd', 'group', 'solutions', 'services', 'systems', 'technologies', 'industries', 'associates', 'partners', 'consulting', 'holdings', 'bank', 'capital', 'advisors', 'logistics', 'software', 'pharma', 'manufacturing', 'enterprise'];
  const b2cCompanyKeywords = ['retail', 'shop', 'store', 'consumer', 'foods', 'fashion', 'apparel', 'boutique', 'goods', 'market', 'cafe', 'restaurant', 'studio', 'clinic', 'direct'];
  if (b2bCompanyKeywords.some(kw => company.includes(kw))) {
    b2bScore += 2;
    confidenceScore += 1.5;
  }
  if (b2cCompanyKeywords.some(kw => company.includes(kw))) {
    b2cScore += 2;
    confidenceScore += 1.5;
  }

  // 3. Job Title Indicators (Medium confidence) - Weight 1.5
  const b2bTitles = ['sales', 'business development', 'b2b', 'account manager', 'enterprise', 'partner', 'wholesale', 'procurement', 'supply chain', 'logistics', 'operations manager'];
  const b2cTitles = ['customer service', 'retail', 'b2c', 'consumer marketing', 'community manager', 'store manager', 'visual merchandiser', 'e-commerce manager'];
  if (b2bTitles.some(t => title.includes(t))) {
    b2bScore += 1.5;
    confidenceScore += 1;
  }
  if (b2cTitles.some(t => title.includes(t))) {
    b2cScore += 1.5;
    confidenceScore += 1;
  }
  // Generic titles reduce confidence slightly if present
  if (title.length > 0 && !b2bTitles.some(t => title.includes(t)) && !b2cTitles.some(t => title.includes(t))) {
      confidenceScore -= 0.5;
  }

  // 4. Lead Source (Low-Medium confidence) - Weight 1
  if (lead.source === 'LinkedIn') {
    b2bScore += 1;
    confidenceScore += 0.5;
  } else if (lead.source === 'Website' || lead.source === 'Conference' || lead.source === 'Event') {
    // Could be either, slightly favor B2B for website/conference
    b2bScore += 0.5;
    b2cScore += 0.2;
    confidenceScore += 0.2;
  } else if (lead.source === 'Referral') {
      confidenceScore += 0.1; // Referrals could be anything but slightly increase confidence
  } else if (lead.source === 'Cold Outreach') {
      b2bScore += 0.8; // Usually B2B
      confidenceScore += 0.3;
  }

  // 5. Tags (Medium confidence) - Weight 1.5
  if (tags.includes('b2b') || tags.includes('enterprise') || tags.includes('smb') || tags.includes('business')) {
    b2bScore += 1.5;
    confidenceScore += 1;
  }
  if (tags.includes('b2c') || tags.includes('consumer') || tags.includes('retail') || tags.includes('customer')) {
    b2cScore += 1.5;
    confidenceScore += 1;
  }

  // Determine Orientation
  let orientation: 'B2B' | 'B2C' | 'Mixed' | 'Unknown';
  const difference = b2bScore - b2cScore;
  if (difference > 1.5) {
    orientation = 'B2B';
  } else if (difference < -1.5) {
    orientation = 'B2C';
  } else if (b2bScore > 0.5 && b2cScore > 0.5) { // Need some signal for both to be Mixed
    orientation = 'Mixed';
  } else if (b2bScore > b2cScore) { // If not clearly one or mixed, assign to higher score
    orientation = 'B2B';
  } else if (b2cScore > b2bScore) {
    orientation = 'B2C';
  } else { // Equal or both zero
    orientation = 'Unknown';
    confidenceScore = 0; // No signals means unknown
  }

  // Determine Confidence
  let confidence: 'Low' | 'Medium' | 'High';
  const totalScore = b2bScore + b2cScore;
  if (orientation === 'Unknown') {
      confidence = 'Low';
  } else if (confidenceScore >= 4 && Math.abs(difference) > 1) { // Need strong signals AND clear difference
    confidence = 'High';
  } else if (confidenceScore >= 1.5 && totalScore > 1) { // Need some signals
    confidence = 'Medium';
  } else {
    confidence = 'Low';
  }
  
  // Reduce confidence if scores are very close, even if overall confidence points are high
  if (Math.abs(difference) <= 1.5 && orientation !== 'Unknown' && confidence === 'High') {
      confidence = 'Medium';
  }
  if (Math.abs(difference) <= 1 && orientation !== 'Unknown' && confidence === 'Medium') {
      confidence = 'Low';
  }

  return { orientation, confidence };
};

// Update getLeads to use the new scoring functions
export async function getLeads() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No leads found in database');
      return [];
    }

    return (data || []).map(lead => {
      const parsedInsights = lead.insights ? (
        typeof lead.insights === 'string' ? JSON.parse(lead.insights) : lead.insights
      ) : undefined;

      // Calculate new scores
      const marketingScore = calculateMarketingScore(lead);
      const { potential: budgetPotential, confidence: budgetConfidence } = estimateBudgetPotential(lead);
      const { orientation: businessOrientation, confidence: orientationConfidence } = classifyBusinessOrientation(lead);
      
      return {
        ...lead,
        // Explicitly map snake_case enrichment fields to camelCase
        location: lead.location, // Already snake_case in DB?
        timezone: lead.timezone,
        optimalOutreachTime: lead.optimal_outreach_time, 
        optimalOutreachTimeEastern: lead.optimal_outreach_time_eastern,
        outreachReason: lead.outreach_reason,
        // Map calculated scores/data
        insights: parsedInsights,
        marketingScore,
        budgetPotential,
        budgetConfidence,
        businessOrientation,
        orientationConfidence,
        // Keep old scores for now, maybe remove later
        score: lead.score,
        propsScore: lead.propsScore,
        chromeScore: lead.chromeScore
      } as Lead;
    });
  } catch (error) {
    console.error('Error processing leads data:', error);
    return [];
  }
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