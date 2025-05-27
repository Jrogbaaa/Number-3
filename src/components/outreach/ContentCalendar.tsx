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

  // Stable hash function for consistent scoring
  const getStableHashFromLead = (lead: Lead): number => {
    const str = `${lead.id || ''}${lead.name || ''}${lead.email || ''}${lead.company || ''}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  };

  // Calculate intent score
  const calculateIntentScore = (lead: Lead): number => {
    const hash = getStableHashFromLead(lead);
    let baseScore = 50 + (hash % 31); // 50-80 range
    
    if (lead.title) {
      const titleLower = lead.title.toLowerCase();
      if (titleLower.includes('marketing') || titleLower.includes('content') || titleLower.includes('brand')) {
        baseScore += 15;
      }
      if (titleLower.includes('ceo') || titleLower.includes('founder') || titleLower.includes('chief')) {
        baseScore += 10;
      }
    }
    
    return Math.min(95, Math.max(30, baseScore));
  };

  // Calculate spend authority score
  const calculateSpendAuthority = (lead: Lead): number => {
    const hash = getStableHashFromLead(lead);
    let baseScore = 45 + (hash % 26); // 45-70 range
    
    if (lead.title) {
      const titleLower = lead.title.toLowerCase();
      if (titleLower.includes('ceo') || titleLower.includes('chief') || titleLower.includes('founder')) {
        baseScore += 25;
      } else if (titleLower.includes('vp') || titleLower.includes('vice president') || titleLower.includes('director')) {
        baseScore += 20;
      } else if (titleLower.includes('manager') || titleLower.includes('head')) {
        baseScore += 15;
      }
    }
    
    return Math.min(95, Math.max(25, baseScore));
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
  
  // Transform leads into calendar slots
  function generateCalendarData(leads: Lead[]): Record<string, CalendarSlot[]> {
    // Initialize empty calendar with each weekday
    const calendar: Record<string, CalendarSlot[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };
    
    // Only use high-value leads (sorted by Best Overall score - same as dashboard)
    const highValueLeads = [...leads]
      .map(lead => ({
        ...lead,
        calculatedOverallScore: calculateBestOverallScore(lead)
      }))
      .sort((a, b) => {
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
      })
      .slice(0, 15);
    
    // Debug: Log the top leads being used in the calendar
    console.log('Calendar - Top leads by Best Overall score:', highValueLeads.slice(0, 5).map(lead => ({ 
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

  const handleViewAll = (day: string) => {
    // Navigate to outreach page with the day as a query parameter
    router.push(`/outreach?day=${day}`);
  };

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return WEEKDAYS.includes(today) ? today : WEEKDAYS[0];
  };

  const handleDaySelect = (day: string) => {
    setActiveDayMobile(day);
  };

  const currentDay = getCurrentDay();

  // Mobile tab selection component
  const MobileDayTabs = () => (
    <div className="flex overflow-x-auto pb-3 md:hidden space-x-2 no-scrollbar touch-auto mb-4">
      {WEEKDAYS.map((day) => (
        <button
          key={`mobile-tab-${day}`}
          className={`px-4 py-2 whitespace-nowrap rounded-md text-sm font-medium min-w-[95px] border transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${activeDayMobile === day 
              ? 'bg-gray-700 text-white border-gray-600 shadow-sm'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700/80 hover:text-gray-200'
          }`}
          onClick={() => handleDaySelect(day)}
          aria-label={`View ${day} schedule${day === currentDay ? ' (Today)' : ''}`}
          aria-selected={activeDayMobile === day}
          role="tab"
        >
          {day} {day === currentDay && '•'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-800/50 border border-gray-700/80 rounded-lg p-4 md:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <CalendarDays className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-100">Outreach Calendar</h2>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
           <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
          Loading schedule...
        </div>
      ) : (
        <>
          <MobileDayTabs />

          <div className="hidden md:grid md:grid-cols-5 gap-5">
            {WEEKDAYS.map((day) => (
              <div key={`desktop-${day}`} className="space-y-3 bg-gray-900/40 p-3 rounded-md border border-gray-700/60">
                <h3 
                  className={`text-center font-semibold text-sm py-2 border-b border-gray-700 mb-3 ${day === currentDay ? 'text-blue-400' : 'text-gray-300'}
                    hover:bg-gray-800/50 rounded-t-md transition-colors cursor-pointer`}
                  onClick={() => handleViewAll(day)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleViewAll(day)}
                  aria-label={`View all leads for ${day}`}
                >
                  {day} {day === currentDay && '(Today)'}
                </h3>
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
                      className="w-full text-center text-xs text-blue-400 hover:text-blue-300 hover:underline pt-2 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                      onClick={() => handleViewAll(day)}
                      aria-label={`View all ${getMoreCount(day)} more leads for ${day}`}
                    >
                      +{getMoreCount(day)} more
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="md:hidden space-y-3">
            {activeDayMobile && getSlotsByDay(activeDayMobile).length > 0 && (
                getSlotsByDay(activeDayMobile).map((slot) => (
                  <div 
                    key={`mobile-slot-${slot.id}`} 
                    className="group p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-600/70 hover:bg-gray-700/60 transition-all duration-150 ease-in-out cursor-pointer active:bg-gray-700 shadow-sm"
                    onClick={() => handleSlotClick(slot.id)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSlotClick(slot.id)}
                    aria-label={`View outreach details for ${slot.lead}`}
                    role="button"
                  >
                    <div className="font-medium text-gray-100 group-hover:text-white text-base truncate">{slot.lead}</div>
                    <div className="text-sm text-gray-400 truncate mt-0.5">{slot.company}</div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1.5">
                       <Clock className="w-3.5 h-3.5 flex-shrink-0" /> 
                       <span>{slot.time}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium mt-2 ${getProbabilityClasses(slot.probability)}`}>
                       <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" /> 
                       <span>{slot.probability}% relevance</span>
                    </div>
                  </div>
                ))
            )}
            {activeDayMobile && getSlotsByDay(activeDayMobile).length === 0 && (
                 <div className="text-center text-sm text-gray-500 py-10">
                   No contacts scheduled for {activeDayMobile}.
                 </div>
            )}
          </div>

          <div className="mt-6 text-center md:text-left">
             <p className="text-xs text-gray-500 flex items-center justify-center md:justify-start gap-1.5">
               <Info className="w-3 h-3 flex-shrink-0" /> 
               Contacts are prioritized based on OptiLeads.ai relevance score.
             </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentCalendar; 