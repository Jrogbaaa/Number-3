'use client';

import { Lead } from '@/types/lead';
import { Star } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  showChromeScore?: boolean;
}

export default function LeadsTable({ leads, showChromeScore = false }: LeadsTableProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400';
    if (score >= 60) return 'bg-blue-500/20 text-blue-400';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-400';
    if (score >= 20) return 'bg-orange-500/20 text-orange-400';
    return 'bg-red-500/20 text-red-400';
  };

  const renderStars = (score: number) => {
    const stars = [];
    const filledStars = Math.round(score / 20);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    
    return stars;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-4 px-6">LEAD</th>
            {showChromeScore && <th className="py-4 px-6">CHROME SCORE</th>}
            <th className="py-4 px-6">SCORE</th>
            <th className="py-4 px-6">SOURCE</th>
            <th className="py-4 px-6">STATUS</th>
            <th className="py-4 px-6 text-right">VALUE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-800/50">
              <td className="py-4 px-6">
                <div>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-gray-500 text-sm">{lead.email}</div>
                  <div className="text-gray-500 text-xs">{lead.company}</div>
                </div>
              </td>
              {showChromeScore && (
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${getScoreColor(lead.chromeScore || 0)}`}>
                      {lead.chromeScore || 0}
                    </span>
                    <div className="flex">{renderStars((lead.chromeScore || 0))}</div>
                  </div>
                </td>
              )}
              <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${getScoreColor(lead.score)}`}>
                    {lead.score}
                  </span>
                  <div className="flex">{renderStars(lead.score)}</div>
                </div>
              </td>
              <td className="py-4 px-6">{lead.source}</td>
              <td className="py-4 px-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm
                    ${lead.status === 'Converted' ? 'bg-green-500/20 text-green-400' : ''}
                    ${lead.status === 'Qualified' ? 'bg-blue-500/20 text-blue-400' : ''}
                    ${lead.status === 'New' ? 'bg-purple-500/20 text-purple-400' : ''}
                    ${lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${lead.status === 'Lost' ? 'bg-red-500/20 text-red-400' : ''}
                  `}
                >
                  {lead.status}
                </span>
              </td>
              <td className="py-4 px-6 text-right">${lead.value.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 