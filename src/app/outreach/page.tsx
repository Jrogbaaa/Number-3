'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ScriptGenerator from '@/components/outreach/ScriptGenerator';
import ContentCalendar from '@/components/outreach/ContentCalendar';
import { Lead } from '@/types/lead';

// Client component that uses useSearchParams
function OutreachContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const leadParam = searchParams.get('lead');
  const dayParam = searchParams.get('day');
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<string | null>(leadParam);
  const [selectedDay, setSelectedDay] = useState<string | null>(dayParam);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        
        // Use the same API endpoint as the dashboard to get consistently scored leads
        const response = await fetch('/api/fetch-leads');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load leads data');
        }
        
        const fetchedLeads = data.leads || [];
        setLeads(fetchedLeads);
        
        // Handle lead selection from URL parameter
        if (leadParam) {
          // Redirect to dedicated lead page
          router.push(`/outreach/lead/${leadParam}`);
          return;
        }
        
        // Handle day selection from URL parameter
        if (dayParam && !selectedDay) {
          setSelectedDay(dayParam);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, [leadParam, dayParam, router, selectedDay]);
  
  // Filter leads by day if a day is selected
  const leadsByDay = selectedDay ? 
    leads
      .sort((a, b) => {
        // Use the same multi-factor scoring as the dashboard and calendar
        // 1. Intent Score (Highest priority)
        const intentComparison = (b.intentScore ?? 0) - (a.intentScore ?? 0);
        if (intentComparison !== 0) return intentComparison;
        
        // 2. Spend Authority Score
        const spendAuthorityComparison = (b.spendAuthorityScore ?? 0) - (a.spendAuthorityScore ?? 0);
        if (spendAuthorityComparison !== 0) return spendAuthorityComparison;
        
        // 3. Marketing Score
        const marketingComparison = (b.marketingScore ?? 0) - (a.marketingScore ?? 0);
        if (marketingComparison !== 0) return marketingComparison;
        
        // 4. Budget Potential
        const budgetComparison = (b.budgetPotential ?? 0) - (a.budgetPotential ?? 0);
        if (budgetComparison !== 0) return budgetComparison;
        
        // 5. Fallback to legacy scores if new scores aren't available
        const scoreA = a.chromeScore || a.score || 0;
        const scoreB = b.chromeScore || b.score || 0;
        return scoreB - scoreA;
      })
      .filter(lead => {
        // Determine which day the lead belongs to (using the same algorithm as calendar)
        const sortedLeads = [...leads].sort((a, b) => {
          // Same sorting logic as above
          const intentComparison = (b.intentScore ?? 0) - (a.intentScore ?? 0);
          if (intentComparison !== 0) return intentComparison;
          const spendAuthorityComparison = (b.spendAuthorityScore ?? 0) - (a.spendAuthorityScore ?? 0);
          if (spendAuthorityComparison !== 0) return spendAuthorityComparison;
          const marketingComparison = (b.marketingScore ?? 0) - (a.marketingScore ?? 0);
          if (marketingComparison !== 0) return marketingComparison;
          const budgetComparison = (b.budgetPotential ?? 0) - (a.budgetPotential ?? 0);
          if (budgetComparison !== 0) return budgetComparison;
          const scoreA = a.chromeScore || a.score || 0;
          const scoreB = b.chromeScore || b.score || 0;
          return scoreB - scoreA;
        });
        
        const index = sortedLeads.findIndex(l => l.id === lead.id);
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dayIndex = Math.min(Math.floor(index / 3), 4);
        return weekdays[dayIndex] === selectedDay;
      }) : [];
    
  const handleLeadSelect = (leadId: string) => {
    // Navigate directly to the lead detail page
    router.push(`/outreach/lead/${leadId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lead Outreach</h1>
        {selectedDay && (
          <div className="px-4 py-2 bg-green-900/20 text-green-400 rounded-lg">
            Viewing leads for {selectedDay}
          </div>
        )}
      </div>

      {selectedDay && (
        <div className="bg-[#1A1F2B] rounded-lg p-6">
          <h2 className="text-xl font-medium mb-4">Leads Scheduled for {selectedDay}</h2>
          {loading ? (
            <div className="animate-pulse text-gray-400 py-4">Loading leads...</div>
          ) : leadsByDay.length === 0 ? (
            <div className="text-gray-400 py-4">No leads scheduled for this day.</div>
          ) : (
            <div className="space-y-3">
              {leadsByDay.map(lead => (
                <div 
                  key={lead.id}
                  className="bg-[#0D1117] p-4 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleLeadSelect(lead.id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleLeadSelect(lead.id)}
                  aria-label={`View outreach details for ${lead.name}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-blue-400 hover:underline">{lead.name}</h3>
                      <p className="text-gray-400 text-sm">{lead.company} • {lead.title}</p>
                    </div>
                    <div className="text-green-400 font-medium">
                      {lead.marketingScore || lead.chromeScore || lead.score || 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-medium mb-4">Weekly Outreach Calendar</h2>
        <p className="text-gray-400 mb-6">
          Click on a lead name to view their detailed profile and generate personalized outreach messages.
        </p>
        <ContentCalendar selectedDay={selectedDay} onSelectLead={handleLeadSelect} />
      </div>
    </div>
  );
}

// Loading fallback component
function OutreachLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-gray-400">Loading outreach data...</div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function OutreachPage() {
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        <Suspense fallback={<OutreachLoadingFallback />}>
          <OutreachContent />
        </Suspense>
      </div>
    </DashboardLayout>
  );
} 