const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ----- Scoring Functions -----

// Marketing Score calculation
function calculateMarketingScore(lead) {
  let score = 0;
  const title = (lead.title || '').toLowerCase();
  const company = (lead.company || '').toLowerCase();
  const insights = lead.insights;
  const tags = (lead.tags || []).map(tag => typeof tag === 'string' ? tag.toLowerCase() : '');

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
    
    if (insights.topics && Array.isArray(insights.topics)) {
      if (insights.topics.some(topic => marketingKeywords.some(kw => topic.toLowerCase().includes(kw)))) {
        insightScore += 7;
      }
    }
    
    if (insights.interests && Array.isArray(insights.interests)) {
      if (insights.interests.some(interest => marketingKeywords.some(kw => interest.toLowerCase().includes(kw)))) {
        insightScore += 7;
      }
    }
    
    if (insights.notes && marketingKeywords.some(kw => insights.notes.toLowerCase().includes(kw))) {
      insightScore += 6;
    }
    
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
}

// Budget Potential calculation
function estimateBudgetPotential(lead) {
  let potential = 0;
  let confidenceScore = 0;
  const title = (lead.title || '').toLowerCase();
  const company = (lead.company || '').toLowerCase();
  const value = lead.value || 0;
  const insights = lead.insights;
  const tags = (lead.tags || []).map(tag => typeof tag === 'string' ? tag.toLowerCase() : '');
  const location = (lead.location || '').toLowerCase();

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
  
  if (tags.includes('enterprise') || tags.includes('key account') || tags.includes('high value')) {
    extraPotential += 10;
  } else if (tags.includes('budget holder') || tags.includes('decision maker')) {
    extraPotential += 8;
  }
  
  if (insights && insights.potentialValue && insights.potentialValue > 20000) {
    extraPotential += 5; // Use insights value
  }
  
  if (insights && insights.notes && 
      (insights.notes.toLowerCase().includes('budget') || 
       insights.notes.toLowerCase().includes('funding'))) {
    extraPotential += 5;
  }
  
  potential += Math.min(10, extraPotential);
  
  if (extraPotential > 0) {
    confidenceScore += 0.5;
  }

  // Normalize potential score
  potential = Math.min(100, Math.max(0, Math.round(potential)));

  // Determine confidence level
  let confidence;
  if (confidenceScore >= 5) {
    confidence = 'High'; // Strong signals (seniority + value/size)
  } else if (confidenceScore >= 2.5) {
    confidence = 'Medium'; // Some good signals
  } else {
    confidence = 'Low'; // Mostly inferred
  }

  return { potential, confidence };
}

