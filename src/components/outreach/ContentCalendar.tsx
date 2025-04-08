import React, { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';
import { getLeads } from '@/lib/supabase';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface CalendarSlot {
  id: string;
  day: string;
  lead: string;
  time: string;
  probability: number;
}

const ContentCalendar = () => {
  const [calendarData, setCalendarData] = useState<Record<string, CalendarSlot[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    async function loadLeadsForCalendar() {
      try {
        setLoading(true);
        const leads = await getLeads();
        
        // Generate calendar data from real leads
        const generatedCalendarData = generateCalendarData(leads);
        setCalendarData(generatedCalendarData);
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">Weekly Contact Calendar</h2>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-pulse text-gray-400">Loading contact schedule...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {WEEKDAYS.map((day) => (
            <div key={day} className="space-y-4">
              <h3 className="text-center font-medium py-2 border-b border-gray-700">
                {day}
              </h3>
              <div className="space-y-2">
                {getSlotsByDay(day).slice(0, 3).map((slot) => (
                  <div 
                    key={slot.id} 
                    className="p-3 bg-navy border border-gray-800 rounded-lg"
                  >
                    <div className="font-medium">{slot.lead}</div>
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
                  <div className="text-center text-sm text-gray-400">
                    +{getMoreCount(day)} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-4 h-4 text-blue-400"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>Contact schedule is based on Chrome Industries relevance score and best contact times.</span>
      </div>
    </div>
  );
};

export default ContentCalendar; 