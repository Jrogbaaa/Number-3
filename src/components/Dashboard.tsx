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
import type { Lead } from '@/types/leads';
import { getLeads, getLeadAnalytics } from '@/lib/supabase';
import DataUpload from './shared/DataUpload';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!leads.length) {
    return <DataUpload />;
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