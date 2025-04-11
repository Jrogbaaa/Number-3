'use client';

import React, { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';
import { getLeads } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface CalendarSlot {
  id: string;
  day: string;
  lead: string;
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

  const getProbabilityColor = (probability: number) => {
    if (probability >= 85) return 'text-green-400';
    if (probability >= 80) return 'text-green-500';
    if (probability >= 75) return 'text-yellow-400';
    return 'text-yellow-500';
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
    <div className="flex overflow-x-auto pb-2 md:hidden space-x-2 no-scrollbar touch-auto">
      {WEEKDAYS.map((day) => (
        <button
          key={day}
          className={`px-4 py-3 whitespace-nowrap rounded-lg text-sm font-medium min-w-[90px] ${
            activeDayMobile === day 
              ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' 
              : 'bg-gray-800/80 text-gray-400 border border-gray-700/30'
          }`}
          onClick={() => handleDaySelect(day)}
          aria-label={`View ${day} schedule${day === currentDay ? ' (Today)' : ''}`}
          aria-selected={activeDayMobile === day}
          role="tab"
        >
          {day.substring(0, 3)}
          {day === currentDay && ' •'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">Weekly Contact Calendar</h2>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-pulse text-gray-400">Loading contact schedule...</div>
        </div>
      ) : (
        <>
          {/* Mobile day selector tabs */}
          <MobileDayTabs />

          {/* Desktop view - grid of all days */}
          <div className="hidden md:grid md:grid-cols-5 gap-4">
            {WEEKDAYS.map((day) => (
              <div key={`desktop-${day}`} className="space-y-4">
                <h3 
                  className={`text-center font-medium py-2 border-b border-gray-700 ${
                    selectedDay === day ? 'bg-green-900/20 text-green-400 rounded-t-lg' : 
                    day === currentDay ? 'bg-blue-900/20 text-blue-400 rounded-t-lg' : ''
                  } cursor-pointer hover:bg-gray-800/50`}
                  onClick={() => handleViewAll(day)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleViewAll(day)}
                  aria-label={`View all leads for ${day}`}
                >
                  {day} {day === currentDay && '(Today)'}
                </h3>
                <div className="space-y-2">
                  {getSlotsByDay(day).slice(0, 3).map((slot) => (
                    <div 
                      key={`desktop-slot-${slot.id}`} 
                      className="p-3 bg-navy border border-gray-800 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => handleSlotClick(slot.id)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSlotClick(slot.id)}
                      aria-label={`View outreach details for ${slot.lead}`}
                    >
                      <div className="font-medium text-blue-400 hover:underline">{slot.lead}</div>
                      <div className="text-sm text-gray-400">{slot.time}</div>
                      <div className={`text-right ${getProbabilityColor(slot.probability)}`}>
                        {slot.probability}%
                      </div>
                    </div>
                  ))}
                  {getSlotsByDay(day).length === 0 && (
                    <div className="text-center text-sm text-gray-500 py-6">
                      No contacts scheduled
                    </div>
                  )}
                  {getMoreCount(day) > 0 && (
                    <div
                      className="text-center text-sm text-blue-400 hover:underline cursor-pointer"
                      onClick={() => handleViewAll(day)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleViewAll(day)}
                      aria-label={`View all ${getMoreCount(day)} more leads for ${day}`}
                    >
                      +{getMoreCount(day)} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile view - only showing active day */}
          <div className="md:hidden">
            {activeDayMobile && (
              <div className="space-y-3">
                <h3 className="font-medium text-center py-2 border-b border-gray-700 rounded-t-lg bg-blue-900/10">
                  {activeDayMobile} Schedule
                  {activeDayMobile === currentDay && ' (Today)'}
                </h3>
                <div className="space-y-3">
                  {getSlotsByDay(activeDayMobile).map((slot) => (
                    <div 
                      key={`mobile-slot-${slot.id}`} 
                      className="p-4 bg-navy border border-gray-800 rounded-lg hover:border-blue-500 transition-colors cursor-pointer active:bg-gray-800"
                      onClick={() => handleSlotClick(slot.id)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSlotClick(slot.id)}
                      aria-label={`View outreach details for ${slot.lead}`}
                      role="button"
                    >
                      <div className="font-medium text-blue-400 text-base">{slot.lead}</div>
                      <div className="text-sm text-gray-400 mt-1">{slot.time}</div>
                      <div className={`text-right mt-1 ${getProbabilityColor(slot.probability)}`}>
                        {slot.probability}%
                      </div>
                    </div>
                  ))}
                  {getSlotsByDay(activeDayMobile).length === 0 && (
                    <div className="text-center text-sm text-gray-500 py-10 bg-gray-900/30 rounded-lg">
                      No contacts scheduled for {activeDayMobile}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="flex items-center gap-2 text-sm text-gray-400 p-3 bg-gray-900/30 rounded-lg border border-gray-800/30">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-4 h-4 text-blue-400 flex-shrink-0"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>Contact schedule is based on PROPS relevance score and best contact times.</span>
      </div>
    </div>
  );
};

export default ContentCalendar; 