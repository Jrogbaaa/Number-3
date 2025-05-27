'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, TrendingUp, Info } from 'lucide-react';
import type { Lead, CalendarEvent } from '@/types/lead';
import Link from 'next/link';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// --- Time Zone Helper Functions ---

// Tries to guess an IANA time zone name from a free-form location string
const guessTimeZone = (location: string | undefined): string | null => {
  if (!location) return null;
  const locLower = location.toLowerCase();

  // Simple keyword matching (add more as needed)
  // UK / Europe
  if (locLower.includes('london') || locLower.includes('uk') || locLower.includes('united kingdom') || locLower.includes('gmt') || locLower.includes('bst')) return 'Europe/London';
  if (locLower.includes('paris') || locLower.includes('berlin') || locLower.includes('rome') || locLower.includes('madrid') || locLower.includes('cet') || locLower.includes('cest')) return 'Europe/Paris';
  // US East Coast
  if (locLower.includes('new york') || locLower.includes('ny') || locLower.includes('boston') || locLower.includes('philadelphia') || locLower.includes('atlanta') || locLower.includes('est') || locLower.includes('edt')) return 'America/New_York';
  // US Central
  if (locLower.includes('chicago') || locLower.includes('dallas') || locLower.includes('houston') || locLower.includes('cst') || locLower.includes('cdt')) return 'America/Chicago';
  // US Mountain
  if (locLower.includes('denver') || locLower.includes('phoenix') || locLower.includes('mst') || locLower.includes('mdt')) return 'America/Denver';
  // US Pacific
  if (locLower.includes('los angeles') || locLower.includes('san francisco') || locLower.includes('seattle') || locLower.includes('california') || locLower.includes('ca') || locLower.includes('pst') || locLower.includes('pdt')) return 'America/Los_Angeles';
  // Add more specific locations or broader regions if needed

  return null; // Could not reliably guess
};

// Gets a time zone abbreviation (e.g., PST, EST, GMT)
const getTimeZoneAbbreviation = (timeZone: string): string => {
  try {
    // Use Intl API to get the abbreviation based on the current date
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      timeZoneName: 'short',
    });
    // Extract the abbreviation part from the formatted string
    const parts = formatter.formatToParts(new Date());
    const tzNamePart = parts.find(part => part.type === 'timeZoneName');
    return tzNamePart ? tzNamePart.value : '';
  } catch (e) {
    console.warn(`Could not get abbreviation for timezone: ${timeZone}`, e);
    return ''; // Return empty string on error
  }
};

// --- End Helper Functions ---

// --- New Helper Function to Parse Start Time ---
// Parses time string like "10:00 AM - 12:00 PM" or "2:00 PM - 3:00 PM" into a sortable 24-hour number
const parseStartTimeToHour = (timeString: string | undefined): number => {
  if (!timeString) return 24; // Default to end of day if no time string

  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 24; // Default if format doesn't match

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) { // Handle 12:XX AM
    hours = 0;
  }

  // Return hours (or hours + minutes/60 for more precision if needed)
  return hours;
};

