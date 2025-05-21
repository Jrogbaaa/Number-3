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

function calculateLeadScore(lead: any): number {
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

  // --- Factor 4: Marketing Relevance (Based on Title) (Max 25 points - NEW) ---
  let marketingScore = 0;
  if (lead.title) {
      const titleLower = lead.title.toLowerCase();
      if (titleLower.includes('marketing')) marketingScore += 15; // e.g., Marketing Manager, Digital Marketing Specialist
      if (titleLower.includes('cmo') || titleLower.includes('chief marketing officer')) marketingScore += 25; // Highest value
      if (titleLower.includes('vp') && titleLower.includes('marketing')) marketingScore += 20; // VP Marketing
      if (titleLower.includes('head of marketing')) marketingScore += 22; // Head of Marketing
      // Consider adding points if company name includes marketing keywords?
      // if (lead.company && lead.company.toLowerCase().includes('marketing')) marketingScore += 5; 
  }
  score += Math.min(marketingScore, 25); // Cap marketing relevance points at 25

  // --- Factor 5: Business Orientation Estimation (Max 10 points - NEW) ---
  let orientationScore = 0;
  // Simple heuristic: Default to B2B focus unless strong B2C indicators are found (customize as needed)
  let isLikelyB2C = false; 
  if (lead.company) {
      const companyLower = lead.company.toLowerCase();
      // Add specific known B2C company names or patterns if relevant
      // e.g., if (['amazon', 'walmart', 'target'].includes(companyLower)) isLikelyB2C = true;
  }
  if (lead.title) {
      const titleLower = lead.title.toLowerCase();
      // Add titles strongly indicating B2C if relevant
      // e.g., if (titleLower.includes('retail') || titleLower.includes('consumer goods')) isLikelyB2C = true;
  }

  if (!isLikelyB2C) {
      // Assume B2B is generally more relevant for this scoring context
      orientationScore += 10; 
  } else {
      // Assign fewer points if likely B2C
      orientationScore += 3; 
  }
  score += Math.min(orientationScore, 10); // Cap orientation points at 10

  // Final score capped at 100 (or slightly higher depending on exact point combination)
  return Math.min(score, 100); // Keep cap at 100 for consistency
} 