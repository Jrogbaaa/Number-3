'use client';

import * as React from "react";
import { useState, useMemo } from "react";
import { ArrowUpDown, Users, Download, Filter, ChevronDown, Mail, Reply, Building2, Briefcase, Trophy, Target, Layers2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { EnhancedButton } from "./EnhancedButton";
import { GlassCard, GlassCardContent } from "./GlassCard";
import { ScoreDisplay } from "./ScoreDisplay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface Lead {
  id?: string;
  name?: string;
  email?: string;
  company?: string;
  title?: string;
  source?: string;
  status?: string;
  value?: number;
  created_at?: string;
  marketingScore?: number;
  budgetPotential?: number;
  budgetConfidence?: 'Low' | 'Medium' | 'High';
  businessOrientation?: 'B2B' | 'B2C' | 'Mixed' | 'Unknown';
  orientationConfidence?: 'Low' | 'Medium' | 'High';
  location?: string;
  timezone?: string;
  optimalOutreachTime?: string;
  phone?: string;
  linkedinUrl?: string;
  intentScore?: number;
  spendAuthorityScore?: number;
}

export interface EnhancedLeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  className?: string;
  onLeadClick?: (leadId: string) => void;
  onExport?: () => void;
}

const EnhancedLeadsTable: React.FC<EnhancedLeadsTableProps> = ({
  leads,
  loading = false,
  className,
  onLeadClick,
  onExport
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead | null; direction: 'ascending' | 'descending' }>({ 
    key: null, 
    direction: 'descending' 
  });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  // Calculate Best Overall score
  const calculateBestOverallScore = (lead: Lead): number => {
    const scores = [
      lead.marketingScore || 0,
      lead.intentScore || 0,
      lead.budgetPotential || 0,
      lead.spendAuthorityScore || 0
    ].filter(score => score > 0);
    
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  // Calculate engagement potential
  const calculateEngagementPotential = (lead: Lead): number => {
    let score = 50; // Base score
    
    if (lead.title?.toLowerCase().includes('marketing')) score += 15;
    if (lead.title?.toLowerCase().includes('director') || lead.title?.toLowerCase().includes('manager')) score += 10;
    if (lead.businessOrientation === 'B2B') score += 10;
    
    return Math.min(100, Math.max(0, score));
  };

  const processedLeads = useMemo(() => {
    let filteredLeads = leads.map(lead => ({
      ...lead,
      bestOverallScore: calculateBestOverallScore(lead),
      engagementPotential: calculateEngagementPotential(lead)
    }));

    // Search filtering
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredLeads = filteredLeads.filter(lead => 
        lead.name?.toLowerCase().includes(lowerSearchTerm) ||
        lead.email?.toLowerCase().includes(lowerSearchTerm) ||
        lead.company?.toLowerCase().includes(lowerSearchTerm) ||
        lead.title?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Status filtering
    if (statusFilter !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.status === statusFilter);
    }

    // Score filtering
    if (scoreFilter !== 'all') {
      const [min, max] = scoreFilter.split('-').map(Number);
      filteredLeads = filteredLeads.filter(lead => {
        const score = lead.bestOverallScore || 0;
        return score >= min && score <= max;
      });
    }

    // Sorting
    if (sortConfig.key) {
      filteredLeads.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;

        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }
        return sortConfig.direction === 'ascending' ? comparison : comparison * -1;
      });
    } else {
      // Default sort by best overall score
      filteredLeads.sort((a, b) => (b.bestOverallScore || 0) - (a.bestOverallScore || 0));
    }

    return filteredLeads;
  }, [leads, searchTerm, sortConfig, statusFilter, scoreFilter]);

  const handleSort = (key: keyof Lead) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleLeadClick = (leadId: string | undefined) => {
    if (leadId) {
      if (onLeadClick) {
        onLeadClick(leadId);
      } else {
        router.push(`/outreach/lead/${leadId}`);
      }
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'Converted': return 'success';
      case 'Qualified': return 'info';
      case 'New': return 'purple';
      case 'Contacted': return 'warning';
      case 'Lost': return 'destructive';
      default: return 'secondary';
    }
  };

  const statusTypes = ['all', 'New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
  const scoreRanges = ['all', '0-20', '21-40', '41-60', '61-80', '81-100'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Loading contacts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Enhanced Search and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-auto sm:flex-grow sm:max-w-md">
          <input 
            type="search"
            placeholder={`Search ${processedLeads.length} contacts...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 placeholder-gray-500 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
          />
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
        
        <div className="flex items-center gap-3">
          <EnhancedButton 
            variant="outline"
            size="sm"
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", filtersVisible && "rotate-180")} />
          </EnhancedButton>
          
          <EnhancedButton 
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={processedLeads.length === 0}
          >
            <Download className="w-4 h-4" />
            Export ({processedLeads.length})
          </EnhancedButton>
        </div>
      </div>
      
      {/* Enhanced Filter Panel */}
      {filtersVisible && (
        <GlassCard variant="subtle" className="p-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusTypes.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by score" />
              </SelectTrigger>
              <SelectContent>
                {scoreRanges.map(range => (
                  <SelectItem key={range} value={range}>
                    {range === 'all' ? 'All Scores' : `Score ${range}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GlassCard>
      )}

      {/* Enhanced Desktop Table */}
      <div className="hidden md:block">
        <GlassCard variant="default" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/30">
                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6 cursor-pointer hover:text-gray-300 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Contact
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      Best Overall
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      Intent
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Layers2 className="w-4 h-4 text-purple-400" />
                      Engagement
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-gray-300 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {processedLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-gray-800/20 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleLeadClick(lead.id)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <div className="font-medium text-white">{lead.name || 'N/A'}</div>
                        <div className="text-sm text-gray-400">{lead.email || 'No email'}</div>
                        {(lead.company || lead.title) && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            {lead.company && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {lead.company}
                              </span>
                            )}
                            {lead.title && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {lead.title}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <ScoreDisplay
                        score={lead.bestOverallScore}
                        label="Best Overall"
                        type="overall"
                        variant="compact"
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <ScoreDisplay
                        score={lead.intentScore || 0}
                        label="Intent Score"
                        type="intent"
                        variant="compact"
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <ScoreDisplay
                        score={lead.engagementPotential}
                        label="Engagement Potential"
                        type="engagement"
                        variant="compact"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getStatusBadgeVariant(lead.status)}>
                        {lead.status || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 justify-center">
                        <EnhancedButton
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle outreach
                          }}
                        >
                          <Mail className="w-3 h-3" />
                          <span className="hidden lg:inline">Outreach</span>
                        </EnhancedButton>
                        <EnhancedButton
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle follow-up
                          }}
                        >
                          <Reply className="w-3 h-3" />
                          <span className="hidden lg:inline">Follow-up</span>
                        </EnhancedButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Enhanced Mobile Cards */}
      <div className="md:hidden space-y-4">
        {processedLeads.map((lead) => (
          <GlassCard 
            key={lead.id} 
            variant="default" 
            className="cursor-pointer"
            onClick={() => handleLeadClick(lead.id)}
          >
            <GlassCardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{lead.name || 'N/A'}</h3>
                  <p className="text-sm text-gray-400">{lead.email || 'No email'}</p>
                  {(lead.company || lead.title) && (
                    <div className="text-xs text-gray-500 mt-1">
                      {lead.company && <span>{lead.company}</span>}
                      {lead.company && lead.title && <span> • </span>}
                      {lead.title && <span>{lead.title}</span>}
                    </div>
                  )}
                </div>
                <Badge variant={getStatusBadgeVariant(lead.status)}>
                  {lead.status || 'Unknown'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Best Overall</p>
                  <ScoreDisplay
                    score={lead.bestOverallScore}
                    label="Best Overall"
                    type="overall"
                    variant="compact"
                    showTooltip={false}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Intent Score</p>
                  <ScoreDisplay
                    score={lead.intentScore || 0}
                    label="Intent Score"
                    type="intent"
                    variant="compact"
                    showTooltip={false}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <EnhancedButton
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle outreach
                  }}
                >
                  <Mail className="w-3 h-3" />
                  Outreach
                </EnhancedButton>
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle follow-up
                  }}
                >
                  <Reply className="w-3 h-3" />
                  Follow-up
                </EnhancedButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Empty State */}
      {processedLeads.length === 0 && !loading && (
        <GlassCard variant="subtle" className="text-center py-12">
          <GlassCardContent>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {searchTerm || statusFilter !== 'all' || scoreFilter !== 'all' 
                  ? 'No matches found' 
                  : 'No contacts yet'}
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                {searchTerm || statusFilter !== 'all' || scoreFilter !== 'all' 
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.' 
                  : 'Upload your first CSV file to start analyzing and scoring your leads.'}
              </p>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
};

export { EnhancedLeadsTable };