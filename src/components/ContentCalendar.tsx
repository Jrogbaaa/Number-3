'use client';

import { useState, useEffect } from 'react';
import { Lead, CalendarEvent } from '@/types/lead';
import { getLeads } from '@/lib/supabase';

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
  
  useEffect(() => {
    async function loadLeadsForCalendar() {
      try {
        setLoading(true);
        const leads = await getLeads();
        const calendarEvents = generateCalendarEvents(leads);
        setEvents(calendarEvents);
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

  return (
    <div className="bg-[#1A1F2B] rounded-lg p-6">
      <h2 className="text-xl font-medium mb-6">Chrome Industries Outreach</h2>
      <h3 className="text-lg font-medium mb-4">Recommended Contact Schedule</h3>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-pulse text-gray-400">Loading contact schedule...</div>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {WEEKDAYS.map((day) => (
            <div key={day} className="space-y-4">
              <h4 className="text-center font-medium py-2 border-b border-gray-700">{day}</h4>
              <div className="space-y-2">
                {(events[day] || []).slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="bg-[#0D1117] border border-gray-800 rounded-lg p-3 space-y-2"
                  >
                    <div className="font-medium">{event.leadName}</div>
                    <div className="text-sm text-gray-400">
                      {event.startTime} - {event.endTime}
                    </div>
                    <div className="text-right text-green-400">
                      {event.successRate}%
                    </div>
                  </div>
                ))}
                {(events[day] || []).length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-6">
                    No contacts scheduled
                  </div>
                )}
                {getMoreCount(day) > 0 && (
                  <div className="text-center text-sm text-gray-400">
                    +{getMoreCount(day)} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-400 flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Contacts are prioritized based on Chrome Industries relevance score.
      </div>
    </div>
  );
} 