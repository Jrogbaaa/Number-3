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
import { toast } from 'sonner';
import { BarChart2, RefreshCw, Upload, AlertCircle, Users, ChevronRight, TrendingUp } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
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
            <h1 className="text-2xl font-semibold text-white">Lead Dashboard</h1>
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

  const pieData = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [
      {
        data: analytics?.scoreDistribution.map((d: any) => d.count) || [],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',  // red
          'rgba(249, 115, 22, 0.7)', // orange
          'rgba(234, 179, 8, 0.7)',  // yellow
          'rgba(34, 197, 94, 0.7)',  // green
          'rgba(59, 130, 246, 0.7)', // blue
        ],
        borderWidth: 1,
        borderColor: [
          'rgba(239, 68, 68, 0.9)',
          'rgba(249, 115, 22, 0.9)',
          'rgba(234, 179, 8, 0.9)',
          'rgba(34, 197, 94, 0.9)',
          'rgba(59, 130, 246, 0.9)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-semibold text-white">Lead Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={loadData}
            className="text-gray-400 hover:text-white transition-colors p-1.5 bg-gray-800/50 rounded-md flex items-center gap-1.5"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs">Refresh</span>
          </button>
          <div className="text-gray-400 px-2 py-1 bg-gray-800/50 rounded-md border border-gray-800/70 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span className="text-sm">{leads.length} leads</span>
          </div>
          <a 
            href="/debug" 
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-1.5"
            aria-label="Debug system"
          >
            Debug System
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
            <h2 className="text-lg font-semibold text-white">Score Distribution</h2>
            <div className="text-xs text-gray-500 bg-gray-800/70 px-2 py-1 rounded">Lead Quality</div>
          </div>
          <div className="h-64 relative">
            <Pie data={pieData} options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#9ca3af',
                    padding: 15,
                    usePointStyle: true,
                    font: {
                      size: 11
                    }
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  titleColor: '#f3f4f6',
                  bodyColor: '#e5e7eb',
                  borderColor: 'rgba(75, 85, 99, 0.3)',
                  borderWidth: 1,
                  padding: 10,
                  boxPadding: 5,
                  usePointStyle: true,
                  titleFont: {
                    weight: 'bold'
                  }
                }
              }
            }} />
          </div>
        </div>

        <div className="bg-gray-900/70 rounded-xl p-6 border border-gray-800/50 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">High-Value Leads</h2>
            <div className="text-xs text-gray-500 bg-gray-800/70 px-2 py-1 rounded">Top prospects</div>
          </div>
          <div className="space-y-3 overflow-auto max-h-64 pr-1">
            {leads.slice(0, 5).map((lead) => (
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
                  <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>${lead.value.toLocaleString()}</span>
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
  );
};

export default Dashboard; 