import { createClient } from '@supabase/supabase-js';
import type { Lead } from '@/types/leads';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function uploadLeads(leads: Lead[]) {
  const { data, error } = await supabase
    .from('leads')
    .upsert(leads, { onConflict: 'email' });

  if (error) throw error;
  return data;
}

export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('value', { ascending: false });

  if (error) throw error;
  return data as Lead[];
}

export async function getLeadAnalytics() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*');

  if (error) throw error;

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
} 