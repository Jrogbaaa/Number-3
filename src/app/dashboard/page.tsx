'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lead } from '@/types/lead';
import ContentCalendar from '@/components/ContentCalendar';
import LeadsTable from '@/components/LeadsTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LeadScoreDistribution from '@/components/dashboard/LeadScoreDistribution';
import WelcomeModal from '@/components/ui/WelcomeModal';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    resetFirstVisitFlag?: () => void;
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // Define fetchLeads outside the conditional block to avoid linter error
  const fetchLeads = async () => {
      try {
        setLoading(true);
        
        // Use the new server-side API route instead of direct Supabase call
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
        
        // Sort leads by multiple factors (prioritizing intent, spend authority, etc.)
        const sortedLeads = [...fetchedLeads].sort((a, b) => {
          // 1. Intent Score (Highest priority)
          const intentComparison = (b.intentScore ?? 0) - (a.intentScore ?? 0);
          if (intentComparison !== 0) return intentComparison;
          
          // 2. Spend Authority Score
          const spendAuthorityComparison = (b.spendAuthorityScore ?? 0) - (a.spendAuthorityScore ?? 0);
          if (spendAuthorityComparison !== 0) return spendAuthorityComparison;
          
          // 3. Marketing Score
          const marketingComparison = (b.marketingScore ?? 0) - (a.marketingScore ?? 0);
          if (marketingComparison !== 0) return marketingComparison;
          
          // 4. Chrome/Props Score (backward compatibility)
          return (b.chromeScore ?? 0) - (a.chromeScore ?? 0);
        });
        
        setLeads(sortedLeads);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads data');
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    // Only fetch leads if user is authenticated
    if (status === 'authenticated') {
      fetchLeads();
    }
  }, [status]);

  // Check for first visit when component mounts
  useEffect(() => {
    // Skip if not authenticated
    if (status !== 'authenticated') return;
    
    // Check if the user has visited the dashboard before
    const hasVisitedBefore = localStorage.getItem('hasVisitedDashboard');
    
    // If this is the first visit, show the welcome modal and set the localStorage flag
    if (!hasVisitedBefore) {
      setShowWelcomeModal(true);
      localStorage.setItem('hasVisitedDashboard', 'true');
    }
    
    // Add developer utility to reset first visit flag (available in browser console)
    // Usage: window.resetFirstVisitFlag()
    window.resetFirstVisitFlag = () => {
      localStorage.removeItem('hasVisitedDashboard');
      console.log('First visit flag reset. Refresh the page to see the welcome modal again.');
    };
    
    // Cleanup
    return () => {
      delete window.resetFirstVisitFlag;
    };
  }, [status]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  // If unauthenticated, don't render the dashboard (the redirect will happen)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <DashboardLayout>
      {showWelcomeModal && <WelcomeModal onClose={handleCloseWelcomeModal} />}
      
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Welcome, {session?.user?.name || 'User'} 
          </h1>
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
                  <li><span className="font-medium text-blue-400">Intent Score</span> - Engagement with PROPS content, relevant posting activity, industry group participation</li>
                  <li><span className="font-medium text-green-400">Spend Authority</span> - Budget decision power based on role seniority and company size</li>  
                  <li><span className="font-medium text-yellow-400">Marketing Score</span> - Marketing activity indicators and relevance</li>
                  <li><span className="font-medium text-orange-400">Budget Potential</span> - Estimated financial capacity</li>
                  <li><span className="font-medium text-purple-400">Company Focus</span> - B2B business orientation prioritized</li>
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