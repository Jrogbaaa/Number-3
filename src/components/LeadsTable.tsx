'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Lead } from '@/types/lead';
import { Star, ExternalLink, User, ArrowUpRight, Building2, Briefcase, TrendingUp, ArrowUpDown, Users, Download, Filter, ChevronDown, Clock, HelpCircle, BarChart2, Trophy, Target, Layers, MessageSquare, Mail, Reply } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveAs } from 'file-saver';
import { useUserPreferences } from '@/providers/UserPreferencesProvider';

interface LeadsTableProps {
  leads: Lead[];
  showChromeScore?: boolean;
  loading?: boolean;
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

// Custom component for displaying a score with explanation tooltip
const ScoreCell = ({ score, label, explanation, icon, isBestOverall = false }: { 
  score?: number, 
  label: string, 
  explanation?: string, 
  icon?: React.ReactNode,
  isBestOverall?: boolean 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Default explanation if none provided
  const defaultExplanation = `This ${label} is calculated based on how well the lead matches your preferences.`;
  const tooltipText = explanation || defaultExplanation;
  
  const s = score || 0;
  let bgColorClass = '';
  let textColorClass = '';
  
  if (s >= 80) {
    bgColorClass = 'bg-blue-600/20';
    textColorClass = 'text-blue-400';
  } else if (s >= 60) {
    bgColorClass = 'bg-green-600/20';
    textColorClass = 'text-green-400';
  } else if (s >= 40) {
    bgColorClass = 'bg-amber-600/20';
    textColorClass = 'text-amber-400';
  } else if (s >= 20) {
    bgColorClass = 'bg-orange-600/20';
    textColorClass = 'text-orange-400';
  } else {
    bgColorClass = 'bg-red-600/20';
    textColorClass = 'text-red-400';
  }
  
  // Special styling for Best Overall score
  if (isBestOverall) {
    bgColorClass = s >= 60 ? 'bg-gradient-to-r from-amber-600/30 to-yellow-500/20' : 'bg-gradient-to-r from-gray-700/30 to-gray-600/20';
    textColorClass = s >= 60 ? 'text-yellow-300' : 'text-gray-400';
  }
  
  return (
    <div className="relative flex items-center">
      <span
        className={`px-2 py-0.5 rounded-md text-xs font-semibold ${bgColorClass} ${textColorClass} border border-${textColorClass.replace('text-', '')}/30 flex items-center gap-1 ${isBestOverall ? 'min-w-[48px] justify-center' : ''}`}
        title={`${label}: ${score ?? '-'}`}
      >
        {icon && <span className={`${isBestOverall ? 'text-yellow-400' : ''}`}>{icon}</span>}
        {score !== undefined ? score : '-'}
      </span>
      
      <button
        className="ml-1.5 text-gray-400 hover:text-gray-300 focus:outline-none"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        aria-label={`${label} score explanation`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-60 p-3 bg-gray-800 border border-gray-700 rounded-md shadow-lg text-xs text-gray-300 z-50">
          <div className="font-semibold text-white mb-2 flex items-center gap-1.5">
            {icon && <span className={`${isBestOverall ? 'text-yellow-400' : ''}`}>{icon}</span>}
            <span>How {label} is Calculated:</span>
          </div>
          <p>{tooltipText}</p>
          <div className="mt-2 pt-1.5 border-t border-gray-700 flex items-center gap-1.5">
            <BarChart2 className="w-3 h-3 text-blue-400" />
            <span className="text-blue-400">Based on your preferences</span>
          </div>
          <div className="absolute -bottom-2 left-4 w-4 h-4 transform rotate-45 bg-gray-800 border-r border-b border-gray-700"></div>
        </div>
      )}
    </div>
  );
};

// Add function to save lead order to localStorage
const LEADS_STORAGE_KEY = 'optileads_sorted_leads_ids';

const saveLeadOrderToLocalStorage = (leads: Lead[]) => {
  try {
    const leadIds = leads.map(lead => lead.id).filter(Boolean) as string[];
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leadIds));
    console.log('Lead order saved to localStorage');
  } catch (e) {
    console.error('Error saving lead order:', e);
  }
};

