'use client';

import { Lead } from '@/types/lead';
import { Star, ExternalLink, User, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LeadsTableProps {
  leads: Lead[];
  showChromeScore?: boolean;
}

export default function LeadsTable({ leads, showChromeScore = false }: LeadsTableProps) {
  const router = useRouter();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border border-green-500/20';
    if (score >= 60) return 'bg-blue-500/20 text-blue-400 border border-blue-500/20';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20';
    if (score >= 20) return 'bg-orange-500/20 text-orange-400 border border-orange-500/20';
    return 'bg-red-500/20 text-red-400 border border-red-500/20';
  };

  const renderStars = (score: number) => {
    const stars = [];
    const filledStars = Math.round(score / 20);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}
        />
      );
    }
    
    return stars;
  };
  
  const handleLeadClick = (leadId: string) => {
    router.push(`/outreach/lead/${leadId}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800/50 shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-800/50">
          <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            <th className="py-3 px-6">Lead Information</th>
            {showChromeScore && <th className="py-3 px-6">Chrome Score</th>}
            <th className="py-3 px-6">Lead Score</th>
            <th className="py-3 px-6">Source</th>
            <th className="py-3 px-6">Status</th>
          </tr>
        </thead>
        <tbody className="bg-gray-900/50 divide-y divide-gray-800/50">
          {leads.map((lead) => (
            <tr 
              key={lead.id} 
              className="hover:bg-gray-800/30 transition-colors cursor-pointer group"
              onClick={() => handleLeadClick(lead.id)}
            >
              <td className="py-4 px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-600/20 flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-400 group-hover:text-blue-300 transition-colors flex items-center gap-1">
                      {lead.name}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="text-gray-400 text-xs mt-0.5 mb-1">
                      {!lead.email || lead.email.includes('placeholder') ? (
                        <span className="text-gray-500">No email available</span>
                      ) : (
                        <a 
                          href={`mailto:${lead.email}`}
                          className="hover:text-blue-400 hover:underline transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lead.email}
                        </a>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {lead.linkedinUrl ? (
                        <a 
                          href={lead.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 text-xs flex items-center hover:underline"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`View LinkedIn profile for ${lead.name}`}
                        >
                          <span>LinkedIn Profile</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-gray-500 text-xs">{lead.company || 'No company data'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              {showChromeScore && (
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getScoreColor(lead.chromeScore || 0)}`}>
                      {lead.chromeScore || 0}
                    </span>
                    <div className="flex">{renderStars(lead.chromeScore || 0)}</div>
                  </div>
                </td>
              )}
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getScoreColor(lead.score)}`}>
                    {lead.score}
                  </span>
                  <div className="flex">{renderStars(lead.score)}</div>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="text-sm text-gray-400">{lead.source || 'Unknown'}</div>
              </td>
              <td className="py-4 px-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium
                    ${lead.status === 'Converted' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : ''}
                    ${lead.status === 'Qualified' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : ''}
                    ${lead.status === 'New' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : ''}
                    ${lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' : ''}
                    ${lead.status === 'Lost' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : ''}
                  `}
                >
                  {lead.status}
                </span>
              </td>
            </tr>
          ))}
          {leads.length === 0 && (
            <tr>
              <td colSpan={showChromeScore ? 5 : 4} className="py-8 text-center text-gray-500">
                No leads found. Try adjusting your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 