// Business Orientation calculation
function classifyBusinessOrientation(lead) {
  let b2bScore = 0;
  let b2cScore = 0;
  let confidenceScore = 0;
  const title = (lead.title || '').toLowerCase();
  const company = (lead.company || '').toLowerCase();
  const email = (lead.email || '').toLowerCase();
  const domain = email.split('@')[1] || '';
  const tags = (lead.tags || []).map(tag => typeof tag === 'string' ? tag.toLowerCase() : '');

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

  // 2. Company Name Indicators (Medium confidence) - Weight 2
  const b2bKeywords = ['solutions', 'consulting', 'technologies', 'systems', 'enterprise', 'corp', 'inc', 'llc', 'ltd', 'services', 'b2b', 'partners', 'agency'];
  const b2cKeywords = ['shop', 'store', 'retail', 'consumer', 'b2c', 'direct'];
  
  if (b2bKeywords.some(kw => company.includes(kw))) {
    b2bScore += 2;
    confidenceScore += 1;
  }
  if (b2cKeywords.some(kw => company.includes(kw))) {
    b2cScore += 2;
    confidenceScore += 1;
  }

  // 3. Job Title (Medium confidence) - Weight 2
  const b2bTitles = ['account manager', 'sales manager', 'business development', 'channel', 'partner', 'alliance', 'enterprise', 'solution'];
  const b2cTitles = ['customer service', 'retail', 'consumer', 'support'];
  
  if (b2bTitles.some(t => title.includes(t))) {
    b2bScore += 2;
    confidenceScore += 1;
  }
  if (b2cTitles.some(t => title.includes(t))) {
    b2cScore += 2;
    confidenceScore += 1;
  }

  // 4. Lead Source (Low confidence) - Weight 1
  if (lead.source === 'LinkedIn' || lead.source === 'Conference') {
    b2bScore += 1; // Often more B2B focused
  } else if (lead.source === 'Website') {
    // Neutral, could be either
  }

  // 5. Tags (Low confidence) - Weight 1
  if (tags.includes('b2b') || tags.includes('enterprise')) {
    b2bScore += 1;
    confidenceScore += 0.5;
  }
  if (tags.includes('b2c') || tags.includes('consumer') || tags.includes('retail')) {
    b2cScore += 1;
    confidenceScore += 0.5;
  }

  // Determine orientation based on scores
  let orientation;
  const diffScore = b2bScore - b2cScore;
  
  if (Math.abs(diffScore) <= 1) {
    orientation = 'Mixed'; // Very close scores indicate mixed focus
  } else if (diffScore > 1) {
    orientation = 'B2B'; // Significantly higher B2B score
  } else {
    orientation = 'B2C'; // Significantly higher B2C score
  }

  // If both scores are very low, classify as unknown
  if (b2bScore <= 1 && b2cScore <= 1) {
    orientation = 'Unknown';
    confidenceScore = Math.min(confidenceScore, 1); // Low confidence if both scores are low
  }

  // Determine confidence level
  let confidence;
  if (confidenceScore >= 3) {
    confidence = 'High';
  } else if (confidenceScore >= 1.5) {
    confidence = 'Medium';
  } else {
    confidence = 'Low';
  }

  return { orientation, confidence };
}

