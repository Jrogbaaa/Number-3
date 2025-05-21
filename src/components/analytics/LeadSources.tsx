import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getLeads } from '@/lib/supabase';
import { Lead, LeadSource } from '@/types/lead';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function LeadSources() {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        backgroundColor: [
          '#8b5cf6', // violet
          '#3b82f6', // blue
          '#06b6d4', // cyan
          '#10b981', // emerald
          '#a3e635', // lime
          '#facc15', // yellow
        ],
        borderWidth: 0,
      },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSourceData = async () => {
      try {
        setLoading(true);
        const leads = await getLeads();
        
        if (leads.length === 0) {
          setLoading(false);
          return;
        }
        
        // Count leads by source
        const sourceCounts = leads.reduce((acc, lead) => {
          const source = lead.source;
          if (!acc[source]) {
            acc[source] = 0;
          }
          acc[source]++;
          return acc;
        }, {} as Record<LeadSource, number>);
        
        // Convert to arrays for chart
        const labels = Object.keys(sourceCounts);
        const data = Object.values(sourceCounts);
        
        setChartData({
          labels,
          datasets: [
            {
              data,
              backgroundColor: [
                '#8b5cf6', // violet
                '#3b82f6', // blue
                '#06b6d4', // cyan
                '#10b981', // emerald
                '#a3e635', // lime
                '#facc15', // yellow
              ],
              borderWidth: 0,
            },
          ],
        });
      } catch (error) {
        console.error('Error loading lead sources:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSourceData();
  }, []);

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#f3f4f6',
        padding: 10,
        displayColors: true,
        usePointStyle: true,
      },
    },
    cutout: '70%',
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-6">Lead Sources</h3>
      <div className="h-64 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse h-48 w-48 rounded-full bg-gray-700/30"></div>
          </div>
        ) : chartData.labels.length > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No lead source data available
          </div>
        )}
      </div>
    </div>
  );
} 