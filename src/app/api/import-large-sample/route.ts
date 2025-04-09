import { NextResponse } from 'next/server';
import { uploadLeads } from '@/lib/supabase';
import type { Lead, LeadSource } from '@/types/lead';

// Function to generate a large number of test leads
function generateTestLeads(count: number = 500): Lead[] {
  const companies = ['Acme Inc', 'Tech Solutions', 'Growth Co', 'InnovateTech', 'Finance Pro', 'DevShop', 'Data Insights'];
  const titles = ['CEO', 'CTO', 'Marketing Director', 'Product Manager', 'CFO', 'Engineering Lead', 'Sales Manager'];
  const sources: LeadSource[] = ['LinkedIn', 'Website', 'Referral', 'Cold Outreach', 'Event', 'Conference', 'Other'];
  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted'] as const;
  
  return Array(count).fill(null).map((_, index) => {
    const name = `Test User ${index + 1}`;
    const email = `user${index + 1}@example.com`;
    
    // Random data
    const company = companies[Math.floor(Math.random() * companies.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const score = Math.floor(Math.random() * 100);
    const value = Math.floor(Math.random() * 10000);
    
    // Timestamps
    const created_at = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString();
    
    // Some leads have last_contacted_at, some don't
    const last_contacted_at = Math.random() > 0.5 
      ? new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    
    // Sample insights
    const insights = {
      topics: ['Product Demo', 'Pricing'],
      interests: ['AI', 'Automation'],
      potentialValue: Math.floor(Math.random() * 5) + 1
    };
    
    return {
      id: '',
      name,
      email,
      company,
      title,
      source,
      status,
      score,
      value,
      created_at,
      last_contacted_at,
      insights
    };
  });
}

export async function GET(request: Request) {
  try {
    // Get count from query parameter or use default
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get('count');
    const count = countParam ? parseInt(countParam, 10) : 500;
    
    // Cap at 5000 to prevent abuse
    const safeCount = Math.min(count, 5000);
    
    // Generate and upload leads
    const leads = generateTestLeads(safeCount);
    const result = await uploadLeads(leads);
    
    return NextResponse.json({
      success: result.success,
      message: `Generated and imported ${result.successCount || 0} of ${safeCount} leads${result.duplicateCount ? ` (${result.duplicateCount} duplicates skipped)` : ''}`,
      result
    });
  } catch (error) {
    console.error('Error in large sample import:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
} 