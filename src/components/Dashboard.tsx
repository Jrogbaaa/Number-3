'use client';

import { useEffect, useState } from 'react';
// Remove Pie chart imports
// import { Pie } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
// } from 'chart.js';
import type { Lead } from '@/types/lead';
import { getLeads, getLeadAnalytics } from '@/lib/supabase';
import { DataUpload } from './shared/DataUpload';
import { DataClear } from './shared/DataClear';
import { toast } from 'sonner';
import { BarChart2, RefreshCw, Upload, AlertCircle, Users, ChevronRight, TrendingUp, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LeadsTable from '@/components/LeadsTable'; // Import LeadsTable

// ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

// Create a key for localStorage to store the sorted leads
const LEADS_STORAGE_KEY = 'optileads_sorted_leads_ids';

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  // Analytics might still be useful for overall stats, but not the pie chart data
  // const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to sort leads based on stored order
  const sortLeadsBasedOnStoredOrder = (leads: Lead[]) => {
    // Try to get previous sort order from localStorage
    try {
      const storedOrderString = localStorage.getItem(LEADS_STORAGE_KEY);
      if (storedOrderString) {
        const storedOrder = JSON.parse(storedOrderString) as string[];
        
        // If we have a valid stored order, use it to sort the leads
        if (Array.isArray(storedOrder) && storedOrder.length > 0) {
          console.log('Using stored lead order from localStorage');
          
          // Create a map for O(1) lookup of position
          const orderMap = new Map<string, number>();
          storedOrder.forEach((id, index) => {
            orderMap.set(id, index);
          });
          
          // Sort leads based on the stored order
          return [...leads].sort((a, b) => {
            const aIndex = a.id ? orderMap.get(a.id) : undefined;
            const bIndex = b.id ? orderMap.get(b.id) : undefined;
            
            // If both have positions, sort by position
            if (aIndex !== undefined && bIndex !== undefined) {
              return aIndex - bIndex;
            }
            
            // If only one has a position, prioritize it
            if (aIndex !== undefined) return -1;
            if (bIndex !== undefined) return 1;
            
            // If neither has a position, leave order unchanged
            return 0;
          });
        }
      }
    } catch (e) {
      console.error('Error using stored lead order:', e);
    }
    
    // If no stored order or error, return leads unchanged
    return leads;
  };

  // New function to remember the current leads order
  const rememberLeadsOrder = (leads: Lead[]) => {
    // Store the IDs of the leads in their current order
    try {
      const leadIds = leads.map(lead => lead.id).filter(Boolean) as string[];
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leadIds));
      console.log('Stored lead order in localStorage');
    } catch (e) {
      console.error('Error storing lead order:', e);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch only leads now, analytics might be less relevant without the chart
      const leadsData = await getLeads();
      
      // Sort leads based on stored order if available
      const sortedLeads = sortLeadsBasedOnStoredOrder(leadsData);
      setLeads(sortedLeads);
      
      // Remember the current lead order for future page loads
      rememberLeadsOrder(sortedLeads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Force reload data completely from Supabase
  const forceRefresh = async () => {
    try {
      setRefreshing(true);
      setLeads([]); // Clear local data first
      // setAnalytics(null);
      
      // Force Supabase to revalidate cache by triggering a specific query
      await supabase
        .from('leads')
        .select('count')
        .limit(1)
        .throwOnError();
      
      // Now get fresh data
      const freshLeads = await getLeads();
      
      // Sort leads based on stored order if available
      const sortedLeads = sortLeadsBasedOnStoredOrder(freshLeads);
      setLeads(sortedLeads);
      
      // Remember the current lead order for future page loads
      rememberLeadsOrder(sortedLeads);
      
      toast.success('Data refreshed successfully', {
        description: `${freshLeads.length} leads loaded from database`,
        duration: 3000
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error refreshing data');
      toast.error('Failed to refresh data', {
        description: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check if we're using sample data (This logic might need update depending on how sample data is identified)
  // useEffect(() => {
  //   // If we're using demo data, show a notification
  //   if (leads.length > 0 && leads[0].id?.startsWith('mock-')) {
  //     const timer = setTimeout(() => {
  //       toast.info('Demo Mode Active', {
  //         description: 'You\'re viewing sample data. Upload your own leads to see real analytics.',
  //         duration: 5000
  //       });
  //     }, 1000);
      
  //     return () => clearTimeout(timer);
  //   }
  // }, [leads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          <div className="text-blue-400">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 mb-4 flex items-center gap-3 max-w-md">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
        <a 
          href="/debug" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
        >
          Troubleshoot Issues
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BarChart2 className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-semibold text-white">Contact Dashboard</h1>
          </div>
          <a 
            href="/debug" 
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-1.5"
          >
            Debug System
            <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="bg-gray-900/70 rounded-xl p-8 max-w-2xl mx-auto border border-gray-800/50 shadow-lg">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white text-center mb-2">Upload Your Contacts</h2>
            <p className="text-gray-400 text-center max-w-md">
              Upload a CSV file with your contacts to start analyzing and tracking them. We'll help you organize and prioritize your outreach.
            </p>
          </div>
          <DataUpload onUploadComplete={loadData} />
        </div>
      </div>
    );
  }

  // Removed pieData const

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-blue-400" />
            {/* Updated Title */}
            <h1 className="text-2xl font-semibold text-white">Contact Scoring Dashboard</h1> 
          </div>
          <div className="flex items-center gap-3">
            <div className="text-gray-400 px-2 py-1 bg-gray-800/50 rounded-md border border-gray-800/70 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {/* Updated label */}
              <span className="text-sm">{leads.length} contacts</span> 
            </div>
            
            <button
              onClick={forceRefresh}
              disabled={refreshing || loading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-2 disabled:opacity-70"
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
            
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete all contacts? This cannot be undone.')) { // Updated confirm text
                  try {
                    const { clearAllLeads } = await import('@/lib/supabase'); // Function name is still clearAllLeads
                    toast.loading('Clearing all contacts...'); // Updated toast text
                    const result = await clearAllLeads();
                    toast.dismiss();
                    
                    if (result.success) {
                      toast.success('All contacts deleted successfully'); // Updated toast text
                      // Reload data
                      loadData();
                    } else {
                      toast.error(`Failed to delete contacts: ${result.message}`); // Updated toast text
                    }
                  } catch (error) {
                    toast.dismiss();
                    toast.error('Error clearing contacts'); // Updated toast text
                    console.error('Error clearing contacts:', error); // Updated log text
                  }
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {/* Updated button text */}
              <span>Clear All Contacts</span> 
            </button>
            
            <a 
              href="/debug" 
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-md transition-colors flex items-center gap-1.5"
              aria-label="Debug system"
            >
              Debug
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Removed Info Box about Data Input page */}
        {/* <div className="bg-blue-900/10 p-4 rounded-xl mb-6 border border-blue-800/30 flex items-start gap-3"> ... </div> */}

        {/* Removed Grid containing Pie Chart and High-Value Leads */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> ... </div> */}
        
        {/* Display the LeadsTable directly */}
        <div className="bg-gray-900/70 rounded-xl p-6 border border-gray-800/50 shadow-md">
           <LeadsTable leads={leads} />
        </div>

      </div>
    </div>
  );
};

export default Dashboard; 