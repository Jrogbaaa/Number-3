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
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-400 mb-4">{error}</div>
        <a 
          href="/debug" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Troubleshoot Issues
        </a>
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-white">Lead Dashboard</h1>
          <a 
            href="/debug" 
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
          >
            Debug System
          </a>
        </div>
        <div className="bg-[#1A1F2B] rounded-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-white text-center mb-4">Upload Your Leads</h2>
          <p className="text-gray-400 text-center mb-6">
            Upload a CSV file with your leads to start analyzing and tracking them.
          </p>
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
          '#ef4444',
          '#f97316',
          '#eab308',
          '#22c55e',
          '#3b82f6',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Lead Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadData}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <span className="text-gray-400">{leads.length} leads analyzed</span>
          <a 
            href="/debug" 
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
          >
            Debug System
          </a>
        </div>
      </div>

      <div className="bg-[#1A1F2B] p-4 rounded-lg mb-4">
        <div className="flex items-start">
          <div className="bg-blue-500/20 p-2 rounded-full mr-3">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-blue-400 font-medium">Upload More Leads</h3>
            <p className="text-gray-400 text-sm mt-1">
              Need to add more leads? Visit <a href="/debug" className="text-blue-400 hover:underline">Debug</a> page to download a sample 
              template and clear existing data if needed.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#1A1F2B] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Score Distribution</h2>
          <div className="h-64">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-[#1A1F2B] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">High-Value Leads</h2>
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.email} className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg hover:bg-[#1A1F2B] transition-colors">
                <div>
                  <p className="text-white font-medium">{lead.name}</p>
                  <div className="flex space-x-2 text-gray-400 text-sm">
                    <span>{lead.email}</span>
                    {lead.company && (
                      <>
                        <span>•</span>
                        <span>{lead.company}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    lead.status === 'Converted' ? 'bg-green-900 text-green-300' :
                    lead.status === 'Qualified' ? 'bg-blue-900 text-blue-300' :
                    'bg-gray-800 text-gray-300'
                  }`}>
                    {lead.status}
                  </div>
                  <span className="text-white font-medium">${lead.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 