// --- End New Helper Function ---

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
  
  // Only use high-value leads (sorted by custom scoring priority)
  const highValueLeads = [...leads]
    .sort((a, b) => {
      // Use the same multi-factor scoring as the dashboard
      // 1. Intent Score (Highest priority)
      const intentComparison = (b.intentScore ?? 0) - (a.intentScore ?? 0);
      if (intentComparison !== 0) return intentComparison;
      
      // 2. Spend Authority Score
      const spendAuthorityComparison = (b.spendAuthorityScore ?? 0) - (a.spendAuthorityScore ?? 0);
      if (spendAuthorityComparison !== 0) return spendAuthorityComparison;
      
      // 3. Marketing Score
      const marketingComparison = (b.marketingScore ?? 0) - (a.marketingScore ?? 0);
      if (marketingComparison !== 0) return marketingComparison;
      
      // 4. Budget Potential
      const budgetComparison = (b.budgetPotential ?? 0) - (a.budgetPotential ?? 0);
      if (budgetComparison !== 0) return budgetComparison;
      
      // 5. Fallback to legacy scores if new scores aren't available
      const scoreA = a.chromeScore || a.score || 0;
      const scoreB = b.chromeScore || b.score || 0;
      return scoreB - scoreA;
    })
    .slice(0, 15); // Limit to top 15 for the weekly view
  
  let timeSlotCounter = 0; // To alternate between morning/afternoon slots

  // Distribute leads across weekdays with the highest-scored leads earlier in the week
  highValueLeads.forEach((lead, index) => {
    // Determine which day to place the lead (prioritize Mon-Wed for higher scores)
    const dayIndex = Math.min(Math.floor(index / 3), 4); // 0-4 for Monday-Friday
    const day = WEEKDAYS[dayIndex];
    
    // *** Use Optimal Outreach Time if available, otherwise generate a slot ***
    let startTime: string;
    let endTime: string;
    let displayTime: string;
    let sourceTime: string | undefined = lead.optimalOutreachTime; // Use the enriched time if present

    if (lead.optimalOutreachTime) {
      const times = lead.optimalOutreachTime.split(' - ');
      startTime = times[0] || '10:00 AM'; // Fallback if parsing fails
      endTime = times[1] || '12:00 PM'; // Fallback if parsing fails
      displayTime = lead.optimalOutreachTime;
    } else {
      // Generate fallback time slot
      let startHour;
      if (timeSlotCounter % 2 === 0) startHour = 10; 
      else startHour = 15; 
      timeSlotCounter++;
      const endHour = startHour + 2; 
      startTime = `${startHour % 12 === 0 ? 12 : startHour % 12}:00 ${startHour < 12 || startHour === 24 ? 'AM' : 'PM'}`;
      endTime = `${endHour % 12 === 0 ? 12 : endHour % 12}:00 ${endHour < 12 || endHour === 24 ? 'AM' : 'PM'}`;
      displayTime = `${startTime} - ${endTime}`;
      sourceTime = displayTime; // Use the generated time for sorting if optimal isn't available
    }

    // Add timezone abbreviation if possible (keep existing logic)
    const guessedTimeZone = guessTimeZone(lead.location || lead.timezone); // Also check lead.timezone
    if (guessedTimeZone) {
      const abbreviation = getTimeZoneAbbreviation(guessedTimeZone);
      if (abbreviation) {
        displayTime = `${startTime} - ${endTime} ${abbreviation}`;
      }
    }

    // Create the calendar event
    const event: CalendarEvent = {
      id: lead.id,
      leadName: lead.name,
      companyName: lead.company,
      startTime: startTime, // Keep original for potential internal use
      endTime: endTime,   // Keep original for potential internal use
      displayTime: displayTime, // Use the new formatted string for display
      successRate: lead.marketingScore || lead.chromeScore || lead.score || 70,
      // Store the source time string for reliable sorting
      _sortTime: sourceTime 
    };
    
    // Add to the appropriate day
    calendar[day].push(event);
  });

  // --- Sort events within each day by start time ---
  for (const day of WEEKDAYS) {
    calendar[day].sort((a, b) => {
      const hourA = parseStartTimeToHour(a._sortTime || a.displayTime);
      const hourB = parseStartTimeToHour(b._sortTime || b.displayTime);
      return hourA - hourB;
    });
  }
  // --- End Sorting ---
  
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
        
        // Use the new server-side API route instead of direct Supabase call
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
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-400" />
        Outreach Calendar
      </h2>
      
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
                      {event.companyName && (
                        <div className="text-sm text-gray-500 group-hover:text-gray-400 truncate transition-colors">
                          {event.companyName}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-400 gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{event.displayTime || `${event.startTime} - ${event.endTime}`}</span>
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
                      {event.companyName && (
                        <div className="text-sm text-gray-500 truncate">
                          {event.companyName}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-400 gap-1.5">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{event.displayTime || `${event.startTime} - ${event.endTime}`}</span>
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
        <span>Contacts are prioritized based on OptiLeads.ai relevance score.</span>
      </div>
    </div>
  );
} 