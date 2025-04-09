import { NextResponse } from 'next/server';
import type { Lead, LeadSource } from '@/types/lead';

// Generate mock leads for testing and demo purposes
function generateMockLeads(count: number = 25): Lead[] {
  const companies = ['Acme Inc', 'Tech Solutions', 'Growth Co', 'InnovateTech', 'Finance Pro', 'DevShop', 'Data Insights'];
  const titles = ['CEO', 'CTO', 'Marketing Director', 'Product Manager', 'CFO', 'Engineering Lead', 'Sales Manager'];
  const sources: LeadSource[] = ['LinkedIn', 'Website', 'Referral', 'Cold Outreach', 'Event', 'Conference', 'Other'];
  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted'] as const;
  
  return Array(count).fill(null).map((_, index) => {
    // Generate mock data
    return {
      id: `mock-${index}`,
      name: `Test User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      company: companies[index % companies.length],
      title: titles[index % titles.length],
      source: sources[index % sources.length],
      status: statuses[index % statuses.length],
      score: Math.floor(Math.random() * 100),
      value: Math.floor(Math.random() * 10000) + 1000,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      last_contacted_at: index % 3 === 0 
        ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString() 
        : undefined,
      insights: {
        topics: ['Product Demo', 'Pricing'],
        interests: ['AI', 'Automation'],
        potentialValue: Math.floor(Math.random() * 5) + 1
      }
    };
  });
}

export async function GET(request: Request) {
  // Get count from query parameter or use default
  const { searchParams } = new URL(request.url);
  const countParam = searchParams.get('count');
  const count = countParam ? parseInt(countParam, 10) : 25;
  
  // Cap at 100 to prevent abuse
  const safeCount = Math.min(count, 100);
  
  // Generate mock leads
  const mockLeads = generateMockLeads(safeCount);
  
  return NextResponse.json({
    data: mockLeads,
    mockMode: true,
    count: mockLeads.length
  });
} 