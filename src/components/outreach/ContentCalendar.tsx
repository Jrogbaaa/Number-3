import React from 'react';

// Mock data for the content calendar
const calendarData = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  slots: [
    {
      id: 1,
      day: 'Monday',
      lead: 'Emily Johnson',
      time: '3:00 PM - 5:00 PM',
      probability: 88,
    },
    {
      id: 2,
      day: 'Monday',
      lead: 'Jessica Taylor',
      time: '3:00 PM - 5:00 PM',
      probability: 87,
    },
    {
      id: 3,
      day: 'Monday',
      lead: 'David Wilson',
      time: '9:00 AM - 11:00 AM',
      probability: 77,
    },
    {
      id: 4,
      day: 'Tuesday',
      lead: 'John Smith',
      time: '3:00 PM - 5:00 PM',
      probability: 77,
    },
    {
      id: 5,
      day: 'Tuesday',
      lead: 'Emily Johnson',
      time: '3:00 PM - 5:00 PM',
      probability: 83,
    },
    {
      id: 6,
      day: 'Tuesday',
      lead: 'Robert Chen',
      time: '1:00 PM - 3:00 PM',
      probability: 79,
    },
    {
      id: 7,
      day: 'Wednesday',
      lead: 'Sarah Miller',
      time: '1:00 PM - 3:00 PM',
      probability: 79,
    },
    {
      id: 8,
      day: 'Wednesday',
      lead: 'Amanda Rodriguez',
      time: '9:00 AM - 11:00 AM',
      probability: 79,
    },
    {
      id: 9,
      day: 'Wednesday',
      lead: 'Thomas Brown',
      time: '1:00 PM - 3:00 PM',
      probability: 80,
    },
    {
      id: 10,
      day: 'Thursday',
      lead: 'John Smith',
      time: '9:00 AM - 11:00 AM',
      probability: 82,
    },
    {
      id: 11,
      day: 'Thursday',
      lead: 'Michael Wong',
      time: '1:00 PM - 3:00 PM',
      probability: 76,
    },
    {
      id: 12,
      day: 'Thursday',
      lead: 'Sarah Miller',
      time: '3:00 PM - 5:00 PM',
      probability: 85,
    },
    {
      id: 13,
      day: 'Friday',
      lead: 'Michael Wong',
      time: '3:00 PM - 5:00 PM',
      probability: 89,
    },
    {
      id: 14,
      day: 'Friday',
      lead: 'Sarah Miller',
      time: '1:00 PM - 3:00 PM',
      probability: 85,
    },
  ],
};

const ContentCalendar = () => {
  const getSlotsByDay = (day: string) => {
    return calendarData.slots.filter((slot) => slot.day === day).slice(0, 3);
  };

  const getMoreCount = (day: string) => {
    const count = calendarData.slots.filter((slot) => slot.day === day).length - 3;
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
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {calendarData.days.map((day) => (
          <div key={day} className="space-y-4">
            <h3 className="text-center font-medium py-2 border-b border-gray-700">
              {day}
            </h3>
            <div className="space-y-2">
              {getSlotsByDay(day).map((slot) => (
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
              {getMoreCount(day) > 0 && (
                <div className="text-center text-sm text-gray-400">
                  +{getMoreCount(day)} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
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
        <span>Times are based on lead activity patterns and industry best practices.</span>
      </div>
    </div>
  );
};

export default ContentCalendar; 