import { supabase } from './supabase';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  status: string;
  score: number;
  value: number;
  created_at: string;
  updated_at: string;
}

export const LeadsAPI = {
  async getAll(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('score', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }

    return data || [];
  },

  async getById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching lead ${id}:`, error);
      return null;
    }

    return data;
  },

  async create(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return null;
    }

    return data;
  },

  async update(id: string, lead: Partial<Lead>): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .update(lead)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating lead ${id}:`, error);
      return null;
    }

    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting lead ${id}:`, error);
      return false;
    }

    return true;
  },

  async importFromCSV(csvData: any[]): Promise<number> {
    const leads = csvData.map(row => ({
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      source: row.source,
      status: 'New',
      score: calculateLeadScore(row),
      value: row.value ? parseInt(row.value, 10) : 0,
    }));

    const { data, error } = await supabase
      .from('leads')
      .insert(leads)
      .select();

    if (error) {
      console.error('Error importing leads:', error);
      return 0;
    }

    return data?.length || 0;
  },
};

function calculateLeadScore(lead: any, userPreferences?: any): number {
  // Simple scoring algorithm - Incorporating Marketing Relevance & Orientation
  let score = 0;

  // --- Factor 1: Data Completeness (Max 40 points - Reduced slightly) ---
  if (lead.email) score += 15; // Slightly reduced
  if (lead.phone) score += 5;  // Slightly reduced
  if (lead.company) score += 10;
  if (lead.title) score += 5; // Added points for having a title
  if (lead.source) score += 5; // Slightly reduced

  // --- Factor 2: Potential Value (Budget) (Max 30 points - Unchanged) ---
  const value = lead.value ? parseInt(lead.value, 10) : 0;
  if (value > 20000) score += 30;
  else if (value > 10000) score += 20;
  else if (value > 5000) score += 10;

  // --- Factor 3: Lead Source Quality (Max 20 points - Unchanged) ---
  if (lead.source) {
    const source = lead.source.toLowerCase();
    if (source.includes('referral')) score += 20;
    else if (source.includes('linkedin')) score += 15;
    else if (source.includes('website')) score += 10;
    else score += 5;
  }

  // --- Factor 4: Marketing Relevance (Based on Title) (Max 25 points) ---
  let marketingScore = 0;
  if (lead.title) {
    const titleLower = lead.title.toLowerCase();
    if (titleLower.includes('marketing')) marketingScore += 15; // e.g., Marketing Manager, Digital Marketing Specialist
    if (titleLower.includes('cmo') || titleLower.includes('chief marketing officer')) marketingScore += 25; // Highest value
    if (titleLower.includes('vp') && titleLower.includes('marketing')) marketingScore += 20; // VP Marketing
    if (titleLower.includes('head of marketing')) marketingScore += 22; // Head of Marketing
  }
  
  // --- Factor 5: Business Orientation Estimation (Max 10 points) ---
  let orientationScore = 0;
  // Simple heuristic: Default to B2B focus unless strong B2C indicators are found (customize as needed)
  let isLikelyB2C = false; 
  if (lead.company) {
    const companyLower = lead.company.toLowerCase();
    // Add specific known B2C company names or patterns if relevant
  }
  if (lead.title) {
    const titleLower = lead.title.toLowerCase();
    // Add titles strongly indicating B2C if relevant
  }

  if (!isLikelyB2C) {
    // Assume B2B is generally more relevant for this scoring context
    orientationScore += 10; 
  } else {
    // Assign fewer points if likely B2C
    orientationScore += 3; 
  }
  
  // --- Factor 6: User Preferences Adjustment (New) ---
  if (userPreferences) {
    // Apply target role preferences
    if (userPreferences.targetRoles && userPreferences.targetRoles.length > 0 && lead.title) {
      const titleLower = lead.title.toLowerCase();
      const matchesPreferredRole = userPreferences.targetRoles.some((role: string) => 
        titleLower.includes(role.toLowerCase())
      );
      
      if (matchesPreferredRole) {
        score += 20; // Strong bonus for matching preferred roles
      }
    }
    
    // Apply demographic preferences
    if (userPreferences.targetDemographics && lead.insights) {
      const demographics = userPreferences.targetDemographics;
      
      // Gender preference
      if (demographics.gender && demographics.gender !== 'all' && lead.insights.gender) {
        if (lead.insights.gender.toLowerCase() === demographics.gender.toLowerCase()) {
          score += 10;
        }
      }
      
      // Location preferences
      if (demographics.locations && demographics.locations.length > 0 && lead.location) {
        const locationLower = lead.location.toLowerCase();
        const matchesPreferredLocation = demographics.locations.some((location: string) => 
          locationLower.includes(location.toLowerCase())
        );
        
        if (matchesPreferredLocation) {
          score += 10;
        }
      }
    }
    
    // Apply company size preferences
    if (userPreferences.targetCompanySizes && userPreferences.targetCompanySizes.length > 0 && lead.company_size) {
      const matchesPreferredSize = userPreferences.targetCompanySizes.some((size: string) => 
        lead.company_size === size
      );
      
      if (matchesPreferredSize) {
        score += 15;
      }
    }
    
    // Apply industry preferences
    if (userPreferences.targetIndustries && userPreferences.targetIndustries.length > 0 && lead.industry) {
      const industryLower = lead.industry.toLowerCase();
      const matchesPreferredIndustry = userPreferences.targetIndustries.some((industry: string) => 
        industryLower.includes(industry.toLowerCase())
      );
      
      if (matchesPreferredIndustry) {
        score += 15;
      }
    }
    
    // Apply custom scoring weights if specified
    if (userPreferences.customScoringWeights) {
      const weights = userPreferences.customScoringWeights;
      
      // Adjust marketing score weight
      if (weights.marketingScore) {
        const weightMultiplier = weights.marketingScore / 100;
        marketingScore = Math.round(marketingScore * weightMultiplier);
      }
      
      // Adjust orientation score weight
      if (weights.businessOrientation) {
        const weightMultiplier = weights.businessOrientation / 100;
        orientationScore = Math.round(orientationScore * weightMultiplier);
      }
    }
  }
  
  // Add the adjusted scores
  score += Math.min(marketingScore, 25); // Cap marketing relevance points at 25
  score += Math.min(orientationScore, 10); // Cap orientation points at 10

  // Final score capped at 100
  return Math.min(score, 100);
} 