// Intent Score calculation
function calculateIntentScore(lead) {
  let score = 0;
  const title = (lead.title || '').toLowerCase();
  const company = (lead.company || '').toLowerCase();
  const insights = lead.insights;
  const source = (lead.source || '').toLowerCase();
  const status = (lead.status || '').toLowerCase();
  const lastContactedDate = lead.last_contacted_at ? new Date(lead.last_contacted_at) : null;
  const now = new Date();

  // 1. Lead Source (High impact on intent) - Max 30 points
  if (source === 'website') score += 30; // High intent - directly visited site
  else if (source === 'linkedin') score += 20; // Moderate intent - professional network
  else if (source === 'referral') score += 25; // High intent - vouched for
  else if (source === 'conference' || source === 'event') score += 15; // Moderate intent - in-person
  else if (source === 'cold outreach') score += 8; // Lower intent - not initiated by them
  else score += 5; // Unknown/other sources

  // 2. Lead Status (Highest impact) - Max 35 points
  if (status === 'qualified') score += 35; // Very high intent
  else if (status === 'proposal') score += 30; // Very high intent
  else if (status === 'responded' || status === 'contacted') score += 20; // Moderate intent
  else if (status === 'new') score += 10; // Unknown intent
  else if (status === 'lost') score -= 10; // Negative intent
  
  // 3. Recency of Contact (High impact) - Max 15 points
  if (lastContactedDate) {
    const daysSinceContact = Math.floor((now.getTime() - lastContactedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceContact < 7) score += 15; // Very recent, high intent
    else if (daysSinceContact < 14) score += 10; // Recent, moderate intent
    else if (daysSinceContact < 30) score += 5; // Somewhat recent
    else score += 0; // Not recent, no impact
  }

  // 4. Decision-Making Position (Moderate impact) - Max 10 points
  const decisionMakerKeywords = ['chief', 'ceo', 'cto', 'cmo', 'cfo', 'vp', 'vice president', 'head', 'director', 'owner', 'founder', 'partner'];
  if (decisionMakerKeywords.some(k => title.includes(k))) score += 10;
  else if (title.includes('manager')) score += 5;

  // 5. Content Engagement (If available) - Max 10 points
  if (insights) {
    if (insights.propsContentEngagement) {
      const engagement = insights.propsContentEngagement;
      if (engagement > 75) score += 10;
      else if (engagement > 50) score += 7;
      else if (engagement > 25) score += 5;
      else score += 2;
    }
  }

  // Normalize final score
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Spend Authority Score calculation
function calculateSpendAuthorityScore(lead) {
  let score = 0;
  const title = (lead.title || '').toLowerCase();
  const company = (lead.company || '').toLowerCase();
  const value = lead.value || 0;
  const insights = lead.insights;

  // 1. Executive Role - Max 50 points (Highest impact)
  const execTitles = ['ceo', 'chief executive', 'founder', 'owner', 'president', 'managing partner', 'managing director'];
  const seniorFinanceTitles = ['cfo', 'chief financial', 'finance director', 'vp finance', 'head of finance'];
  const otherCLevelTitles = ['cto', 'cio', 'cmo', 'chief', 'c-suite'];
  const vpDirectorTitles = ['vp', 'vice president', 'vice-president', 'director', 'head of', 'senior director'];
  const managerTitles = ['manager', 'lead', 'principal'];
  
  // Assign points based on role seniority (most important factor)
  if (execTitles.some(t => title.includes(t))) {
    score += 50; // Top decision makers
  } else if (seniorFinanceTitles.some(t => title.includes(t))) {
    score += 45; // Finance decision makers
  } else if (otherCLevelTitles.some(t => title.includes(t))) {
    score += 40; // Other C-level executives
  } else if (vpDirectorTitles.some(t => title.includes(t))) {
    score += 30; // Senior management
  } else if (managerTitles.some(t => title.includes(t))) {
    score += 15; // Middle management
  } else {
    score += 5; // Other roles
  }
  
  // 2. Department/Function (for non-executives) - Max 20 points
  if (score < 30) { // Only apply if not already scored high based on executive role
    const purchasingTitles = ['purchasing', 'procurement', 'buying', 'acquisition'];
    const budgetTitles = ['budget', 'financial planning', 'finance', 'accounting', 'controller'];
    
    if (purchasingTitles.some(t => title.includes(t))) {
      score += 20; // Direct purchasing authority
    } else if (budgetTitles.some(t => title.includes(t))) {
      score += 15; // Budget-related roles
    } else if (title.includes('operations') || title.includes('strategy')) {
      score += 10; // Operational or strategic roles
    }
  }
  
  // 3. Company Size Indicators - Max 15 points
  const enterpriseIndicators = ['global', 'international', 'corporation', 'enterprises', 'worldwide', 'group'];
  const midMarketIndicators = ['inc', 'incorporated', 'limited', 'ltd', 'llc', 'gmbh', 'corp'];
  const smBizIndicators = ['small business', 'freelance', 'startup', 'sole proprietor'];
  
  if (enterpriseIndicators.some(ind => company.includes(ind))) {
    score += 15; // Large company = higher authority threshold
  } else if (midMarketIndicators.some(ind => company.includes(ind))) {
    score += 10; // Mid-market
  } else if (smBizIndicators.some(ind => company.includes(ind))) {
    score += 5; // Small business
  } else if (title.includes('owner') || title.includes('founder')) {
    score += 15; // Owner/founder roles imply spend authority regardless of company indicators
  }
  
  // 4. Lead Value (if provided) - Max 15 points
  if (value > 0) {
    if (value > 50000) score += 15;
    else if (value > 25000) score += 10;
    else if (value > 10000) score += 5;
  }
  
  // Normalize the final score
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Convert local outreach time to Eastern Time
function convertToEasternTime(localTime, timezone) {
  if (!localTime || !timezone) {
    return null;
  }
  
  try {
    // Simple conversion for well-structured time strings
    const timeMatch = localTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) {
      return `${localTime} (Eastern conversion not available)`;
    }
    
    // Convert hours from local time to 24-hour format
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Simple timezone offset mapping (simplified for script)
    const timezoneOffsets = {
      'America/Los_Angeles': -3, // PST to EST = +3
      'America/Denver': -2, // MST to EST = +2
      'America/Chicago': -1, // CST to EST = +1
      'America/New_York': 0, // EST to EST = 0
      'Europe/London': +5, // GMT to EST = -5
      'Europe/Paris': +6, // CET to EST = -6
      'Asia/Tokyo': +14, // JST to EST = -14
      'Australia/Sydney': +15, // AEST to EST = -15
      'UTC': +5 // UTC to EST = -5 (standard time)
    };
    
    // Get the offset if available, default to +0 if unknown timezone
    const offset = timezoneOffsets[timezone] || 0;
    
    // Calculate Eastern time
    let easternHours = (hours + offset) % 24;
    if (easternHours < 0) easternHours += 24;
    
    // Format in 12-hour format with AM/PM
    const easternPeriod = easternHours >= 12 ? 'PM' : 'AM';
    const easternHours12 = easternHours % 12 || 12;
    
    return `${easternHours12}:${minutes.toString().padStart(2, '0')} ${easternPeriod} ET`;
  } catch (error) {
    console.error('Error converting time:', error);
    return `${localTime} (Eastern conversion error)`;
  }
}

// ----- Main Function -----

async function updateLeadScores() {
  console.log('Starting lead score update process...');

  try {
    // Fetch all leads from the database
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('*');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Fetched ${leads.length} leads for scoring.`);

    // Track success/failure counts
    let successCount = 0;
    let failureCount = 0;

    // Process leads and calculate scores
    const batchSize = 20; // For logging purposes only
    let currentBatch = 0;

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      
      if (i % batchSize === 0) {
        currentBatch++;
        console.log(`Processing batch ${currentBatch}...`);
      }
      
      console.log(`Processing lead ${i+1}/${leads.length}: ${lead.name} (${lead.email})`);
      
      // Parse insights if they're stored as a string
      if (lead.insights && typeof lead.insights === 'string') {
        try {
          lead.insights = JSON.parse(lead.insights);
        } catch (e) {
          console.warn(`Could not parse insights for lead ${lead.id}, using empty object.`);
          lead.insights = {};
        }
      }
      
      // Calculate scores
      const marketingScore = calculateMarketingScore(lead);
      const { potential: budgetPotential, confidence: budgetConfidence } = estimateBudgetPotential(lead);
      const { orientation: businessOrientation, confidence: orientationConfidence } = classifyBusinessOrientation(lead);
      const intentScore = calculateIntentScore(lead);
      const spendAuthorityScore = calculateSpendAuthorityScore(lead);
      const optimalOutreachTimeEastern = convertToEasternTime(lead.optimal_outreach_time, lead.timezone);
      
      // Update each lead individually
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          marketing_score: marketingScore,
          budget_potential: budgetPotential,
          budget_confidence: budgetConfidence,
          business_orientation: businessOrientation,
          orientation_confidence: orientationConfidence,
          intent_score: intentScore,
          spend_authority_score: spendAuthorityScore,
          optimal_outreach_time_eastern: optimalOutreachTimeEastern
        })
        .eq('id', lead.id);
        
      if (updateError) {
        console.error(`Error updating lead ${lead.id}:`, updateError);
        failureCount++;
      } else {
        successCount++;
      }
      
      // Show progress every batch
      if ((i + 1) % batchSize === 0 || i === leads.length - 1) {
        console.log(`Progress: ${i + 1}/${leads.length} leads processed (${successCount} successful, ${failureCount} failed)`);
      }
    }

    console.log(`Lead score update completed! ${successCount} leads updated successfully, ${failureCount} failed.`);
    
    // Verify some updates
    console.log('Verifying updates...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('leads')
      .select('id, name, email, marketing_score, budget_potential, business_orientation, intent_score')
      .limit(5);
    
    if (verifyError) {
      console.error('Error verifying updates:', verifyError);
    } else {
      console.log('Sample of updated leads:');
      console.table(verifyData);
    }
    
  } catch (error) {
    console.error('Error updating lead scores:', error);
    process.exit(1);
  }
}

// Run the score update
updateLeadScores(); 