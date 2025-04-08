'use client';

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getLeads } from '@/lib/supabase';
import { Lead } from '@/types/lead';

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadScoreDistribution = () => {
  const [distribution, setDistribution] = useState<number[]>([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    async function fetchLeadDistribution() {
      try {
        setLoading(true);
        const leads = await getLeads();
        
        // Calculate distribution based on Chrome scores
        const scoreDistribution = calculateScoreDistribution(leads);
        setDistribution(scoreDistribution);
      } catch (error) {
        console.error('Error fetching lead distribution:', error);
        // Fallback to empty distribution
        setDistribution([0, 0, 0, 0, 0]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeadDistribution();
  }, []);
  
  const calculateScoreDistribution = (leads: Lead[]): number[] => {
    const distribution = [0, 0, 0, 0, 0]; // [0-20, 21-40, 41-60, 61-80, 81-100]
    
    leads.forEach(lead => {
      const score = lead.chromeScore || lead.score || 0;
      
      if (score <= 20) distribution[0]++;
      else if (score <= 40) distribution[1]++;
      else if (score <= 60) distribution[2]++;
      else if (score <= 80) distribution[3]++;
      else distribution[4]++;
    });
    
    return distribution;
  };

  const data = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [
      {
        data: distribution,
        backgroundColor: [
          '#EF4444', // Red - 0-20
          '#F97316', // Orange - 21-40
          '#F59E0B', // Yellow - 41-60
          '#84CC16', // Green - 61-80
          '#10B981', // Teal - 81-100
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 0 // Disable initial animation
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
            const total = distribution.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `Leads: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Chrome Score Distribution</h3>
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
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {data.labels.map((label, index) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
                />
                <span className="text-sm text-gray-300">
                  {label} ({distribution[index]})
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LeadScoreDistribution; 