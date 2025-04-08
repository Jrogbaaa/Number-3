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
  // Simple scoring algorithm - this could be much more sophisticated
  let score = 0;

  // Basic presence checks (max 50 points)
  if (lead.email) score += 20;
  if (lead.phone) score += 10;
  if (lead.company) score += 10;
  if (lead.source) score += 10;

  // Value-based score (max 30 points)
  const value = lead.value ? parseInt(lead.value, 10) : 0;
  if (value > 20000) score += 30;
  else if (value > 10000) score += 20;
  else if (value > 5000) score += 10;

  // Source quality (max 20 points)
  if (lead.source) {
    const source = lead.source.toLowerCase();
    if (source.includes('referral')) score += 20;
    else if (source.includes('linkedin')) score += 15;
    else if (source.includes('website')) score += 10;
    else score += 5;
  }

  return Math.min(score, 100);
} 