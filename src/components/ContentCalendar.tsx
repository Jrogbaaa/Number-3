'use client';

import { CalendarEvent } from '@/types/lead';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const mockEvents: Record<string, CalendarEvent[]> = {
  Monday: [
    {
      id: '1',
      leadName: 'Emily Johnson',
      startTime: '3:00 PM',
      endTime: '5:00 PM',
      successRate: 88,
    },
    {
      id: '2',
      leadName: 'Jessica Taylor',
      startTime: '3:00 PM',
      endTime: '5:00 PM',
      successRate: 87,
    },
    {
      id: '3',
      leadName: 'David Wilson',
      startTime: '9:00 AM',
      endTime: '11:00 AM',
      successRate: 77,
    },
  ],
  // Add other days' events from the screenshot
};

export default function ContentCalendar() {
  return (
    <div>
      <h3 className="text-xl font-medium mb-4">Weekly Contact Calendar</h3>
      <div className="grid grid-cols-5 gap-4">
        {WEEKDAYS.map((day) => (
          <div key={day} className="space-y-4">
            <h4 className="text-lg font-medium">{day}</h4>
            <div className="space-y-2">
              {(mockEvents[day] || []).map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-800/50 rounded-lg p-4 space-y-2"
                >
                  <div className="font-medium">{event.leadName}</div>
                  <div className="text-sm text-gray-400">
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${event.successRate}%` }}
                    />
                    <span className="text-green-400 text-sm">
                      {event.successRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
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
        Times are based on lead activity patterns and industry best practices.
      </div>
    </div>
  );
} 