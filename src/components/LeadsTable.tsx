'use client';

import React, { useState, useMemo } from 'react';
import { Lead } from '@/types/lead';
import { Star, ExternalLink, User, ArrowUpRight, Building2, Briefcase, TrendingUp, ArrowUpDown, Users, Download, Filter, ChevronDown, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveAs } from 'file-saver';

interface LeadsTableProps {
  leads: Lead[];
  showChromeScore?: boolean;
}

// Helper function to generate CSV content
const generateCsvContent = (leads: Lead[]): string => {
  const headers = [
    'ID', 'Name', 'Email', 'Company', 'Title', 'Source', 'Status', 'Value', 'Created At', 
    'Marketing Score', 'Budget Potential', 'Budget Confidence', 'Business Orientation', 'Orientation Confidence',
    'Location', 'Timezone', 'Optimal Outreach Time', 'Phone', 'LinkedIn URL'
  ];
  const rows = leads.map(lead => [
    `"${lead.id}"`,
    `"${lead.name?.replace(/"/g, "'") || ''}"`,
    `"${lead.email?.replace(/"/g, "'") || ''}"`,
    `"${lead.company?.replace(/"/g, "'") || ''}"`,
    `"${lead.title?.replace(/"/g, "'") || ''}"`,
    `"${lead.source || ''}"`,
    `"${lead.status || ''}"`,
    lead.value || 0,
    `"${lead.created_at || ''}"`,
    lead.marketingScore || 0,
    lead.budgetPotential || 0,
    `"${lead.budgetConfidence || ''}"`,
    `"${lead.businessOrientation || ''}"`,
    `"${lead.orientationConfidence || ''}"`,
    `"${lead.location?.replace(/"/g, "'") || ''}"`,
    `"${lead.timezone?.replace(/"/g, "'") || ''}"`,
    `"${lead.optimalOutreachTime?.replace(/"/g, "'") || ''}"`,
    `"${lead.phone?.replace(/"/g, "'") || ''}"`,
    `"${lead.linkedinUrl?.replace(/"/g, "'") || ''}"`,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

// Helper function to trigger CSV download
const downloadCsv = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Define a proper type for the table row
interface TableRow {
  original: Lead;
}

export default function LeadsTable({ leads, showChromeScore = false }: LeadsTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead | null; direction: 'ascending' | 'descending' }>({ key: 'created_at', direction: 'descending' });
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // --- Filtering State --- 
  const [marketingScoreFilter, setMarketingScoreFilter] = useState<string>('all');
  const [budgetConfidenceFilter, setBudgetConfidenceFilter] = useState<string>('all');
  const [orientationFilter, setOrientationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const processedLeads = useMemo(() => {
    let filteredLeads = leads;

    // 1. Filtering by Search Term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredLeads = filteredLeads.filter(lead => 
        lead.name?.toLowerCase().includes(lowerSearchTerm) ||
        lead.email?.toLowerCase().includes(lowerSearchTerm) ||
        lead.company?.toLowerCase().includes(lowerSearchTerm) ||
        lead.title?.toLowerCase().includes(lowerSearchTerm) ||
        lead.source?.toLowerCase().includes(lowerSearchTerm) ||
        lead.status?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // 2. Filtering by Status
    if (statusFilter !== 'all') {
        filteredLeads = filteredLeads.filter(lead => lead.status === statusFilter);
    }

    // 3. Filtering by Marketing Score Range
    if (marketingScoreFilter !== 'all') {
      const [min, max] = marketingScoreFilter.split('-').map(Number);
      filteredLeads = filteredLeads.filter(lead => {
        const score = lead.marketingScore || 0;
        return score >= min && score <= max;
      });
    }

    // 4. Filtering by Budget Confidence
    if (budgetConfidenceFilter !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.budgetConfidence === budgetConfidenceFilter);
    }

    // 5. Filtering by Business Orientation (now Company Focus)
    if (orientationFilter !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.businessOrientation === orientationFilter);
    }

    // 6. Sorting
    const sortableLeads = [...filteredLeads]; // Create a mutable copy

    // Define custom sort order for orientation
    const orientationOrder: { [key: string]: number } = { 'B2B': 1, 'B2C': 2, 'Mixed': 3, 'Unknown': 4 };

    sortableLeads.sort((a, b) => {
      // If a specific column sort is requested (and not the default 'created_at')
      if (sortConfig.key && sortConfig.key !== 'created_at') {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Handle null/undefined consistently
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;

        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else {
          // Fallback for mixed types or other types
           comparison = String(aValue).localeCompare(String(bValue));
        }
        return sortConfig.direction === 'ascending' ? comparison : comparison * -1;
      } else {
        // Default Multi-Factor Sorting (Highest importance first)
        // 1. Intent Score (Descending) - New top priority
        const intentComparison = (b.intentScore ?? 0) - (a.intentScore ?? 0);
        if (intentComparison !== 0) return intentComparison;

        // 2. Spend Authority Score (Descending) - New second priority
        const spendAuthorityComparison = (b.spendAuthorityScore ?? 0) - (a.spendAuthorityScore ?? 0);
        if (spendAuthorityComparison !== 0) return spendAuthorityComparison;

        // 3. Marketing Score (Descending) - Now third priority
        const scoreComparison = (b.marketingScore ?? 0) - (a.marketingScore ?? 0);
        if (scoreComparison !== 0) return scoreComparison;

        // 4. Budget Potential (Descending) - Now fourth priority
        const budgetComparison = (b.budgetPotential ?? 0) - (a.budgetPotential ?? 0);
        if (budgetComparison !== 0) return budgetComparison;

        // 5. Company Focus (B2B first) - Now fifth priority
        const orientationA = orientationOrder[a.businessOrientation || 'Unknown'] ?? 5; // Assign higher number if undefined/null
        const orientationB = orientationOrder[b.businessOrientation || 'Unknown'] ?? 5; // Assign higher number if undefined/null
        const orientationComparison = orientationA - orientationB; // Ascending order based on defined numbers (1=B2B is best)
        if (orientationComparison !== 0) return orientationComparison;

        // 6. Tie-breaker: Created At (Descending - newest first)
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; 
      }
    });

    filteredLeads = sortableLeads;

    return filteredLeads;
  }, [leads, searchTerm, sortConfig, statusFilter, marketingScoreFilter, budgetConfidenceFilter, orientationFilter]);

  const requestSort = (key: keyof Lead) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const csvContent = generateCsvContent(processedLeads);
    downloadCsv(csvContent, `props_contacts_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getScoreColor = (score: number | undefined) => {
    const s = score || 0;
    if (s >= 80) return 'bg-blue-600/20 text-blue-400 border border-blue-700/30';
    if (s >= 60) return 'bg-green-600/20 text-green-400 border border-green-700/30';
    if (s >= 40) return 'bg-amber-600/20 text-amber-400 border border-amber-700/30';
    if (s >= 20) return 'bg-orange-600/20 text-orange-400 border border-orange-700/30';
    return 'bg-red-600/20 text-red-400 border border-red-700/30';
  };

  const getConfidenceBadgeClass = (confidence: 'Low' | 'Medium' | 'High' | undefined) => {
    switch (confidence) {
      case 'High': return 'bg-green-500/20 text-green-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Low': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-700/20 text-gray-400';
    }
  };

  const getOrientationBadgeClass = (orientation: 'B2B' | 'B2C' | 'Mixed' | 'Unknown' | undefined) => {
    switch (orientation) {
      case 'B2B': return 'bg-sky-500/20 text-sky-400';
      case 'B2C': return 'bg-purple-500/20 text-purple-400';
      case 'Mixed': return 'bg-teal-500/20 text-teal-400';
      default: return 'bg-gray-700/20 text-gray-400';
    }
  };

  const renderSortIcon = (columnKey: keyof Lead) => (
    <ArrowUpDown 
      className={`ml-2 h-3 w-3 transition-opacity ${
        sortConfig.key === columnKey ? 'opacity-100' : 'opacity-30 group-hover:opacity-70'
      }`}
    />
  );
  
  const handleLeadClick = (leadId: string | undefined) => {
    if(leadId) {
      router.push(`/outreach/lead/${leadId}`);
    }
  };

  // Mobile card view for each lead
  const renderMobileCard = (lead: Lead) => (
    <div 
      key={lead.id} 
      className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 mb-4 shadow-sm cursor-pointer hover:bg-gray-700/50 transition-colors duration-150"
      onClick={() => handleLeadClick(lead.id)}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => (e.key === 'Enter' || e.key === ' ') && handleLeadClick(lead.id)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${lead.name || 'lead'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 overflow-hidden mr-2">
          <div className="flex items-center text-base font-semibold text-white">
            <span className="truncate" title={lead.name || 'N/A'}>{lead.name || 'N/A'}</span>
          </div>
          <div className="text-gray-400 text-xs mt-0.5 truncate" title={lead.email || 'No email'}>{lead.email || 'No email'}</div>
          {(lead.company || lead.title) && (
            <div className="text-gray-500 text-xs mt-1 flex items-center flex-wrap gap-x-2">
              {lead.company && <span className="inline-flex items-center" title={lead.company}><Building2 className="w-3 h-3 mr-1 flex-shrink-0" />{lead.company}</span>}
              {lead.title && <span className="inline-flex items-center" title={lead.title}><Briefcase className="w-3 h-3 mr-1 flex-shrink-0" />{lead.title}</span>}
            </div>
          )}
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 whitespace-nowrap ${
            lead.status === 'Converted' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : ''
            }${lead.status === 'Qualified' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : ''
            }${lead.status === 'New' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : ''
            }${lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' : ''
            }${lead.status === 'Lost' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : ''}
          `}
          title={`Status: ${lead.status || 'Unknown'}`}
        >
          {lead.status || 'Unknown'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-1.5">
          <div className="text-xs text-gray-400 font-medium">Marketing Score</div>
          <div className="flex items-center">
            <span className={`px-2 py-0.5 rounded-md text-sm font-semibold ${getScoreColor(lead.marketingScore)}`} title={`Marketing Score: ${lead.marketingScore ?? '-'}`}>
              {lead.marketingScore !== undefined ? lead.marketingScore : '-'}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-xs text-gray-400 font-medium">Intent</div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-sm font-semibold ${getScoreColor(lead.intentScore)}`} title={`Intent Score: ${lead.intentScore ?? '-'}`}>
              {lead.intentScore !== undefined ? lead.intentScore : '-'}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-xs text-gray-400 font-medium">Budget Potential</div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-sm font-semibold ${getScoreColor(lead.budgetPotential)}`} title={`Budget Potential: ${lead.budgetPotential ?? '-'}`}>
              {lead.budgetPotential !== undefined ? lead.budgetPotential : '-'}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getConfidenceBadgeClass(lead.budgetConfidence)}`} title={`Budget Confidence: ${lead.budgetConfidence || 'N/A'}`}>
              {lead.budgetConfidence || 'N/A'}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-xs text-gray-400 font-medium">Spend Authority</div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-sm font-semibold ${getScoreColor(lead.spendAuthorityScore)}`} title={`Spend Authority: ${lead.spendAuthorityScore ?? '-'}`}>
              {lead.spendAuthorityScore !== undefined ? lead.spendAuthorityScore : '-'}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-xs text-gray-400 font-medium">Company Focus</div>
          <div className="flex items-center gap-1.5 flex-wrap">
             <span className={`text-sm px-2 py-0.5 rounded font-medium ${getOrientationBadgeClass(lead.businessOrientation)}`} title={`Company Focus: ${lead.businessOrientation || 'Unknown'}`}>
              {lead.businessOrientation || 'Unknown'}
            </span>
             <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getConfidenceBadgeClass(lead.orientationConfidence)}`} title={`Focus Confidence: ${lead.orientationConfidence || 'N/A'}`}>
              {lead.orientationConfidence || 'N/A'}
            </span>
          </div>
        </div>
        {/* REMOVED LOCATION/TIME FROM MOBILE VIEW START */}
        {/* {lead.location && (
          <div className="space-y-1.5">
            <div className="text-xs text-gray-400 font-medium">Location</div>
            <div className="text-sm text-gray-300 truncate" title={lead.location}>
              {lead.location}
              {lead.optimalOutreachTime && (
                <div className="text-gray-400 text-xs mt-1 truncate" title={`Best time: ${lead.optimalOutreachTime}`}>
                  <span className="inline-flex items-center">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                    {lead.optimalOutreachTime}
                  </span>
                </div>
              )}
            </div>
          </div>
        )} */}
        {/* REMOVED LOCATION/TIME FROM MOBILE VIEW END */}
      </div>
    </div>
  );

  // --- Constants for Filters ---
  const scoreRanges = ['all', '0-20', '21-40', '41-60', '61-80', '81-100'];
  const confidenceLevels = ['all', 'Low', 'Medium', 'High'];
  const focusTypes = ['all', 'B2B', 'B2C', 'Mixed', 'Unknown'];
  // Dynamically get unique statuses from the leads data
  const statusTypes = useMemo(() => [
      'all', 
      ...Array.from(new Set(leads.map(lead => lead.status).filter(Boolean)))
  ], [leads]);

  const columns = [
    {
      header: "Outreach Time",
      accessorKey: "optimalOutreachTime",
      cell: ({ row }: { row: TableRow }) => {
        const lead = row.original;
        
        if (lead.optimalOutreachTime) {
          return (
            <div className="flex items-center gap-1">
              <span className="text-sm">{lead.optimalOutreachTime}</span>
              <Link 
                href={`/lead-detail/${lead.id}`}
                className="ml-1 text-blue-500 hover:text-blue-600"
                title="View lead details and optimize outreach time"
              >
                <Clock className="h-4 w-4" />
              </Link>
            </div>
          );
        }
        
        return (
          <Link 
            href={`/lead-detail/${lead.id}`}
            className="flex items-center text-blue-500 hover:text-blue-600"
            title="Optimize outreach time"
          >
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs">Optimize</span>
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search, Filter Toggle, and Export Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <div className="relative w-full sm:w-auto sm:flex-grow sm:max-w-xs">
          <input 
            type="search"
            placeholder={`Search ${processedLeads.length} contacts...`} 
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-2 rounded-md bg-gray-800 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
          />
          <Users className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => setFiltersVisible(!filtersVisible)}
              variant="outline"
              className="w-auto bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white text-sm h-9 px-3"
              aria-expanded={filtersVisible}
              aria-controls="filter-panel"
            >
              <Filter className="mr-1.5 h-4 w-4" />
              Filters
              <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${filtersVisible ? 'rotate-180' : ''}`} />
            </Button>
            
            <Button 
              onClick={handleExport}
              variant="outline"
              className="w-auto bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white text-sm h-9 px-3"
              disabled={processedLeads.length === 0}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Export ({processedLeads.length})
            </Button>
        </div>
      </div>
      
      {filtersVisible && (
          <div id="filter-panel" className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 mb-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                   <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-xs h-9 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Status: All" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusTypes.map(status => (
                          <SelectItem key={status} value={status} className="text-xs">
                            {status === 'all' ? 'Status: All' : status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                   <Select value={marketingScoreFilter} onValueChange={setMarketingScoreFilter}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-xs h-9 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Mkt Score: All" />
                      </SelectTrigger>
                      <SelectContent>
                        {scoreRanges.map(range => (
                          <SelectItem key={range} value={range} className="text-xs">
                            {range === 'all' ? 'Mkt Score: All' : range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                     <Select value={budgetConfidenceFilter} onValueChange={setBudgetConfidenceFilter}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-xs h-9 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Budget Conf: All" />
                      </SelectTrigger>
                      <SelectContent>
                        {confidenceLevels.map(level => (
                          <SelectItem key={level} value={level} className="text-xs">
                            {level === 'all' ? 'Budget Conf: All' : level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={orientationFilter} onValueChange={setOrientationFilter}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-xs h-9 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Focus: All" />
                      </SelectTrigger>
                      <SelectContent>
                        {focusTypes.map(type => (
                          <SelectItem key={type} value={type} className="text-xs">
                            {type === 'all' ? 'Company Focus: All' : type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
              </div>
          </div>
      )}

      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-800/50 shadow-sm">
        <table className="w-full table-fixed">
          <thead className="bg-gray-800/50">
            <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-1/4 cursor-pointer group hover:bg-gray-700/50 transition-colors duration-150" onClick={() => requestSort('name')} onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => (e.key === 'Enter' || e.key === ' ') && requestSort('name')} tabIndex={0} aria-sort={sortConfig?.key === 'name' ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Contact Name">
                <div className="flex items-center">Contact {renderSortIcon('name')}</div>
              </th>
              <th className="py-3 px-4 w-[15%] cursor-pointer group hover:bg-gray-700/50 transition-colors duration-150" onClick={() => requestSort('marketingScore')} onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => (e.key === 'Enter' || e.key === ' ') && requestSort('marketingScore')} tabIndex={0} aria-sort={sortConfig?.key === 'marketingScore' ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Marketing Score">
                <div className="flex items-center">Marketing Score {renderSortIcon('marketingScore')}</div>
              </th>
              <th className="py-3 px-4 w-[15%] cursor-pointer group hover:bg-gray-700/50 transition-colors duration-150" onClick={() => requestSort('budgetPotential')} onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => (e.key === 'Enter' || e.key === ' ') && requestSort('budgetPotential')} tabIndex={0} aria-sort={sortConfig?.key === 'budgetPotential' ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Budget Potential">
                 <div className="flex items-center">Budget Potential {renderSortIcon('budgetPotential')}</div>
              </th>
              <th className="py-3 px-4 w-[15%] cursor-pointer group hover:bg-gray-700/50 transition-colors duration-150" onClick={() => requestSort('businessOrientation')} onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => (e.key === 'Enter' || e.key === ' ') && requestSort('businessOrientation')} tabIndex={0} aria-sort={sortConfig?.key === 'businessOrientation' ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Company Focus">
                <div className="flex items-center">Company Focus {renderSortIcon('businessOrientation')}</div>
              </th>
              <th className="py-3 px-4 w-[15%] cursor-pointer group hover:bg-gray-700/50 transition-colors duration-150" onClick={() => requestSort('intentScore')} onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => (e.key === 'Enter' || e.key === ' ') && requestSort('intentScore')} tabIndex={0} aria-sort={sortConfig?.key === 'intentScore' ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Intent Score">
                <div className="flex items-center">Intent {renderSortIcon('intentScore')}</div>
              </th>
              <th className="py-3 px-4 w-[15%] cursor-pointer group hover:bg-gray-700/50 transition-colors duration-150" onClick={() => requestSort('spendAuthorityScore')} onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => (e.key === 'Enter' || e.key === ' ') && requestSort('spendAuthorityScore')} tabIndex={0} aria-sort={sortConfig?.key === 'spendAuthorityScore' ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Spend Authority">
                <div className="flex items-center">Spend Auth. {renderSortIcon('spendAuthorityScore')}</div>
              </th>
              <th className="py-3 px-4 w-[10%] cursor-pointer group hover:bg-gray-700/50 transition-colors duration-150" onClick={() => requestSort('status')} onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => (e.key === 'Enter' || e.key === ' ') && requestSort('status')} tabIndex={0} aria-sort={sortConfig?.key === 'status' ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Status">
                 <div className="flex items-center">Status {renderSortIcon('status')}</div>
              </th>
               <th className="py-3 px-4 w-[10%] cursor-pointer group hover:bg-gray-700/50 transition-colors duration-150" onClick={() => requestSort('created_at')} onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => (e.key === 'Enter' || e.key === ' ') && requestSort('created_at')} tabIndex={0} aria-sort={sortConfig?.key === 'created_at' ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Date Added">
                 <div className="flex items-center">Added {renderSortIcon('created_at')}</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50 bg-gray-900/50">
            {processedLeads.length > 0 ? (
              processedLeads.map((lead, index) => (
                <tr 
                  key={lead.id} 
                  className="text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer odd:bg-gray-800/30"
                  onClick={() => handleLeadClick(lead.id)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => (e.key === 'Enter' || e.key === ' ') && handleLeadClick(lead.id)}
                  tabIndex={0}
                  role="link"
                  aria-label={`View details for ${lead.name || 'lead'}`}
                >
                  <td className="py-3 px-4 whitespace-nowrap truncate">
                    <div className="font-medium text-white truncate" title={lead.name || 'N/A'}>{lead.name || 'N/A'}</div>
                    <div className="text-gray-400 truncate" title={lead.email || 'No email'}>{lead.email || 'No email'}</div>
                     {(lead.company || lead.title) && (
                        <div className="text-gray-500 text-xs mt-1 flex items-center flex-wrap gap-x-2">
                          {lead.company && <span className="inline-flex items-center truncate" title={lead.company}><Building2 className="w-3 h-3 mr-1 flex-shrink-0" />{lead.company}</span>}
                          {lead.title && <span className="inline-flex items-center truncate" title={lead.title}><Briefcase className="w-3 h-3 mr-1 flex-shrink-0" />{lead.title}</span>}
                        </div>
                     )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getScoreColor(lead.marketingScore)}`} title={`Marketing Score: ${lead.marketingScore ?? '-'}`}>
                      {lead.marketingScore !== undefined ? lead.marketingScore : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getScoreColor(lead.budgetPotential)}`} title={`Budget Potential: ${lead.budgetPotential ?? '-'}`}>
                        {lead.budgetPotential !== undefined ? lead.budgetPotential : '-'}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getConfidenceBadgeClass(lead.budgetConfidence)}`} title={`Budget Confidence: ${lead.budgetConfidence || 'N/A'}`}>
                        {lead.budgetConfidence || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getOrientationBadgeClass(lead.businessOrientation)}`} title={`Company Focus: ${lead.businessOrientation || 'Unknown'}`}>
                        {lead.businessOrientation || 'Unknown'}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getConfidenceBadgeClass(lead.orientationConfidence)}`} title={`Focus Confidence: ${lead.orientationConfidence || 'N/A'}`}>
                        {lead.orientationConfidence || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getScoreColor(lead.intentScore)}`} title={`Intent Score: ${lead.intentScore ?? '-'}`}>
                      {lead.intentScore !== undefined ? lead.intentScore : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getScoreColor(lead.spendAuthorityScore)}`} title={`Spend Authority: ${lead.spendAuthorityScore ?? '-'}`}>
                      {lead.spendAuthorityScore !== undefined ? lead.spendAuthorityScore : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                     <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium inline-block ${ 
                            lead.status === 'Converted' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : '' 
                        }${ 
                            lead.status === 'Qualified' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : '' 
                        }${ 
                            lead.status === 'New' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : '' 
                        }${ 
                            lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' : '' 
                        }${ 
                            lead.status === 'Lost' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : '' 
                        }`}
                        title={`Status: ${lead.status || 'Unknown'}`}
                    >
                        {lead.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-gray-400">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  {searchTerm || statusFilter !== 'all' || marketingScoreFilter !== 'all' || budgetConfidenceFilter !== 'all' || orientationFilter !== 'all' 
                   ? 'No contacts match your search or filter criteria.' 
                   : 'No contacts found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        {processedLeads.length > 0 ? (
          processedLeads.map(renderMobileCard)
        ) : (
          <div className="text-center py-10 text-gray-500">
             {searchTerm || statusFilter !== 'all' || marketingScoreFilter !== 'all' || budgetConfidenceFilter !== 'all' || orientationFilter !== 'all' 
              ? 'No leads found matching your criteria.' 
              : 'No leads to display.'}
          </div>
        )}
      </div>
    </div>
  );
} 