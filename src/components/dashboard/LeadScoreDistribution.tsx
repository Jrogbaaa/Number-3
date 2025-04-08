import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadScoreDistribution = () => {
  const data = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [
      {
        data: [2, 3, 2, 2, 1], // Example distribution of 10 leads
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
      },
    },
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Score Distribution</h3>
      <div className="h-64 flex items-center justify-center">
        <Pie data={data} options={options} />
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {data.labels.map((label, index) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
            />
            <span className="text-sm text-gray-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadScoreDistribution; 