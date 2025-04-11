'use client';

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import type { Lead } from '@/types/lead';
import { getLeads, getLeadAnalytics } from '@/lib/supabase';
import { DataUpload } from './shared/DataUpload';
import { DataClear } from './shared/DataClear';
import { toast } from 'sonner';
import { BarChart2, RefreshCw, Upload, AlertCircle, Users, ChevronRight, TrendingUp, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [leadsData, analyticsData] = await Promise.all([
        getLeads(),
        getLeadAnalytics()
      ]);
      setLeads(leadsData);
      setAnalytics(analyticsData);
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
      setAnalytics(null);
      
      // Force Supabase to revalidate cache by triggering a specific query
      await supabase
        .from('leads')
        .select('count')
        .limit(1)
        .throwOnError();
      
      // Now get fresh data
      const freshLeads = await getLeads();
      setLeads(freshLeads);
      
      // Also reload analytics
      const analyticsData = await getLeadAnalytics();
      setAnalytics(analyticsData);
      
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

  // Check if we're using sample data
  useEffect(() => {
    // If we're using demo data, show a notification
    if (leads.length > 0 && leads[0].id?.startsWith('mock-')) {
      const timer = setTimeout(() => {
        toast.info('Demo Mode Active', {
          description: 'You\'re viewing sample data. Upload your own leads to see real analytics.',
          duration: 5000
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [leads]);

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
            <h1 className="text-2xl font-semibold text-white">PROPS Lead Dashboard</h1>
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
            <h2 className="text-xl font-semibold text-white text-center mb-2">Upload Your Leads</h2>
            <p className="text-gray-400 text-center max-w-md">
              Upload a CSV file with your leads to start analyzing and tracking them. We'll help you organize and prioritize your outreach.
            </p>
          </div>
          <DataUpload onUploadComplete={loadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-semibold text-white">PROPS Lead Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-gray-400 px-2 py-1 bg-gray-800/50 rounded-md border border-gray-800/70 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span className="text-sm">{leads.length} leads</span>
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
                if (window.confirm('Are you sure you want to delete all leads? This cannot be undone.')) {
                  try {
                    const { clearAllLeads } = await import('@/lib/supabase');
                    toast.loading('Clearing all leads...');
                    const result = await clearAllLeads();
                    toast.dismiss();
                    
                    if (result.success) {
                      toast.success('All leads deleted successfully');
                      // Reload data
                      loadData();
                    } else {
                      toast.error(`Failed to delete leads: ${result.message}`);
                    }
                  } catch (error) {
                    toast.dismiss();
                    toast.error('Error clearing leads');
                    console.error('Error clearing leads:', error);
                  }
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Leads</span>
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

        <div className="bg-blue-900/10 p-4 rounded-xl mb-6 border border-blue-800/30 flex items-start gap-3">
          <div className="bg-blue-500/20 p-2 rounded-full">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-blue-400 font-medium">Add More Leads</h3>
            <p className="text-gray-400 text-sm mt-1">
              Need to add more leads? Visit the <a href="/data-input" className="text-blue-400 hover:underline font-medium">Data Input</a> page to upload additional leads, or download a sample template from the <a href="/debug" className="text-blue-400 hover:underline font-medium">Debug</a> page.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/70 rounded-xl p-6 border border-gray-800/50 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">PROPS Score Distribution</h2>
              <div className="text-xs text-gray-500 bg-gray-800/70 px-2 py-1 rounded">Lead Quality</div>
            </div>
            <div className="h-64 relative">
              <Pie data={{
                labels: [
                  'Very Low (0-20)', 
                  'Low (21-40)', 
                  'Medium (41-60)', 
                  'High (61-80)', 
                  'Very High (81-100)'
                ],
                datasets: [
                  {
                    data: analytics?.propsScoreDistribution?.map((d: any) => d.count) || 
                          analytics?.scoreDistribution?.map((d: any) => d.count) || [],
                    backgroundColor: [
                      'rgba(239, 68, 68, 0.85)',   // red-500
                      'rgba(249, 115, 22, 0.85)',  // orange-500
                      'rgba(245, 158, 11, 0.85)',  // amber-500
                      'rgba(16, 185, 129, 0.85)',  // emerald-500
                      'rgba(59, 130, 246, 0.85)',  // blue-500
                    ],
                    borderWidth: 2,
                    borderColor: [
                      'rgba(255, 255, 255, 0.8)',  // white border for all slices
                      'rgba(255, 255, 255, 0.8)',
                      'rgba(255, 255, 255, 0.8)',
                      'rgba(255, 255, 255, 0.8)',
                      'rgba(255, 255, 255, 0.8)',
                    ],
                    hoverBackgroundColor: [
                      'rgba(239, 68, 68, 1)',      // red-500 (full opacity on hover)
                      'rgba(249, 115, 22, 1)',     // orange-500
                      'rgba(245, 158, 11, 1)',     // amber-500
                      'rgba(16, 185, 129, 1)',     // emerald-500
                      'rgba(59, 130, 246, 1)',     // blue-500
                    ],
                    hoverBorderColor: [
                      'rgba(255, 255, 255, 1)',    // white border on hover for all
                      'rgba(255, 255, 255, 1)',
                      'rgba(255, 255, 255, 1)',
                      'rgba(255, 255, 255, 1)',
                      'rgba(255, 255, 255, 1)',
                    ],
                    hoverBorderWidth: 3,
                    offset: [5, 5, 5, 5, 5],       // Explode all slices slightly
                  },
                ],
              }} options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#d1d5db', // gray-300
                      padding: 15,
                      usePointStyle: true,
                      pointStyle: 'circle',
                      font: {
                        size: 11,
                        weight: 'bold'
                      },
                      generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels && data.datasets.length) {
                          return data.labels.map((label, i) => {
                            const dataset = data.datasets[0];
                            const value = dataset.data && dataset.data[i] !== undefined ? dataset.data[i] : 0;
                            const backgroundColor = dataset.backgroundColor as string[];
                            
                            return {
                              text: `${label}: ${value}`,
                              fillStyle: backgroundColor[i],
                              strokeStyle: dataset.borderColor ? (dataset.borderColor as string[])[i] : '#fff',
                              lineWidth: dataset.borderWidth as number,
                              hidden: false,
                              index: i,
                              // @ts-ignore - Chart.js types issue
                              datasetIndex: 0
                            };
                          });
                        }
                        return [];
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',  // slate-900
                    titleColor: '#f8fafc',  // slate-50
                    bodyColor: '#e2e8f0',   // slate-200
                    borderColor: 'rgba(51, 65, 85, 0.5)',  // slate-700
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                      title: (tooltipItems) => {
                        return tooltipItems[0].label;
                      },
                      label: (tooltipItem) => {
                        const dataset = tooltipItem.dataset;
                        const currentValue = dataset.data[tooltipItem.dataIndex] as number;
                        let percentage = 0;
                        let total = 0;
                        
                        // Safely calculate total of all values
                        if (dataset.data) {
                          dataset.data.forEach(val => {
                            if (typeof val === 'number') {
                              total += val;
                            }
                          });
                          
                          percentage = total > 0 ? Math.round((currentValue / total) * 100) : 0;
                        }
                        
                        return `  Leads: ${currentValue} (${percentage}%)`;
                      },
                      afterLabel: (tooltipItem) => {
                        const qualityDescriptions = [
                          'Very low quality leads unlikely to convert',
                          'Low quality leads requiring significant nurturing',
                          'Average leads with moderate conversion potential',
                          'High quality leads showing strong engagement',
                          'Excellent leads with very high conversion potential'
                        ];
                        return `  ${qualityDescriptions[tooltipItem.dataIndex]}`;
                      }
                    }
                  }
                },
                cutout: '40%',   // Increased from 35% for more donut-like appearance
                radius: '90%',   // Use more of the available space
                animation: {
                  animateScale: true,
                  animateRotate: true,
                  duration: 1500 // Longer animation for better effect
                }
              }} />
              {analytics?.averagePropsScore !== undefined && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-gray-900/70 p-3 rounded-full shadow-lg border border-gray-800/50">
                  <div className="text-sm text-gray-400">Average Score</div>
                  <div className="text-2xl font-bold text-white">{analytics.averagePropsScore.toFixed(1)}</div>
                </div>
              )}
            </div>
            <div className="mt-2 text-center text-xs text-gray-400">
              Based on LinkedIn data, job titles, engagement & industry relevance
            </div>
          </div>

          <div className="bg-gray-900/70 rounded-xl p-6 border border-gray-800/50 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">High-Value Leads</h2>
              <div className="text-xs text-gray-500 bg-gray-800/70 px-2 py-1 rounded">Top prospects</div>
            </div>
            <div className="space-y-3 overflow-auto max-h-64 pr-1">
              {leads
                .sort((a, b) => (b.propsScore || b.score) - (a.propsScore || a.score))
                .slice(0, 5)
                .map((lead) => (
                <div 
                  key={lead.email} 
                  className="flex items-center justify-between p-3 bg-gray-900/90 rounded-lg border border-gray-800/60 
                    hover:border-blue-500/30 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer shadow-sm"
                  onClick={() => window.location.href = `/outreach/lead/${lead.id}`}
                >
                  <div>
                    <p className="text-white font-medium">{lead.name}</p>
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <span className="truncate max-w-[180px]">{lead.email}</span>
                      {lead.company && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span>{lead.company}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'Converted' ? 'bg-green-900/30 text-green-400 border border-green-900/30' :
                      lead.status === 'Qualified' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/30' :
                      'bg-gray-800/80 text-gray-300 border border-gray-700/30'
                    }`}>
                      {lead.status}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`px-2 py-0.5 text-xs font-medium rounded ${
                        (lead.propsScore || lead.score) >= 80 ? 'bg-blue-600/20 text-blue-400 border border-blue-700/30' :
                        (lead.propsScore || lead.score) >= 60 ? 'bg-green-600/20 text-green-400 border border-green-700/30' :
                        (lead.propsScore || lead.score) >= 40 ? 'bg-amber-600/20 text-amber-400 border border-amber-700/30' :
                        (lead.propsScore || lead.score) >= 20 ? 'bg-orange-600/20 text-orange-400 border border-orange-700/30' :
                        'bg-red-600/20 text-red-400 border border-red-700/30'
                      }`}>
                        {lead.propsScore || lead.score}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <a href="/outreach" className="block text-center text-sm text-blue-400 hover:text-blue-300 py-2 border-t border-gray-800/50 mt-2 transition-colors">
                View all leads →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 