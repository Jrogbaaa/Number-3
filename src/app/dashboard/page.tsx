'use client';

import { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';
import ContentCalendar from '@/components/ContentCalendar';
import LeadsTable from '@/components/LeadsTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LeadScoreDistribution from '@/components/dashboard/LeadScoreDistribution';
import { getLeads } from '@/lib/supabase';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        const fetchedLeads = await getLeads();
        
        // Sort leads by Chrome Industries score (highest first)
        const sortedLeads = [...fetchedLeads].sort((a, b) => {
          return (b.chromeScore || 0) - (a.chromeScore || 0);
        });
        
        setLeads(sortedLeads);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeads();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your Leads</h1>
          <div className="text-gray-400">{leads.length} leads analyzed</div>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-pulse text-gray-400">Loading leads data...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            <ContentCalendar />
            
            <div className="card">
              <h2 className="text-xl font-medium mb-4">PROPS Lead Scoring</h2>
              <div className="p-4 mb-6 bg-gray-800/40 text-gray-300 rounded-lg border border-gray-700/50">
                <h3 className="font-medium text-white">PROPS Lead Ranking Factors</h3>
                <p className="text-sm mt-1">Leads are automatically ranked based on the following key factors:</p>
                <ul className="text-sm list-disc list-inside ml-2 mt-1.5 space-y-0.5">
                  <li>High Marketing Score</li>
                  <li>High Budget Potential</li>
                  <li>Company Focus (B2B prioritized over B2C/Mixed)</li>
                </ul>
              </div>
              <div className="space-y-6">
                <LeadScoreDistribution />
                <div>
                  <h3 className="text-lg font-medium mb-3">Top Leads for PROPS</h3>
                  <LeadsTable leads={leads} showChromeScore={true} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 