import React from 'react';

// Mock data for leads
const mockLeads = [
  {
    id: 1,
    name: 'Michael Wong',
    email: 'michael@bigcorp.com',
    score: 67,
    source: 'Referral',
    status: 'Converted',
    value: 25000,
  },
  {
    id: 2,
    name: 'Amanda Rodriguez',
    email: 'amanda@healthtech.io',
    score: 57,
    source: 'Website',
    status: 'Qualified',
    value: 18000,
  },
  {
    id: 3,
    name: 'John Smith',
    email: 'john@example.com',
    score: 48,
    source: 'LinkedIn',
    status: 'Qualified',
    value: 15000,
  },
  {
    id: 4,
    name: 'Sarah Miller',
    email: 'sarah@startupinc.io',
    score: 40,
    source: 'Conference',
    status: 'Qualified',
    value: 10000,
  },
  {
    id: 5,
    name: 'Lisa Garcia',
    email: 'lisa@fashionbrand.com',
    score: 38,
    source: 'Website',
    status: 'New',
    value: 6000,
  },
  {
    id: 6,
    name: 'Thomas Brown',
    email: 'thomas@eduplatform.edu',
    score: 35,
    source: 'Referral',
    status: 'Contacted',
    value: 7000,
  },
  {
    id: 7,
    name: 'Jessica Taylor',
    email: 'jessica@marketingpros.net',
    score: 21,
    source: 'Event',
    status: 'Disqualified',
    value: 4000,
  },
  {
    id: 8,
    name: 'Robert Chen',
    email: 'robert@techinnovators.com',
    score: 19,
    source: 'LinkedIn',
    status: 'New',
    value: 12000,
  },
];

interface HighValueLeadsTableProps {
  showAll?: boolean;
}

const HighValueLeadsTable = ({ showAll = false }: HighValueLeadsTableProps) => {
  const leads = showAll ? mockLeads : mockLeads.slice(0, 4);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Converted':
        return 'badge-green';
      case 'Qualified':
        return 'badge-green';
      case 'Contacted':
        return 'badge-blue';
      case 'New':
        return 'badge-blue';
      case 'Disqualified':
        return 'badge-red';
      default:
        return 'badge-yellow';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 81) return 'text-green-400';
    if (score >= 61) return 'text-green-500';
    if (score >= 41) return 'text-yellow-400';
    if (score >= 21) return 'text-orange-400';
    return 'text-red-400';
  };

  // Function to render score stars
  const renderScoreStars = (score: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < Math.ceil(score / 20)
            ? 'text-yellow-400'
            : 'text-gray-700'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  // Mobile card view for each lead
  const renderMobileCard = (lead: any) => (
    <div
      key={lead.id}
      className="mb-4 bg-gray-800/40 p-4 rounded-lg border border-gray-800"
    >
      <div className="mb-3">
        <div className="font-medium text-lg">{lead.name}</div>
        <div className="text-gray-400 text-xs">{lead.email}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">Score</div>
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs mr-2" 
              style={{
                backgroundColor: lead.score >= 61 
                  ? '#10B981' 
                  : lead.score >= 41 
                    ? '#F59E0B' 
                    : lead.score >= 21 
                      ? '#F97316' 
                      : '#EF4444'
              }}
            >
              {lead.score}
            </div>
            <div className="flex">{renderScoreStars(lead.score)}</div>
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-400 mb-1">Value</div>
          <div className="font-medium">${lead.value.toLocaleString()}</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-400 mb-1">Source</div>
          <div className="text-gray-300">{lead.source}</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-400 mb-1">Status</div>
          <span className={`${getStatusBadgeClass(lead.status)} px-2 py-1 rounded-full text-xs inline-block`}>
            {lead.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase">
            <tr className="border-b border-gray-800">
              <th scope="col" className="px-4 py-3">Lead</th>
              <th scope="col" className="px-4 py-3">Score</th>
              <th scope="col" className="px-4 py-3">Source</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Value</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr 
                key={lead.id}
                className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
              >
                <td className="px-4 py-4">
                  <div>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-gray-400 text-xs">{lead.email}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs" 
                      style={{
                        backgroundColor: lead.score >= 61 
                          ? '#10B981' 
                          : lead.score >= 41 
                            ? '#F59E0B' 
                            : lead.score >= 21 
                              ? '#F97316' 
                              : '#EF4444'
                      }}
                    >
                      {lead.score}
                    </div>
                    <div className="flex">{renderScoreStars(lead.score)}</div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-300">{lead.source}</td>
                <td className="px-4 py-4">
                  <span className={`${getStatusBadgeClass(lead.status)} px-2 py-1 rounded-full text-xs`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-4 font-medium">${lead.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden">
        {leads.map(renderMobileCard)}
      </div>
    </div>
  );
};

export default HighValueLeadsTable; 