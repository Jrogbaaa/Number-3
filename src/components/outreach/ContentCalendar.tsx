'use client';

import React, { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';
import { useRouter } from 'next/navigation';
import { useUserPreferences } from '@/providers/UserPreferencesProvider';
import { CalendarDays, Clock, TrendingUp, Info } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface CalendarSlot {
  id: string;
  day: string;
  lead: string;
  company: string;
  time: string;
  probability: number;
}

interface ContentCalendarProps {
  selectedDay?: string | null;
  onSelectLead?: (leadId: string) => void;
}

const ContentCalendar = ({ selectedDay = null, onSelectLead }: ContentCalendarProps) => {
  const [calendarData, setCalendarData] = useState<Record<string, CalendarSlot[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDayMobile, setActiveDayMobile] = useState<string | null>(null);
  const router = useRouter();
  const { preferences } = useUserPreferences();

  // Stable hash function for consistent scoring (same as LeadsTable)
  const getStableHashFromLead = (lead: Lead): number => {
    const idPart = lead.id || '';
    const namePart = (lead.name || '').toLowerCase();
    const emailPart = (lead.email || '').toLowerCase();
    const companyPart = (lead.company || '').toLowerCase();
    const titlePart = (lead.title || '').toLowerCase();
    
    // Create a string with fixed structure: id|name|email|company|title
    const str = `${idPart}|${namePart}|${emailPart}|${companyPart}|${titlePart}`;
    
    // Create a deterministic hash from the string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0; // Convert to 32bit integer with bitwise OR
    }
    
    return Math.abs(hash);
  };

  // Calculate intent score (same as LeadsTable)
  const calculateIntentScore = (lead: Lead): number => {
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

  // Calculate spend authority score (same as LeadsTable)
  const calculateSpendAuthority = (lead: Lead): number => {
    // Base score between 45-55
    let baseScore = 45 + getStableHashFromLead(lead) % 11;
    
    // Adjust based on title/role seniority
    if (lead.title) {
      const titleLower = lead.title.toLowerCase();
      
      // C-level and VP roles have highest spend authority
      if (titleLower.includes('ceo') || titleLower.includes('chief') || 
          titleLower.includes('founder') || titleLower.includes('president')) {
        baseScore += 25;
      } else if (titleLower.includes('vp') || titleLower.includes('vice president')) {
        baseScore += 20;
      } else if (titleLower.includes('director') || titleLower.includes('head')) {
        baseScore += 15;
      } else if (titleLower.includes('manager') || titleLower.includes('lead')) {
        baseScore += 10;
      }
    }
    
    // Adjust based on company size indicators
    if (lead.company) {
      const companyLower = lead.company.toLowerCase();
      
      // Large companies typically have higher budgets
      if (['enterprise', 'corporation', 'corp', 'inc', 'llc', 'ltd'].some(term => companyLower.includes(term))) {
        baseScore += 5;
      }
      
      // Well-known companies have established budgets
      if (['ticketmaster', 'sony', 'warner', 'disney', 'netflix', 'nike', 'adidas', 
           'amazon', 'microsoft', 'google', 'apple'].some(name => companyLower.includes(name))) {
        baseScore += 10;
      }
    }
    
    // Normalize the score to be between 25-85
    return Math.min(85, Math.max(25, baseScore));
  };

  // Calculate Best Overall score based on user preferences (same as LeadsTable)
  const calculateBestOverallScore = (lead: Lead) => {
    // First, ensure intent and spend authority scores are available
    if (lead.intentScore === undefined) {
      lead.intentScore = calculateIntentScore(lead);
    }
    
    if (lead.spendAuthorityScore === undefined) {
      lead.spendAuthorityScore = calculateSpendAuthority(lead);
    }
    
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
      
      return finalScore;
    }
    
    // Helper functions for fallback scores
    const calculateMarketingScoreFallback = (lead: Lead): number => {
      const str = `marketing_${lead.id || ''}${lead.name || ''}${lead.company || ''}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
      }
      return 45 + Math.abs(hash % 31); // 45-75 range
    };

    const calculateBudgetFallback = (lead: Lead): number => {
      const str = `budget_${lead.id || ''}${lead.company || ''}${lead.title || ''}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
      }
      return 40 + Math.abs(hash % 36); // 40-75 range
    };

    // Start with actual scores from the lead, using deterministic fallbacks
    const baseScores = {
      marketing: lead.marketingScore || calculateMarketingScoreFallback(lead),
      intent: lead.intentScore || calculateIntentScore(lead),
      budget: lead.budgetPotential || calculateBudgetFallback(lead),
      spendAuthority: lead.spendAuthorityScore || calculateSpendAuthority(lead)
    };
    
    // Base weights are fixed to create consistent results
    const weights = {
      marketing: 1.0,
      intent: 1.1,
      budget: 0.9,
      spendAuthority: 0.8
    };
    
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
      }
      
      // Extra points for seniority if it matters to the user
      const seniorityTerms = ['chief', 'ceo', 'cfo', 'cto', 'cmo', 'vp', 'vice president', 'director', 'head'];
      if (lead.title && seniorityTerms.some(term => lead.title?.toLowerCase().includes(term))) {
        weights.spendAuthority *= 1.3;
        baseScores.spendAuthority += 20;
      }
    }
    
    // INDUSTRY MATCHING - Adjust based on industry preferences
    if (preferences?.targetIndustries && preferences.targetIndustries.length > 0) {
      // If they care about specific industries, marketing fit is more important
      weights.marketing = 1.3;
      
      // Check if lead's company or industry field matches any target industry
      const leadCompany = lead.company?.toLowerCase() || '';
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
      }
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
    
    return finalScore;
  };
  
  useEffect(() => {
    async function loadLeadsForCalendar() {
      try {
        setLoading(true);
        
        // Use the same API endpoint as the dashboard to get consistently scored leads
        const response = await fetch('/api/fetch-leads');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load leads data');
        }
        
        const leads = data.leads || [];
        
        // Generate calendar data from real leads
        const generatedCalendarData = generateCalendarData(leads);
        setCalendarData(generatedCalendarData);
        
        // Set initial active day for mobile
        setActiveDayMobile(getCurrentDay());
      } catch (error) {
        console.error('Error loading leads for outreach calendar:', error);
        // Fallback to empty calendar data
        setCalendarData({});
      } finally {
        setLoading(false);
      }
    }
    
    loadLeadsForCalendar();
  }, []);
  
  // Transform leads into calendar slots using the same scoring logic as LeadsTable
  function generateCalendarData(leads: Lead[]): Record<string, CalendarSlot[]> {
    // Initialize empty calendar with each weekday
    const calendar: Record<string, CalendarSlot[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };
    
    // Process leads with the same scoring logic as LeadsTable
    const processedLeads = leads.map(lead => {
      // Calculate scores if not present
      const intentScore = lead.intentScore ?? calculateIntentScore(lead);
      const spendAuthorityScore = lead.spendAuthorityScore ?? calculateSpendAuthority(lead);
      
      // Create a lead with assigned scores for consistent Best Overall calculation
      const leadWithScores = {
        ...lead,
        intentScore,
        spendAuthorityScore
      };
      
      const calculatedOverallScore = calculateBestOverallScore(leadWithScores);
      
      return {
        ...lead,
        intentScore,
        spendAuthorityScore,
        calculatedOverallScore
      };
    });

    // Sort using the exact same logic as LeadsTable
    const sortedLeads = processedLeads.sort((a, b) => {
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

    // Only use top 15 leads for the weekly view (same as LeadsTable)
    const highValueLeads = sortedLeads.slice(0, 15);
    
    // Debug: Log the top leads being used in the calendar
    console.log('Outreach Calendar - Top leads by Best Overall score:', highValueLeads.slice(0, 5).map(lead => ({ 
      name: lead.name, 
      score: (lead as any).calculatedOverallScore 
    })));
    
    // Distribute leads across weekdays
    highValueLeads.forEach((lead, index) => {
      // Determine which day to place the lead (distribute evenly)
      const dayIndex = Math.min(Math.floor(index / 3), 4); // 0-4 for Monday-Friday
      const day = WEEKDAYS[dayIndex];
      
      // Generate a time slot based on lead score (use calculated overall score)
      const leadScore = (lead as any).calculatedOverallScore || 70;
      const scoreBasedHour = 9 + (Math.floor((100 - leadScore) / 25) * 2);
      const startHour = Math.min(Math.max(scoreBasedHour, 9), 15); // Keep between 9am and 3pm
      const startHourFormatted = startHour % 12 === 0 ? 12 : startHour % 12;
      const endHourFormatted = (startHour + 2) % 12 === 0 ? 12 : (startHour + 2) % 12;
      
      // Create the calendar slot
      const slot: CalendarSlot = {
        id: lead.id,
        day,
        lead: lead.name,
        company: lead.company,
        time: `${startHourFormatted}:00 ${startHour < 12 ? 'AM' : 'PM'} - ${endHourFormatted}:00 ${(startHour + 2) < 12 ? 'AM' : 'PM'}`,
        probability: leadScore,
      };
      
      // Add to the appropriate day
      calendar[day].push(slot);
    });
    
    return calendar;
  }

  const getCurrentDay = () => {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[today.getDay()];
    
    // If it's weekend, default to Monday
    if (currentDay === 'Saturday' || currentDay === 'Sunday') {
      return 'Monday';
    }
    
    return currentDay;
  };

  const getSlotsByDay = (day: string) => {
    return calendarData[day] || [];
  };

  const getMoreCount = (day: string) => {
    const count = (calendarData[day] || []).length - 3;
    return count > 0 ? count : 0;
  };

  const getProbabilityClasses = (probability: number): string => {
    if (probability >= 85) return 'text-green-400';
    if (probability >= 70) return 'text-emerald-400';
    if (probability >= 50) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const handleSlotClick = (slotId: string) => {
    if (onSelectLead) {
      onSelectLead(slotId);
    } else {
      // Navigate directly to lead detail page if no callback is provided
      router.push(`/outreach/lead/${slotId}`);
    }
  };

  const handleDayClick = (day: string) => {
    // Navigate to outreach page with the day as a query parameter
    router.push(`/outreach?day=${day}`);
  };

  if (loading) {
    return (
      <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-700/60">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {WEEKDAYS.map((day) => (
              <div key={day} className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-800 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-700/60">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-4">
          {WEEKDAYS.map((day) => (
            <div key={`desktop-${day}`} className="space-y-3 bg-gray-900/40 p-3 rounded-md border border-gray-700/60">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-200 text-sm">{day}</h3>
                <div className="text-xs text-gray-500">
                  {getSlotsByDay(day).length} contact{getSlotsByDay(day).length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-3 min-h-[100px]">
                {getSlotsByDay(day).slice(0, 3).map((slot) => (
                  <div 
                    key={`desktop-slot-${slot.id}`} 
                    className="group p-3 bg-gray-800 border border-gray-700 rounded-md hover:border-blue-600/70 hover:bg-gray-700/60 transition-all duration-150 ease-in-out cursor-pointer shadow-sm"
                    onClick={() => handleSlotClick(slot.id)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSlotClick(slot.id)}
                    aria-label={`View outreach details for ${slot.lead}`}
                  >
                    <div className="font-medium text-gray-100 group-hover:text-white text-sm truncate">{slot.lead}</div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{slot.company}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                       <Clock className="w-3 h-3 flex-shrink-0" /> 
                       <span>{slot.time}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium mt-2 ${getProbabilityClasses(slot.probability)}`}>
                       <TrendingUp className="w-3 h-3 flex-shrink-0" /> 
                       <span>{slot.probability}% relevance</span>
                    </div>
                  </div>
                ))}
                
                {getSlotsByDay(day).length === 0 && (
                  <div className="text-center text-sm text-gray-500 pt-6 pb-4">
                    No contacts scheduled.
                  </div>
                )}
                
                {getMoreCount(day) > 0 && (
                  <button 
                    onClick={() => handleDayClick(day)}
                    className="w-full text-center text-xs text-blue-400 hover:text-blue-300 py-2 border border-gray-700 rounded-md hover:border-blue-600/50 transition-colors"
                  >
                    +{getMoreCount(day)} more contact{getMoreCount(day) !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {/* Day selector */}
        <div className="flex overflow-x-auto gap-2 mb-4 pb-2">
          {WEEKDAYS.map((day) => (
            <button
              key={`mobile-${day}`}
              onClick={() => setActiveDayMobile(day)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeDayMobile === day
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {day}
              <span className="ml-1 text-xs opacity-75">
                ({getSlotsByDay(day).length})
              </span>
            </button>
          ))}
        </div>

        {/* Active day content */}
        {activeDayMobile && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-200 mb-3">{activeDayMobile}</h3>
            
            {getSlotsByDay(activeDayMobile).length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-8">
                No contacts scheduled for {activeDayMobile}.
              </div>
            ) : (
              <>
                {getSlotsByDay(activeDayMobile).map((slot) => (
                  <div 
                    key={`mobile-slot-${slot.id}`}
                    className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-600/70 transition-colors cursor-pointer"
                    onClick={() => handleSlotClick(slot.id)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSlotClick(slot.id)}
                    aria-label={`View outreach details for ${slot.lead}`}
                  >
                    <div className="font-medium text-gray-100 mb-1">{slot.lead}</div>
                    <div className="text-sm text-gray-400 mb-2">{slot.company}</div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{slot.time}</span>
                      </div>
                      <div className={`flex items-center gap-1 font-medium ${getProbabilityClasses(slot.probability)}`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>{slot.probability}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getMoreCount(activeDayMobile) > 0 && (
                  <button 
                    onClick={() => handleDayClick(activeDayMobile)}
                    className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-3 border border-gray-700 rounded-lg hover:border-blue-600/50 transition-colors"
                  >
                    View all {getSlotsByDay(activeDayMobile).length} contacts for {activeDayMobile}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCalendar; 