'use client';

import { useState, useEffect } from 'react';
import { Lead, CalendarEvent } from '@/types/lead';
import { getLeads } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, TrendingUp, Info } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Create real calendar events from leads data
function generateCalendarEvents(leads: Lead[]): Record<string, CalendarEvent[]> {
  // Create empty calendar with each weekday
  const calendar: Record<string, CalendarEvent[]> = {
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
  
  // Distribute leads across weekdays with the highest-scored leads earlier in the week
  highValueLeads.forEach((lead, index) => {
    // Determine which day to place the lead (prioritize Mon-Wed for higher scores)
    const dayIndex = Math.min(Math.floor(index / 3), 4); // 0-4 for Monday-Friday
    const day = WEEKDAYS[dayIndex];
    
    // Generate a time slot based on lead score
    const scoreBasedHour = 9 + (Math.floor((100 - (lead.chromeScore || 0)) / 25) * 2);
    const startHour = Math.min(Math.max(scoreBasedHour, 9), 15); // Keep between 9am and 3pm
    
    // Create the calendar event
    const event: CalendarEvent = {
      id: lead.id,
      leadName: lead.name,
      startTime: `${startHour}:00 ${startHour < 12 ? 'AM' : 'PM'}`,
      endTime: `${startHour + 2}:00 ${(startHour + 2) < 12 ? 'AM' : 'PM'}`,
      successRate: lead.chromeScore || lead.score || 70,
    };
    
    // Add to the appropriate day
    calendar[day].push(event);
  });
  
  return calendar;
}

export default function ContentCalendar() {
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDayMobile, setActiveDayMobile] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    async function loadLeadsForCalendar() {
      try {
        setLoading(true);
        const leads = await getLeads();
        const calendarEvents = generateCalendarEvents(leads);
        setEvents(calendarEvents);
        
        // Set initial active day for mobile view
        setActiveDayMobile(getCurrentDay());
      } catch (error) {
        console.error('Error loading leads for calendar:', error);
        // Fallback to empty calendar
        setEvents({});
      } finally {
        setLoading(false);
      }
    }
    
    loadLeadsForCalendar();
  }, []);
  
  const getMoreCount = (day: string) => {
    const dayEvents = events[day] || [];
    return dayEvents.length > 3 ? dayEvents.length - 3 : 0;
  };

  const handleDayClick = (day: string) => {
    // Navigate to outreach page with the day as a query parameter
    router.push(`/outreach?day=${day}`);
  };
  
  const handleLeadClick = (leadId: string) => {
    // Navigate directly to the lead detail page
    router.push(`/outreach/lead/${leadId}`);
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
    <div className="bg-gray-900/50 rounded-xl p-4 md:p-6 border border-gray-800/40 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-medium">Chrome Industries Outreach</h2>
        </div>
        <div className="text-sm text-gray-400 px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/50">
          Weekly Schedule
        </div>
      </div>
      
      <h3 className="text-base font-medium mb-4 text-gray-300">Recommended Contact Schedule</h3>
      
      {loading ? (
        <div className="flex justify-center my-8 bg-gray-800/30 rounded-lg p-8">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-gray-700 animate-pulse"></div>
            <div className="text-gray-400">Loading contact schedule...</div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile day selector tabs */}
          <MobileDayTabs />
          
          {/* Desktop view - grid of all days */}
          <div className="hidden md:grid md:grid-cols-5 gap-4">
            {WEEKDAYS.map((day) => (
              <div key={day} className="space-y-3">
                <div 
                  className={`text-center font-medium py-2 rounded-lg 
                    ${day === currentDay 
                      ? 'bg-green-900/30 text-green-400 ring-1 ring-green-800/50' 
                      : 'bg-gray-800/80 text-gray-300'} 
                    cursor-pointer hover:bg-gray-800 transition-colors shadow-sm`}
                  onClick={() => handleDayClick(day)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleDayClick(day)}
                  aria-label={`View all leads for ${day}`}
                >
                  {day === currentDay ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>{day}</span>
                    </div>
                  ) : (
                    day
                  )}
                </div>
                <div className="space-y-2.5">
                  {(events[day] || []).slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="bg-gray-900/90 border border-gray-800/80 rounded-lg p-3 space-y-2 
                        hover:border-blue-500/70 hover:shadow-md hover:shadow-blue-900/20 
                        transition-all duration-200 cursor-pointer group"
                      onClick={() => handleLeadClick(event.id)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleLeadClick(event.id)}
                      aria-label={`View outreach details for ${event.leadName}`}
                    >
                      <div className="font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                        {event.leadName}
                      </div>
                      <div className="flex items-center text-sm text-gray-400 gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-green-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="font-medium">{event.successRate}%</span>
                      </div>
                    </div>
                  ))}
                  {(events[day] || []).length === 0 && (
                    <div className="text-center text-sm text-gray-500 py-8 bg-gray-900/50 rounded-lg border border-gray-800/30">
                      No contacts scheduled
                    </div>
                  )}
                  {getMoreCount(day) > 0 && (
                    <div 
                      className="text-center text-xs font-medium text-blue-400 py-1.5 px-2 rounded-md 
                        bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/30 
                        cursor-pointer transition-colors"
                      onClick={() => handleDayClick(day)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleDayClick(day)}
                      aria-label={`View all ${getMoreCount(day)} additional leads for ${day}`}
                    >
                      +{getMoreCount(day)} more leads
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
                  {(events[activeDayMobile] || []).map((event) => (
                    <div
                      key={`mobile-event-${event.id}`}
                      className="bg-gray-900/90 border border-gray-800/80 rounded-lg p-4 space-y-2.5
                        hover:border-blue-500/70 active:bg-gray-800
                        transition-all duration-200 cursor-pointer"
                      onClick={() => handleLeadClick(event.id)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleLeadClick(event.id)}
                      aria-label={`View outreach details for ${event.leadName}`}
                      role="button"
                    >
                      <div className="font-medium text-blue-400 text-base">
                        {event.leadName}
                      </div>
                      <div className="flex items-center text-sm text-gray-400 gap-1.5">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-green-400">
                        <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="font-medium">{event.successRate}%</span>
                      </div>
                    </div>
                  ))}
                  {(events[activeDayMobile] || []).length === 0 && (
                    <div className="text-center text-sm text-gray-500 py-10 bg-gray-900/30 rounded-lg">
                      No contacts scheduled for {activeDayMobile}
                    </div>
                  )}
                  <div 
                    className="mt-3 py-2.5 px-4 bg-blue-900/20 border border-blue-800/30 rounded-lg
                      text-center text-blue-400 hover:bg-blue-900/30 transition-colors cursor-pointer"
                    onClick={() => handleDayClick(activeDayMobile)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleDayClick(activeDayMobile)}
                    aria-label={`View all leads for ${activeDayMobile} in Outreach page`}
                    role="button"
                  >
                    View all for {activeDayMobile}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="mt-6 text-sm text-gray-400 flex items-center gap-2 bg-gray-800/30 p-3 rounded-md border border-gray-800/30">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span>Contacts are prioritized based on Chrome Industries relevance score.</span>
      </div>
    </div>
  );
} 