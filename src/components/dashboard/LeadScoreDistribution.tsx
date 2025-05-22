'use client';

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Lead } from '@/types/lead';

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadScoreDistribution = () => {
  const [distribution, setDistribution] = useState<number[]>([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  
  useEffect(() => {
    async function fetchLeadDistribution() {
      try {
        setLoading(true);
        
        // Use the server-side API route instead of direct Supabase call
        const response = await fetch('/api/fetch-leads');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load leads data');
        }
        
        const leads = data.leads || [];
        setTotalLeads(leads.length);
        
        // Calculate distribution based on Chrome scores
        const scoreDistribution = calculateScoreDistribution(leads);
        setDistribution(scoreDistribution);
      } catch (error) {
        console.error('Error fetching lead distribution:', error);
        // Fallback to empty distribution
        setDistribution([0, 0, 0, 0, 0]);
        setTotalLeads(0);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeadDistribution();
  }, []);
  
  const calculateScoreDistribution = (leads: Lead[]): number[] => {
    const distribution = [0, 0, 0, 0, 0]; // [0-20, 21-40, 41-60, 61-80, 81-100]
    
    leads.forEach(lead => {
      // Always prioritize chromeScore if available
      const score = lead.chromeScore !== undefined && lead.chromeScore !== null 
        ? lead.chromeScore 
        : (lead.score || 0);
      
      if (score <= 20) distribution[0]++;
      else if (score <= 40) distribution[1]++;
      else if (score <= 60) distribution[2]++;
      else if (score <= 80) distribution[3]++;
      else distribution[4]++;
    });
    
    return distribution;
  };

  const scoreLabels = ['0-20', '21-40', '41-60', '61-80', '81-100'];
  const scoreColors = [
    '#EF4444', // Red - 0-20
    '#F97316', // Orange - 21-40
    '#F59E0B', // Yellow - 41-60
    '#84CC16', // Green - 61-80
    '#10B981', // Teal - 81-100
  ];

  const data = {
    labels: scoreLabels,
    datasets: [
      {
        data: distribution,
        backgroundColor: scoreColors,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1000 // Add animation for better UX
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#fff',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#fff',
        bodyColor: '#94A3B8',
        borderWidth: 1,
        borderColor: '#334155',
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const value = context.raw || 0;
            const percentage = totalLeads > 0 ? Math.round((value / totalLeads) * 100) : 0;
            return `Leads: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-gray-800/50 shadow-md">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-5 text-gray-100">OptiLeads.ai Score Distribution</h3>
      </div>
      {loading ? (
        <div className="h-64 w-full flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading distribution data...</div>
        </div>
      ) : (
        <>
          <div className="h-64 w-full flex items-center justify-center">
            <div className="w-64 h-64">
              <Pie data={data} options={options} />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-6 bg-gray-800/50 p-3 rounded-lg">
            {scoreLabels.map((label, index) => {
              const count = distribution[index];
              const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: scoreColors[index] }}
                  />
                  <span className="text-sm text-gray-300">
                    {label}: {count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-center text-gray-400 text-sm mt-4">
            Total: {totalLeads} leads analyzed
          </div>
        </>
      )}
    </div>
  );
};

export default LeadScoreDistribution; 