export default function LeadsTable({ leads, showChromeScore = false, loading = false }: LeadsTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'descending' });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { preferences } = useUserPreferences();
  const [columns, setColumns] = useState<Array<{id: string, name: string, key?: keyof Lead, show: boolean}>>([]);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  
  // Initialize columns based on user preferences
  useEffect(() => {
    if (!preferences) {
      // Fallback columns when no preferences are loaded
      setColumns([
        { id: 'contact', name: 'Contact', show: true },
        { id: 'bestOverall', name: 'Best Overall', show: true },
        { id: 'actions', name: 'Actions', show: true },
        { id: 'added', name: 'Added', key: 'created_at' as keyof Lead, show: true },
      ]);
      return;
    }
    
    // Default columns that are always shown (removed Status)
    const defaultColumns = [
      { id: 'contact', name: 'Contact', show: true },
      { id: 'bestOverall', name: 'Best Overall', show: true },
      { id: 'actions', name: 'Actions', show: true },
      { id: 'added', name: 'Added', key: 'created_at' as keyof Lead, show: true },
    ];
    
    // Additional columns based on user preferences
    const additionalColumns = [];
    
    // If user has specified target roles, show intent score
    if (preferences?.targetRoles && preferences.targetRoles.length > 0) {
      additionalColumns.push({ 
        id: 'intent', 
        name: 'Intent Score', 
        key: 'intentScore' as keyof Lead, 
        show: true 
      });
    }
    
    // If user mentioned budget or pricing during onboarding
    if (preferences?.companyProduct?.toLowerCase().includes('budget') || 
        preferences?.companyProduct?.toLowerCase().includes('pricing') ||
        preferences?.companyProduct?.toLowerCase().includes('cost')) {
      additionalColumns.push({ 
        id: 'budget', 
        name: 'Budget Potential', 
        key: 'budgetPotential' as keyof Lead, 
        show: true 
      });
    }
    
    // If user is in B2B sector or mentioned enterprise
    const isB2BFocused = preferences?.targetIndustries?.some(industry => 
      industry.toLowerCase().includes('technology') ||
      industry.toLowerCase().includes('consulting') ||
      industry.toLowerCase().includes('enterprise')
    );
    
    if (isB2BFocused) {
      additionalColumns.push({ 
        id: 'companyFocus', 
        name: 'Company Focus', 
        key: 'businessOrientation' as keyof Lead, 
        show: true 
      });
    }
    
    // If user has roles like sales director, VP, etc.
    const hasSeniorTargetRoles = preferences?.targetRoles?.some(role =>
      role.toLowerCase().includes('vp') ||
      role.toLowerCase().includes('director') ||
      role.toLowerCase().includes('chief') ||
      role.toLowerCase().includes('head') ||
      role.toLowerCase().includes('senior')
    );
    
    if (hasSeniorTargetRoles) {
      additionalColumns.push({ 
        id: 'spendAuth', 
        name: 'Spend Authority', 
        key: 'spendAuthorityScore' as keyof Lead, 
        show: true 
      });
    }
    
    // Always include engagement potential if we have enough data
    additionalColumns.push({ 
      id: 'engagement', 
      name: 'Engagement Potential', 
      show: true 
    });
    
    // Combine default and additional columns
    setColumns([...defaultColumns, ...additionalColumns]);
    console.log('Desktop columns configured:', [...defaultColumns, ...additionalColumns]);
  }, [preferences]);
  
  // --- Filtering State --- 
  const [marketingScoreFilter, setMarketingScoreFilter] = useState<string>('all');
  const [budgetConfidenceFilter, setBudgetConfidenceFilter] = useState<string>('all');
  const [orientationFilter, setOrientationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Global stable hash function to ensure consistency across all calls
  const getStableHashFromLead = (lead: Lead): number => {
    // Use a more deterministic approach to create the hash
    // Concatenate specific fields in a fixed order with fixed delimiters
    const idPart = lead.id || '';
    const namePart = (lead.name || '').toLowerCase();
    const emailPart = (lead.email || '').toLowerCase();
    const companyPart = (lead.company || '').toLowerCase();
    const titlePart = (lead.title || '').toLowerCase();
    
    // Create a string with fixed structure: id|name|email|company|title
    const str = `${idPart}|${namePart}|${emailPart}|${companyPart}|${titlePart}`;
    
    // Create a deterministic hash from the string
    // Using a simpler algorithm that's more consistent across browsers
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      // Use a fixed algorithm with modulo to ensure same results each time
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0; // Convert to 32bit integer with bitwise OR
    }
    
    // Convert to a positive number between 0-25 using absolute value and modulo
    const positiveHash = Math.abs(hash) % 26;
    
    // Log hash for debugging if needed
    if (showDebugInfo) {
      console.log(`Hash for ${lead.name}: ${positiveHash} (from string: ${str})`);
    }
    
    return positiveHash;
  };

  // Calculate Best Overall score based on user preferences
  const calculateBestOverallScore = (lead: Lead) => {
    // First, ensure intent and spend authority scores are available
    if (lead.intentScore === undefined) {
      lead.intentScore = calculateIntentScore(lead);
    }
    
    if (lead.spendAuthorityScore === undefined) {
      lead.spendAuthorityScore = calculateSpendAuthority(lead);
    }
    
    // Debug mode (triple-click on search bar to activate)
    const debugInfo = showDebugInfo ? {
      leadName: lead.name,
      baseScores: {} as Record<string, number>,
      weights: {} as Record<string, number>,
      finalScore: 0,
      matchFactors: [] as string[]
    } : null;
    
    // If no preferences, use completely deterministic scoring based on lead properties
    if (!preferences) {
      // Use our global hash function for completely consistent results
      const hash = getStableHashFromLead(lead);
      
      // Base score from hash (40-70 range)
      let baseScore = 40 + (hash % 31);
      
      // Deterministic adjustments based on lead properties
      if (lead.title) {
        const titleLower = lead.title.toLowerCase();
        
        // Senior roles get consistent boost
        if (titleLower.includes('ceo') || titleLower.includes('chief') || titleLower.includes('founder')) {
          baseScore += 20;
        } else if (titleLower.includes('vp') || titleLower.includes('vice president') || titleLower.includes('director')) {
          baseScore += 15;
        } else if (titleLower.includes('manager') || titleLower.includes('head')) {
          baseScore += 10;
        }
        
        // Marketing-related roles get boost
        if (titleLower.includes('marketing') || titleLower.includes('content') || titleLower.includes('brand')) {
          baseScore += 8;
        }
      }
      
      // Company-based adjustments
      if (lead.company) {
        const companyLower = lead.company.toLowerCase();
        
        // Well-known companies get boost
        const knownCompanies = ['ticketmaster', 'sony', 'warner', 'disney', 'netflix', 'nike', 'adidas', 'amazon', 'microsoft', 'google', 'apple'];
        if (knownCompanies.some(name => companyLower.includes(name))) {
          baseScore += 5;
        }
      }
      
      // Use existing scores if available, otherwise use calculated base
      const finalScore = Math.min(100, Math.max(20, lead.marketingScore || lead.intentScore || lead.spendAuthorityScore || baseScore));
      
      if (debugInfo) {
        console.log(`Best Overall Score for ${lead.name}: ${finalScore} (no preferences available, hash: ${hash})`);
      }
      
      return finalScore;
    }
    
    // Start with actual scores from the lead, using deterministic fallbacks
    const baseScores = {
      marketing: lead.marketingScore || calculateMarketingScoreFallback(lead),
      intent: lead.intentScore || calculateIntentScore(lead),
      budget: lead.budgetPotential || calculateBudgetFallback(lead),
      spendAuthority: lead.spendAuthorityScore || calculateSpendAuthority(lead)
    };
    
    if (debugInfo) {
      debugInfo.baseScores = {...baseScores};
    }
    
    // Base weights are fixed to create consistent results
    const weights = {
      marketing: 1.0,
      intent: 1.1,
      budget: 0.9,
      spendAuthority: 0.8
    };
    
    // Track significant match factors for debugging
    const matchFactors: string[] = [];
    
    // ROLE MATCHING - Adjust weights based on target roles
    if (preferences?.targetRoles && preferences.targetRoles.length > 0) {
      // If they care about specific roles, intent becomes more important
      weights.intent = 1.5;
      weights.spendAuthority = 1.2;
      
      // Check if lead's title matches any target role
      const leadTitle = lead.title?.toLowerCase() || '';
      const roleMatches = preferences.targetRoles.filter(
        role => leadTitle.includes(role.toLowerCase())
      );
      
      if (roleMatches.length > 0) {
        // This is a high-value match - boost scores proportionally to match count
        const matchBoost = Math.min(1.5, 1 + (roleMatches.length * 0.2));
        weights.intent *= matchBoost;
        weights.marketing *= 1.2;
        
        // Also boost the base scores for a better match (with fixed values)
        baseScores.intent += 15;
        baseScores.marketing += 10;
        
        matchFactors.push(`Role match: ${roleMatches.join(', ')}`);
      }
      
      // Extra points for seniority if it matters to the user
      const seniorityTerms = ['chief', 'ceo', 'cfo', 'cto', 'cmo', 'vp', 'vice president', 'director', 'head'];
      if (lead.title && seniorityTerms.some(term => lead.title?.toLowerCase().includes(term))) {
        weights.spendAuthority *= 1.3;
        baseScores.spendAuthority += 20;
        matchFactors.push('Senior role detected');
      }
    }
    
    // INDUSTRY MATCHING - Adjust based on industry preferences
    if (preferences?.targetIndustries && preferences.targetIndustries.length > 0) {
      // If they care about specific industries, marketing fit is more important
      weights.marketing = 1.3;
      
      // Check if lead's company or industry field matches any target industry
      const leadCompany = lead.company?.toLowerCase() || '';
      // Safely access industry field which might not be in the Lead type
      const leadIndustry = (lead as any).industry?.toLowerCase() || '';
      
      const industryMatches = preferences.targetIndustries.filter(
        industry => leadCompany.includes(industry.toLowerCase()) || 
                   leadIndustry.includes(industry.toLowerCase())
      );
      
      if (industryMatches.length > 0) {
        // This is a high-value match - boost marketing and budget scores
        const matchBoost = Math.min(1.6, 1 + (industryMatches.length * 0.2));
        weights.marketing *= matchBoost;
        weights.budget *= 1.2;
        
        // Also boost the base scores for a better match
        baseScores.marketing += 15;
        baseScores.budget += 10;
        
        matchFactors.push(`Industry match: ${industryMatches.join(', ')}`);
      }
    }
    
    // BUDGET SENSITIVITY - Adjust if user mentioned budget concerns
    if (preferences?.companyProduct?.toLowerCase().includes('budget') || 
        preferences?.companyProduct?.toLowerCase().includes('pricing') ||
        preferences?.companyProduct?.toLowerCase().includes('cost')) {
      weights.budget = 1.4;
      weights.spendAuthority = 1.3;
      matchFactors.push('Budget sensitivity detected in preferences');
    }
    
    // B2B ALIGNMENT - Adjust if both user and lead are B2B focused
    const isB2BFocused = preferences?.targetIndustries?.some(industry => 
      industry.toLowerCase().includes('technology') ||
      industry.toLowerCase().includes('consulting') ||
      industry.toLowerCase().includes('enterprise') ||
      industry.toLowerCase().includes('b2b')
    );
    
    if (isB2BFocused && lead.businessOrientation === 'B2B') {
      weights.budget *= 1.25;
      weights.spendAuthority *= 1.2;
      
      // Boost base scores for B2B alignment
      baseScores.budget += 12;
      baseScores.spendAuthority += 15;
      
      matchFactors.push('B2B alignment');
    }
    
    // COMPANY SIZE MATCHING - Adjust if company size preference matches
    if (preferences?.targetCompanySizes && preferences.targetCompanySizes.length > 0) {
      // Safely access company_size which might not be in the Lead type
      const leadCompanySize = (lead as any).company_size;
      
      if (leadCompanySize && preferences.targetCompanySizes.includes(leadCompanySize)) {
        weights.budget *= 1.15;
        baseScores.budget += 10;
        matchFactors.push(`Company size match: ${leadCompanySize}`);
      }
    }
    
    if (debugInfo) {
      debugInfo.weights = {...weights};
    }
    
    // Calculate weighted scores
    const scores = {
      marketing: baseScores.marketing * weights.marketing,
      intent: baseScores.intent * weights.intent,
      budget: baseScores.budget * weights.budget,
      spendAuthority: baseScores.spendAuthority * weights.spendAuthority
    };
    
    // Sum of all weighted scores
    const weightedSum = scores.marketing + scores.intent + scores.budget + scores.spendAuthority;
    
    // Sum of all weights
    const weightSum = weights.marketing + weights.intent + weights.budget + weights.spendAuthority;
    
    // Calculate weighted average, no variation, and round to nearest integer
    const weightedAverage = Math.round(weightedSum / weightSum);
    
    // Ensure the score is between 0 and 100 and return a value of at least 20
    const finalScore = Math.min(100, Math.max(20, weightedAverage));
    
    if (showDebugInfo && debugInfo) {
      debugInfo.finalScore = finalScore;
      console.log('Best Overall Score for', lead.name, ':', finalScore);
      console.log('- Base Scores:', baseScores);
      console.log('- Weights:', weights);
      console.log('- Match Factors:', matchFactors.length ? matchFactors.join(', ') : 'None');
    }
    
    return finalScore;
  };

  // Calculate marketing score fallback when not explicitly provided
  const calculateMarketingScoreFallback = (lead: Lead): number => {
    // Use our global hash function for consistency
    const str = `marketing_${lead.id || ''}${lead.name || ''}${lead.company || ''}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return 45 + Math.abs(hash % 31); // 45-75 range
  };

  // Calculate budget fallback when not explicitly provided
  const calculateBudgetFallback = (lead: Lead): number => {
    // Use our global hash function for consistency
    const str = `budget_${lead.id || ''}${lead.company || ''}${lead.title || ''}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return 40 + Math.abs(hash % 36); // 40-75 range
  };

  // Calculate intent score based on lead attributes when not explicitly provided
  const calculateIntentScore = (lead: Lead): number => {
    // Use our global hash function instead of a local one
    // Base score between 55-65
    let baseScore = 55 + getStableHashFromLead(lead) % 11;
    
    // Adjust based on title/role relevance
    if (lead.title) {
      const titleLower = lead.title.toLowerCase();
      
      // Marketing roles generally have higher intent for marketing tools
      if (titleLower.includes('marketing') || titleLower.includes('content') || titleLower.includes('brand')) {
        baseScore += 10;
      }
      
      // Director+ roles have decision-making authority
      if (titleLower.includes('director') || titleLower.includes('chief') || 
          titleLower.includes('vp') || titleLower.includes('head')) {
        baseScore += 8;
      }
    }
    
    // Adjust based on company
    if (lead.company) {
      const companyLower = lead.company.toLowerCase();
      
      // Well-known companies might have more complex needs
      if (['ticketmaster', 'sony', 'warner', 'disney', 'netflix', 'nike', 'adidas', 
           'amazon', 'microsoft', 'google', 'apple'].some(name => companyLower.includes(name))) {
        baseScore += 7;
      }
      
      // B2B companies often need content marketing solutions
      if (lead.businessOrientation === 'B2B') {
        baseScore += 5;
      }
    }
    
    // Normalize the score to be between 40-80
    return Math.min(80, Math.max(40, baseScore));
  };
  
  // Calculate spend authority when not explicitly provided
  const calculateSpendAuthority = (lead: Lead): number => {
    // Use our global hash function instead of a local one
    // Base score between 50-60
    let baseScore = 50 + getStableHashFromLead(lead) % 11;
    
    // Adjust based on seniority
    if (lead.title) {
      const titleLower = lead.title.toLowerCase();
      
      // C-level has highest authority
      if (titleLower.includes('ceo') || titleLower.includes('cfo') || 
          titleLower.includes('cto') || titleLower.includes('cmo') || 
          titleLower.includes('chief')) {
        baseScore += 25;
      }
      // VP level has high authority
      else if (titleLower.includes('vp') || titleLower.includes('vice president')) {
        baseScore += 20;
      }
      // Director level has good authority
      else if (titleLower.includes('director') || titleLower.includes('head of')) {
        baseScore += 15;
      }
      // Manager level has some authority
      else if (titleLower.includes('manager') || titleLower.includes('lead')) {
        baseScore += 8;
      }
    }
    
    // Adjust based on company size/prestige
    if (lead.company) {
      const companyLower = lead.company.toLowerCase();
      
      // Enterprise companies have larger budgets
      if (['ticketmaster', 'sony', 'warner', 'disney', 'netflix', 'nike', 'adidas', 
           'amazon', 'microsoft', 'google', 'apple'].some(name => companyLower.includes(name))) {
        baseScore += 10;
      }
    }
    
    // Normalize the score
    return Math.min(85, Math.max(35, baseScore));
  };

  const processedLeads = useMemo(() => {
    // Create a stable cache key that includes preferences state to ensure consistency
    const preferencesKey = preferences ? JSON.stringify({
      targetRoles: preferences.targetRoles || [],
      targetIndustries: preferences.targetIndustries || [],
      companyProduct: preferences.companyProduct || '',
      targetCompanySizes: preferences.targetCompanySizes || []
    }) : 'no-preferences';
    
    const leadDataKey = leads.map(lead => `${lead.id}_${lead.name}_${lead.email}_${lead.company}_${lead.title}`).join('|');
    const fullCacheKey = `${leadDataKey}_${preferencesKey}`;
    
    // Create a cache to store calculated scores, keyed by lead ID + preferences
    const scoreCache = new Map<string, {
      intentScore: number,
      spendAuthorityScore: number,
      calculatedOverallScore: number
    }>();
    
    // Pre-calculate all scores for all leads first to ensure consistency
    const scoredLeads = leads.map(lead => {
      // Create a unique cache key for this lead + preferences combination
      const leadCacheKey = `${lead.id}_${preferencesKey}`;
      
      // If we have a lead ID and it's in the cache, use the cached scores
      if (lead.id && scoreCache.has(leadCacheKey)) {
        const cachedScores = scoreCache.get(leadCacheKey)!;
        return {
          ...lead,
          intentScore: lead.intentScore ?? cachedScores.intentScore,
          spendAuthorityScore: lead.spendAuthorityScore ?? cachedScores.spendAuthorityScore,
          calculatedOverallScore: cachedScores.calculatedOverallScore
        };
      }
      
      // Otherwise calculate and cache the scores
      const intentScore = lead.intentScore ?? calculateIntentScore(lead);
      const spendAuthorityScore = lead.spendAuthorityScore ?? calculateSpendAuthority(lead);
      
      // Create a lead with assigned scores for consistent Best Overall calculation
      const leadWithScores = {
        ...lead,
        intentScore,
        spendAuthorityScore
      };
      
      const calculatedOverallScore = calculateBestOverallScore(leadWithScores);
      
      // Cache the scores if we have an ID
      if (lead.id) {
        scoreCache.set(leadCacheKey, {
          intentScore,
          spendAuthorityScore,
          calculatedOverallScore
        });
      }
      
      return {
        ...lead,
        intentScore,
        spendAuthorityScore,
        calculatedOverallScore
      };
    });
    
    let filteredLeads = scoredLeads;

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
    let sortedLeads;
    
    // If a specific column sorting is requested
    if (sortConfig.key) {
      sortedLeads = [...filteredLeads].sort((a, b) => {
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
           comparison = String(aValue).localeCompare(String(bValue));
        }
        return sortConfig.direction === 'ascending' ? comparison : comparison * -1;
      });
      } else {
      // Default sorting by Best Overall score (highest to lowest)
      sortedLeads = [...filteredLeads].sort((a, b) => {
        // Primary sort: Best Overall score (descending)
        const scoreA = a.calculatedOverallScore;
        const scoreB = b.calculatedOverallScore;
        const scoreDiff = scoreB - scoreA;
        if (scoreDiff !== 0) return scoreDiff;

        // Secondary sort: Created date (newest first)
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        const dateDiff = dateB - dateA;
        if (dateDiff !== 0) return dateDiff;
        
        // Final tie-breaker: sort by email or name for consistent ordering
        const aIdentifier = a.email || a.name || a.id || '';
        const bIdentifier = b.email || b.name || b.id || '';
        return aIdentifier.localeCompare(bIdentifier);
      });
    }
    
    console.log('Leads sorted by Best Overall score:', sortedLeads.slice(0, 5).map(lead => ({ 
      name: lead.name, 
      score: lead.calculatedOverallScore 
    })));
    
    // Save the final sorted leads order to localStorage for persistence
    // Use requestAnimationFrame to avoid blocking the main thread
    requestAnimationFrame(() => {
      saveLeadOrderToLocalStorage(sortedLeads);
    });

    return sortedLeads;
  }, [leads, searchTerm, sortConfig, statusFilter, marketingScoreFilter, budgetConfidenceFilter, orientationFilter, preferences]);

  // Debug logging for desktop table rendering
  console.log('Desktop table rendering - Columns:', columns.length, 'Visible columns:', columns.filter(col => col.show).length, 'Leads:', processedLeads.length);

  const requestSort = (key: keyof Lead) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    
    // On next render, processedLeads will be updated and the order saved to localStorage
  };

  const handleExport = () => {
    const csvContent = generateCsvContent(processedLeads);
    downloadCsv(csvContent, `optileads_contacts_${new Date().toISOString().split('T')[0]}.csv`);
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

  const getScoreExplanation = (lead: Lead, scoreType: string): string => {
    if (!preferences) return '';
    
    let explanation = '';
    
    switch (scoreType) {
      case 'marketing':
        if (preferences.targetRoles && lead.title) {
          const matchesRole = preferences.targetRoles.some(
            (role: string) => lead.title?.toLowerCase().includes(role.toLowerCase())
          );
          if (matchesRole) {
            explanation += 'Role matches your target roles. ';
          }
        }
        
        if (preferences.targetIndustries && lead.company) {
          const matchesIndustry = preferences.targetIndustries.some(
            (industry: string) => lead.company?.toLowerCase().includes(industry.toLowerCase())
          );
          if (matchesIndustry) {
            explanation += 'Company matches your target industries. ';
          }
        }
        
        if (!explanation) {
          explanation = 'Based on overall marketing fit with your preferences.';
        }
        break;
        
      case 'intent':
        explanation = 'Based on relevance of lead\'s role and how likely they are to engage with your offering.';
        break;
        
      case 'budget':
        if (lead.title) {
          const titleLower = lead.title.toLowerCase();
          const seniorityTerms = ['ceo', 'cto', 'cfo', 'cmo', 'chief', 'vp', 'vice president', 'director', 'head of'];
          
          if (seniorityTerms.some(term => titleLower.includes(term))) {
            explanation += 'Senior role indicates higher budget authority. ';
          }
        }
        
        if (lead.businessOrientation === 'B2B' && preferences.targetIndustries?.includes('Technology')) {
          explanation += 'B2B tech companies typically have higher budgets. ';
        }
        
        if (!explanation) {
          explanation = 'Based on company signals and role seniority.';
        }
        break;
        
      case 'spend':
        explanation = 'Based on lead\'s title seniority and decision-making authority in their organization.';
        break;
        
      default:
        explanation = 'Score calculated based on alignment with your business preferences.';
    }
    
    return explanation;
  };

  // Calculate engagement potential based on lead attributes
  const calculateEngagementPotential = (lead: Lead) => {
    // Use our global hash function instead of a local one
    // Base factors for engagement (42-57 range)
    let baseScore = 42 + getStableHashFromLead(lead);
    
    // Role-based adjustments
    if (lead.title) {
      const titleLower = lead.title.toLowerCase();
      
      // Marketing roles more likely to engage with marketing tools
      if (titleLower.includes('marketing')) {
        baseScore += 12;
      }
      
      // Content-focused roles have high engagement likelihood
      if (titleLower.includes('content') || titleLower.includes('communication')) {
        baseScore += 10;
      }
      
      // Decision makers are more selective but valuable when they engage
      if (titleLower.includes('director') || titleLower.includes('chief') || 
          titleLower.includes('vp') || titleLower.includes('head')) {
        baseScore += 8;
      }
    }
    
    // Company-based adjustments
    if (lead.company) {
      const companyLower = lead.company.toLowerCase();
      
      // Companies in entertainment/media industry often need content help
      if (['entertainment', 'media', 'film', 'music', 'games', 'gaming', 'creative'].some(
          term => companyLower.includes(term))) {
        baseScore += 7;
      }
      
      // Known brands may be harder to engage but worth pursuing
      if (['ticketmaster', 'sony', 'warner', 'disney', 'netflix', 'nike'].some(
          name => companyLower.includes(name))) {
        baseScore += 5;
      }
    }
    
    // Use actual scores when available for more precision
    const marketingFactor = lead.marketingScore ? lead.marketingScore * 0.6 : baseScore * 0.6;
    const intentFactor = lead.intentScore ? lead.intentScore * 0.4 : (baseScore + 5) * 0.4;
    
    // Weighted calculation with stable deterministic adjustment
    const finalScore = Math.round(marketingFactor + intentFactor);
    
    // Ensure the score is within range
    return Math.min(85, Math.max(30, finalScore));
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
          <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            Best Overall
          </div>
          <div className="flex items-center">
            <ScoreCell 
              score={(lead as any).calculatedOverallScore || calculateBestOverallScore(lead)}
              label="Best Overall"
              explanation="Weighted score based on your business priorities from onboarding. This indicates the lead's overall quality for your specific business needs."
              icon={<Trophy className="w-4 h-4" />}
              isBestOverall={true}
            />
          </div>
        </div>
        
        {columns.find(col => col.id === 'intent' && col.show) && (
        <div className="space-y-1.5">
            <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-blue-500" />
              Intent
            </div>
          <div className="flex items-center gap-1.5">
              <ScoreCell 
                score={lead.intentScore || calculateIntentScore(lead)} 
                label="Intent Score"
                explanation={getScoreExplanation(lead, 'intent')}
                icon={<Target className="w-3.5 h-3.5 text-blue-500" />}
              />
          </div>
        </div>
        )}
        
        {columns.find(col => col.id === 'budget' && col.show) && (
        <div className="space-y-1.5">
          <div className="text-xs text-gray-400 font-medium">Budget Potential</div>
          <div className="flex items-center gap-1.5">
              <ScoreCell 
                score={lead.budgetPotential} 
                label="Budget Potential"
                explanation={getScoreExplanation(lead, 'budget')}
              />
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getConfidenceBadgeClass(lead.budgetConfidence)}`} title={`Budget Confidence: ${lead.budgetConfidence || 'N/A'}`}>
              {lead.budgetConfidence || 'N/A'}
            </span>
          </div>
        </div>
        )}
        
        {columns.find(col => col.id === 'spendAuth' && col.show) && (
        <div className="space-y-1.5">
          <div className="text-xs text-gray-400 font-medium">Spend Authority</div>
          <div className="flex items-center gap-1.5">
              <ScoreCell 
                score={lead.spendAuthorityScore || calculateSpendAuthority(lead)} 
                label="Spend Authority"
                explanation={getScoreExplanation(lead, 'spend')}
              />
          </div>
        </div>
        )}
        
        {columns.find(col => col.id === 'engagement' && col.show) && (
          <div className="space-y-1.5">
            <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              Engagement
            </div>
            <div className="flex items-center gap-1.5">
              <ScoreCell 
                score={calculateEngagementPotential(lead)} 
                label="Engagement Potential"
                explanation="Likelihood that this contact will respond to your outreach based on role and company fit."
                icon={<Layers className="w-3.5 h-3.5 text-purple-500" />}
              />
            </div>
          </div>
        )}
        
        {columns.find(col => col.id === 'companyFocus' && col.show) && (
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
              )}
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
            onClick={(e) => {
              if (e.detail === 3) { // Triple click
                setShowDebugInfo(prev => !prev);
                console.log('Debug mode:', !showDebugInfo);
              }
            }}
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

      {/* Debug Panel - Only shown when debug mode is active */}
      {showDebugInfo && (
        <div className="p-3 bg-gray-800/50 border border-amber-600/30 rounded-md mb-4 text-xs text-amber-300 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Scoring Debug Mode</h3>
            <button
              onClick={() => setShowDebugInfo(false)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div>
            <p>User Preferences: {preferences ? 'Loaded' : 'Not Loaded'}</p>
            {preferences && (
              <div className="mt-1 overflow-x-auto">
                <p>Target Roles: {preferences.targetRoles?.join(', ') || 'None'}</p>
                <p>Target Industries: {preferences.targetIndustries?.join(', ') || 'None'}</p>
                <p>Company Product: {preferences.companyProduct || 'Not specified'}</p>
              </div>
            )}
          </div>
          <div className="pt-2 border-t border-gray-700/50 text-gray-300">
            <p>Lead scores are now being logged to the console</p>
              </div>
          </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-800/50 shadow-sm">
        <table className="w-full table-fixed">
          <thead className="bg-gray-800/50">
            <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              {columns.filter(col => col.show).map((column) => {
                // Define specific widths for each column to prevent overlapping
                let widthClass = '';
                switch (column.id) {
                  case 'contact':
                    widthClass = 'w-1/4';
                    break;
                  case 'bestOverall':
                    widthClass = 'w-24';
                    break;
                  case 'actions':
                    widthClass = 'w-40';
                    break;
                  case 'added':
                    widthClass = 'w-20'; // Made smaller to prevent overlap with action buttons
                    break;
                  case 'intent':
                  case 'budget':
                  case 'spendAuth':
                  case 'engagement':
                    widthClass = 'w-28';
                    break;
                  case 'companyFocus':
                    widthClass = 'w-32';
                    break;
                  default:
                    widthClass = 'w-24';
                }
                
                return (
                <th 
                  key={column.id} 
                    className={`py-3 px-4 ${widthClass} cursor-pointer group hover:bg-gray-700/50 transition-colors duration-150`}
                  onClick={() => column.key && requestSort(column.key)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => column.key && (e.key === 'Enter' || e.key === ' ') && requestSort(column.key)}
                  tabIndex={0}
                  aria-sort={column.key && sortConfig?.key === column.key ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'}
                  aria-label={`Sort by ${column.name}`}
                >
                  <div className="flex items-center">
                    {column.name} {column.key && renderSortIcon(column.key)}
                  </div>
              </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50 bg-gray-900/50">
            {processedLeads.length > 0 ? (
              processedLeads.map((lead, index) => {
                // Calculate dynamic scores
                const bestOverallScore = calculateBestOverallScore(lead);
                const engagementPotential = calculateEngagementPotential(lead);
                
                return (
                <tr 
                  key={lead.id} 
                  className="text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer odd:bg-gray-800/30"
                  onClick={() => handleLeadClick(lead.id)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => (e.key === 'Enter' || e.key === ' ') && handleLeadClick(lead.id)}
                  tabIndex={0}
                  role="link"
                  aria-label={`View details for ${lead.name || 'lead'}`}
                >
                    {columns.filter(col => col.show).map((column) => {
                      // Define consistent width classes for table cells
                      let widthClass = '';
                      switch (column.id) {
                        case 'contact':
                          widthClass = 'w-1/4';
                          break;
                        case 'bestOverall':
                          widthClass = 'w-24';
                          break;
                        case 'actions':
                          widthClass = 'w-40';
                          break;
                        case 'added':
                          widthClass = 'w-20'; // Made smaller to prevent overlap with action buttons
                          break;
                        case 'intent':
                        case 'budget':
                        case 'spendAuth':
                        case 'engagement':
                          widthClass = 'w-28';
                          break;
                        case 'companyFocus':
                          widthClass = 'w-32';
                          break;
                        default:
                          widthClass = 'w-24';
                      }
                      
                      // Render appropriate cell based on column id
                      switch (column.id) {
                        case 'contact':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap truncate ${widthClass}`}>
                    <div className="font-medium text-white truncate" title={lead.name || 'N/A'}>{lead.name || 'N/A'}</div>
                    <div className="text-gray-400 truncate" title={lead.email || 'No email'}>{lead.email || 'No email'}</div>
                     {(lead.company || lead.title) && (
                        <div className="text-gray-500 text-xs mt-1 flex items-center flex-wrap gap-x-2">
                          {lead.company && <span className="inline-flex items-center truncate" title={lead.company}><Building2 className="w-3 h-3 mr-1 flex-shrink-0" />{lead.company}</span>}
                          {lead.title && <span className="inline-flex items-center truncate" title={lead.title}><Briefcase className="w-3 h-3 mr-1 flex-shrink-0" />{lead.title}</span>}
                        </div>
                     )}
                  </td>
                          );
                        case 'bestOverall':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap ${widthClass}`}>
                              <ScoreCell 
                                score={(lead as any).calculatedOverallScore}
                                label="Best Overall"
                                explanation="Weighted score based on your business priorities from onboarding. This indicates the lead's overall quality for your specific business needs."
                                icon={<Trophy className="w-4 h-4" />}
                                isBestOverall={true}
                              />
                  </td>
                          );
                        case 'marketing':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap ${widthClass}`}>
                              <ScoreCell 
                                score={lead.marketingScore} 
                                label="Marketing Score"
                                explanation={getScoreExplanation(lead, 'marketing')}
                              />
                            </td>
                          );
                        case 'budget':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap ${widthClass}`}>
                    <div className="flex items-center gap-1.5">
                                <ScoreCell 
                                  score={lead.budgetPotential} 
                                  label="Budget Potential"
                                  explanation={getScoreExplanation(lead, 'budget')}
                                />
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getConfidenceBadgeClass(lead.budgetConfidence)}`} title={`Budget Confidence: ${lead.budgetConfidence || 'N/A'}`}>
                        {lead.budgetConfidence || 'N/A'}
                      </span>
                    </div>
                  </td>
                          );
                        case 'companyFocus':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap ${widthClass}`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getOrientationBadgeClass(lead.businessOrientation)}`} title={`Company Focus: ${lead.businessOrientation || 'Unknown'}`}>
                        {lead.businessOrientation || 'Unknown'}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getConfidenceBadgeClass(lead.orientationConfidence)}`} title={`Focus Confidence: ${lead.orientationConfidence || 'N/A'}`}>
                        {lead.orientationConfidence || 'N/A'}
                      </span>
                    </div>
                  </td>
                          );
                        case 'intent':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap ${widthClass}`}>
                              <ScoreCell 
                                score={lead.intentScore || calculateIntentScore(lead)} 
                                label="Intent Score"
                                explanation={getScoreExplanation(lead, 'intent')}
                                icon={<Target className="w-3.5 h-3.5 text-blue-500" />}
                              />
                  </td>
                          );
                        case 'spendAuth':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap ${widthClass}`}>
                              <ScoreCell 
                                score={lead.spendAuthorityScore || calculateSpendAuthority(lead)} 
                                label="Spend Authority"
                                explanation={getScoreExplanation(lead, 'spend')}
                              />
                  </td>
                          );
                        case 'engagement':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap ${widthClass}`}>
                              <ScoreCell 
                                score={engagementPotential}
                                label="Engagement Potential"
                                explanation="Likelihood that this contact will respond to your outreach based on role and company fit."
                                icon={<Layers className="w-3.5 h-3.5 text-purple-500" />}
                              />
                            </td>
                          );
                        case 'status':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap ${widthClass}`}>
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
                          );
                        case 'actions':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap ${widthClass}`}>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/outreach/lead/${lead.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                  title="Create outreach message"
                                >
                                  <Mail className="w-3 h-3" />
                                  Outreach
                                </Link>
                                <Link
                                  href={`/outreach/lead/${lead.id}?tab=follow-up`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
                                  title="Create follow-up message"
                                >
                                  <Reply className="w-3 h-3" />
                                  Follow-up
                                </Link>
                              </div>
                            </td>
                          );
                        case 'added':
                          return (
                            <td key={column.id} className={`py-3 px-4 whitespace-nowrap text-gray-400 ${widthClass}`}>
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', { 
                      month: 'numeric', 
                      day: 'numeric', 
                      year: '2-digit' 
                    }) : 'N/A'}
                  </td>
                          );
                        default:
                          return <td key={column.id} className={`py-3 px-4 ${widthClass}`}></td>;
                      }
                    })}
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.filter(col => col.show).length} className="py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-gradient-to-br from-gray-800/40 to-gray-700/20 rounded-xl mb-4">
                      {loading ? (
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Users className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-400 mb-2">
                      {loading 
                       ? 'Loading your leads...'
                       : searchTerm || statusFilter !== 'all' || marketingScoreFilter !== 'all' || budgetConfidenceFilter !== 'all' || orientationFilter !== 'all' 
                       ? 'No matches found' 
                       : 'No leads yet'}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-md">
                      {loading 
                       ? 'Please wait while we fetch your lead data.'
                       : searchTerm || statusFilter !== 'all' || marketingScoreFilter !== 'all' || budgetConfidenceFilter !== 'all' || orientationFilter !== 'all' 
                       ? 'Try adjusting your search terms or filters to find what you\'re looking for.' 
                       : 'Upload your first CSV file to start analyzing and scoring your leads.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        {processedLeads.length > 0 ? (
          processedLeads.map(lead => {
            // Calculate dynamic scores for mobile view
            const bestOverallScore = calculateBestOverallScore(lead);
            const engagementPotential = calculateEngagementPotential(lead);
            
            return (
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
                    <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                      Best Overall
                    </div>
                    <div className="flex items-center">
                      <ScoreCell 
                        score={(lead as any).calculatedOverallScore}
                        label="Best Overall"
                        explanation="Weighted score based on your business priorities from onboarding. This indicates the lead's overall quality for your specific business needs."
                        icon={<Trophy className="w-4 h-4" />}
                        isBestOverall={true}
                      />
                    </div>
                  </div>
                  
                  {columns.find(col => col.id === 'intent' && col.show) && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-blue-500" />
                        Intent
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ScoreCell 
                          score={lead.intentScore || calculateIntentScore(lead)} 
                          label="Intent Score"
                          explanation={getScoreExplanation(lead, 'intent')}
                          icon={<Target className="w-3.5 h-3.5 text-blue-500" />}
                        />
                      </div>
                    </div>
                  )}
                  
                  {columns.find(col => col.id === 'budget' && col.show) && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-gray-400 font-medium">Budget Potential</div>
                      <div className="flex items-center gap-1.5">
                        <ScoreCell 
                          score={lead.budgetPotential} 
                          label="Budget Potential"
                          explanation={getScoreExplanation(lead, 'budget')}
                        />
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getConfidenceBadgeClass(lead.budgetConfidence)}`} title={`Budget Confidence: ${lead.budgetConfidence || 'N/A'}`}>
                          {lead.budgetConfidence || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {columns.find(col => col.id === 'spendAuth' && col.show) && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-gray-400 font-medium">Spend Authority</div>
                      <div className="flex items-center gap-1.5">
                        <ScoreCell 
                          score={lead.spendAuthorityScore || calculateSpendAuthority(lead)} 
                          label="Spend Authority"
                          explanation={getScoreExplanation(lead, 'spend')}
                        />
                      </div>
                    </div>
                  )}
                  
                  {columns.find(col => col.id === 'engagement' && col.show) && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-purple-500" />
                        Engagement
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ScoreCell 
                          score={engagementPotential} 
                          label="Engagement Potential"
                          explanation="Likelihood that this contact will respond to your outreach based on role and company fit."
                          icon={<Layers className="w-3.5 h-3.5 text-purple-500" />}
                        />
                      </div>
                    </div>
                  )}
                  
                  {columns.find(col => col.id === 'companyFocus' && col.show) && (
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
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-gradient-to-br from-gray-800/40 to-gray-700/20 rounded-xl mb-4">
                {loading ? (
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Users className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {loading 
                 ? 'Loading your leads...'
                 : searchTerm || statusFilter !== 'all' || marketingScoreFilter !== 'all' || budgetConfidenceFilter !== 'all' || orientationFilter !== 'all' 
                 ? 'No matches found' 
                 : 'No leads yet'}
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                {loading 
                 ? 'Please wait while we fetch your lead data.'
                 : searchTerm || statusFilter !== 'all' || marketingScoreFilter !== 'all' || budgetConfidenceFilter !== 'all' || orientationFilter !== 'all' 
                 ? 'Try adjusting your search terms or filters to find what you\'re looking for.' 
                 : 'Upload your first CSV file to start analyzing and scoring your leads.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 