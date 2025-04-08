import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { getLeads } from '@/lib/supabase';
import { Lead } from '@/types/lead';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function LeadTrends() {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'New Leads',
        data: [] as number[],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrendsData = async () => {
      try {
        setLoading(true);
        const leads = await getLeads();
        
        if (leads.length === 0) {
          setLoading(false);
          return;
        }
        
        // Group leads by day created
        const today = new Date();
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - (29 - i));
          return date;
        });
        
        // Format dates for comparison
        const formattedDates = last30Days.map(date => 
          date.toISOString().substring(0, 10)
        );
        
        // Count leads per day (assuming created_at exists in lead data)
        const leadsByDay = leads.reduce((acc, lead) => {
          // Check if created_at exists and convert to date string
          if (lead.created_at) {
            const date = new Date(lead.created_at).toISOString().substring(0, 10);
            if (!acc[date]) {
              acc[date] = 0;
            }
            acc[date]++;
          }
          return acc;
        }, {} as Record<string, number>);
        
        // Create data array aligned with the last 30 days
        const counts = formattedDates.map(date => leadsByDay[date] || 0);
        
        // Format labels to show as "MMM D" (e.g., "Jan 15")
        const labels = last30Days.map(date => 
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );
        
        setChartData({
          labels,
          datasets: [
            {
              label: 'New Leads',
              data: counts,
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error('Error loading lead trends:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTrendsData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#f3f4f6',
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          precision: 0,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Lead Trends</h3>
        <span className="text-xs text-gray-500">Last 30 days</span>
      </div>
      <div className="h-64 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-32 animate-pulse bg-gray-700/30 rounded"></div>
          </div>
        ) : chartData.datasets[0].data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No trend data available
          </div>
        )}
      </div>
    </div>
  );
} 