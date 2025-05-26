import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  return handleRescore();
}

export async function GET() {
  return handleRescore();
}

async function handleRescore() {
  try {
    console.log('RESCORE API: Starting lead rescoring process');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials'
      }, { status: 500 });
    }
    
    // Check session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'User not authenticated'
      }, { status: 401 });
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get all leads for this user
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', session.user.id);
      
    if (fetchError) {
      console.error('Error fetching leads:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leads'
      }, { status: 500 });
    }
    
    console.log(`RESCORE API: Found ${leads?.length || 0} leads to process`);
    
    let updatedCount = 0;
    
    if (leads && leads.length > 0) {
      for (const lead of leads) {
        // Calculate marketing score
        const marketingScore = calculateMarketingScore(lead);
        
        // Calculate intent score
        const intentScore = calculateIntentScore(lead);
        
        // Calculate budget potential
        const { potential: budgetPotential, confidence: budgetConfidence } = estimateBudgetPotential(lead);
        
        // Calculate spend authority score
        const spendAuthorityScore = calculateSpendAuthorityScore(lead);
        
        // Calculate business orientation
        const { orientation: businessOrientation, confidence: orientationConfidence } = classifyBusinessOrientation(lead);
        
        // Update the lead with scores
        const { error: updateError } = await supabase
          .from('leads')
          .update({
            marketing_score: marketingScore,
            intent_score: intentScore,
            budget_potential: budgetPotential,
            budget_confidence: budgetConfidence,
            spend_authority_score: spendAuthorityScore,
            business_orientation: businessOrientation,
            orientation_confidence: orientationConfidence,
            score: marketingScore, // For backward compatibility
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);
          
        if (updateError) {
          console.error(`Error updating lead ${lead.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`Updated lead: ${lead.name} with scores: M:${marketingScore}, I:${intentScore}, B:${budgetPotential}, S:${spendAuthorityScore}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully rescored ${updatedCount} leads`,
      totalLeads: leads?.length || 0,
      updatedLeads: updatedCount
    });
    
  } catch (error) {
    console.error('RESCORE API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Scoring functions (copied from update-lead-scores.js for consistency)
function calculateMarketingScore(lead: any): number {
  let score = 0;
  const title = (lead.title || '').toLowerCase();
  const company = (lead.company || '').toLowerCase();
  const insights = lead.insights;
  const tags = (lead.tags || []).map((tag: any) => typeof tag === 'string' ? tag.toLowerCase() : '');

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
      if (insights.topics.some((topic: string) => marketingKeywords.some(kw => topic.toLowerCase().includes(kw)))) {
        insightScore += 7;
      }
    }
    
    if (insights.interests && Array.isArray(insights.interests)) {
      if (insights.interests.some((interest: string) => marketingKeywords.some(kw => interest.toLowerCase().includes(kw)))) {
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
  if (tags.some((tag: string) => marketingTags.includes(tag))) {
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

function calculateIntentScore(lead: any): number {
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

function estimateBudgetPotential(lead: any): { potential: number; confidence: string } {
  let potential = 0;
  let confidenceScore = 0;
  const title = (lead.title || '').toLowerCase();
  const company = (lead.company || '').toLowerCase();
  const value = lead.value || 0;
  const insights = lead.insights;
  const tags = (lead.tags || []).map((tag: any) => typeof tag === 'string' ? tag.toLowerCase() : '');
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
    confidenceScore += 1;
  } else if (startupIndicators.some(ind => company.includes(ind))) {
    potential += 5; // Startups typically have lower budgets
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

function calculateSpendAuthorityScore(lead: any): number {
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

function classifyBusinessOrientation(lead: any): { orientation: string; confidence: string } {
  let b2bScore = 0;
  let b2cScore = 0;
  let confidenceScore = 0;
  const title = (lead.title || '').toLowerCase();
  const company = (lead.company || '').toLowerCase();
  const email = (lead.email || '').toLowerCase();
  const domain = email.split('@')[1] || '';
  const tags = (lead.tags || []).map((tag: any) => typeof tag === 'string' ? tag.toLowerCase() : '');

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
  
  if (b2bTitles.some(title_kw => title.includes(title_kw))) {
    b2bScore += 2;
    confidenceScore += 1;
  }
  if (b2cTitles.some(title_kw => title.includes(title_kw))) {
    b2cScore += 2;
    confidenceScore += 1;
  }

  // Determine orientation
  let orientation = 'Unknown';
  if (b2bScore > b2cScore) {
    orientation = 'B2B';
  } else if (b2cScore > b2bScore) {
    orientation = 'B2C';
  } else if (b2bScore === b2cScore && b2bScore > 0) {
    orientation = 'Mixed';
  }

  // Determine confidence level
  let confidence;
  if (confidenceScore >= 4) {
    confidence = 'High';
  } else if (confidenceScore >= 2) {
    confidence = 'Medium';
  } else {
    confidence = 'Low';
  }

  return { orientation, confidence };
} 