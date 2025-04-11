'use client';

import { Lead } from '@/types/lead';
import { Star, ExternalLink, User, ArrowUpRight, Building2, Briefcase, TrendingUp } from 'lucide-react';
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

  // Mobile card view for each lead
  const renderMobileCard = (lead: Lead) => (
    <div 
      key={lead.id}
      className="bg-gray-900/50 p-4 rounded-lg border border-gray-800/50 mb-3 hover:bg-gray-800/30 transition-colors cursor-pointer"
      onClick={() => handleLeadClick(lead.id)}
    >
      <div className="flex items-center mb-3">
        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-600/20 flex items-center justify-center mr-3">
          <User className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <div className="font-medium text-blue-400 flex items-center gap-1">
            {lead.name}
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-gray-400 text-xs mt-0.5">
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
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {lead.linkedinUrl ? (
          <a 
            href={lead.linkedinUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 text-xs flex items-center hover:underline hover:bg-blue-900/20 px-1.5 py-0.5 rounded-md transition-colors"
            onClick={(e) => e.stopPropagation()}
            aria-label={`View LinkedIn profile for ${lead.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
            </svg>
            <span>LinkedIn</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        ) : (
          lead.company && (
            <div className="flex items-center text-gray-500 text-xs bg-gray-800/50 px-1.5 py-0.5 rounded-md">
              <Building2 className="w-3 h-3 mr-1" />
              <span>{lead.company}</span>
            </div>
          )
        )}
        
        {lead.title && (
          <div className="text-gray-500 text-xs flex items-center bg-gray-800/50 px-1.5 py-0.5 rounded-md">
            <Briefcase className="w-3 h-3 mr-1" /> 
            <span>{lead.title}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800/50 p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Status</div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block
              ${lead.status === 'Converted' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : ''}
              ${lead.status === 'Qualified' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : ''}
              ${lead.status === 'New' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : ''}
              ${lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' : ''}
              ${lead.status === 'Lost' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : ''}
            `}
          >
            {lead.status}
          </span>
        </div>
        
        <div className="bg-gray-800/50 p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">
            {showChromeScore ? 'PROPS Score' : 'Lead Score'}
          </div>
          <div className="flex items-center">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium mr-2 ${getScoreColor(showChromeScore ? (lead.chromeScore || 0) : lead.score)}`}>
              {showChromeScore ? (lead.chromeScore || 0) : lead.score}
            </span>
            <div className="flex">{renderStars(showChromeScore ? (lead.chromeScore || 0) : lead.score)}</div>
          </div>
        </div>
        
        {showChromeScore && (
          <div className="bg-gray-800/50 p-2 rounded-md">
            <div className="text-xs text-gray-400 mb-1">Lead Score</div>
            <div className="flex items-center">
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium mr-2 ${getScoreColor(lead.score)}`}>
                {lead.score}
              </span>
              <div className="flex">{renderStars(lead.score)}</div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-800/50 p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Source</div>
          <div className="text-sm text-gray-300">{lead.source || 'Unknown'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Desktop view - table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-800/50 shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-6">Lead Information</th>
              {showChromeScore && <th className="py-3 px-6">PROPS Score</th>}
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
                            className="text-blue-400 text-xs flex items-center hover:underline hover:bg-blue-900/20 px-1.5 py-0.5 rounded-md transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`View LinkedIn profile for ${lead.name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                            </svg>
                            <span>LinkedIn</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          lead.company && (
                            <div className="flex items-center text-gray-500 text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              <span>{lead.company}</span>
                            </div>
                          )
                        )}
                        
                        {lead.title && (
                          <div className="text-gray-500 text-xs flex items-center">
                            <Briefcase className="w-3 h-3 mr-1" /> 
                            <span>{lead.title}</span>
                          </div>
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
      
      {/* Mobile view - cards */}
      <div className="md:hidden">
        {leads.map(renderMobileCard)}
        {leads.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-gray-900/50 rounded-lg border border-gray-800/50">
            No leads found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
} 