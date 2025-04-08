'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const Dashboard = () => {
  const leads = [
    { name: 'Michael Wong', email: 'michael@bigcorp.com', score: 67, source: 'Referral', status: 'Converted', value: 25000 },
    { name: 'Amanda Rodriguez', email: 'amanda@healthtech.io', score: 57, source: 'Website', status: 'Qualified', value: 18000 },
    { name: 'John Smith', email: 'john@example.com', score: 48, source: 'LinkedIn', status: 'Qualified', value: 15000 },
    { name: 'Sarah Miller', email: 'sarah@startupinc.io', score: 40, source: 'Conference', status: 'Qualified', value: 10000 },
    { name: 'Lisa Garcia', email: 'lisa@fashionbrand.com', score: 38, source: 'Instagram', status: 'New', value: 6000 },
  ];

  const pieData = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [
      {
        data: [15, 30, 25, 20, 10],
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
        <span className="text-gray-400">10 leads analyzed</span>
      </div>

      <div className="grid grid-cols-2 gap-8">
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
              <div key={lead.email} className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                <div>
                  <p className="text-white font-medium">{lead.name}</p>
                  <p className="text-gray-400 text-sm">{lead.email}</p>
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