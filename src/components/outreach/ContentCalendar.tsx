'use client';

import React, { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';
import { getLeads } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
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
  
  useEffect(() => {
    async function loadLeadsForCalendar() {
      try {
        setLoading(true);
        const leads = await getLeads();
        
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
    
    // Only use high-value leads (sorted by Chrome score)
    const highValueLeads = [...leads]
      .sort((a, b) => (b.chromeScore || 0) - (a.chromeScore || 0))
      .slice(0, 15);
    
    // Distribute leads across weekdays
    highValueLeads.forEach((lead, index) => {
      // Determine which day to place the lead (distribute evenly)
      const dayIndex = Math.min(Math.floor(index / 3), 4); // 0-4 for Monday-Friday
      const day = WEEKDAYS[dayIndex];
      
      // Generate a time slot based on lead score
      const scoreBasedHour = 9 + (Math.floor((100 - (lead.chromeScore || 0)) / 25) * 2);
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
        probability: lead.chromeScore || lead.score || 70,
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