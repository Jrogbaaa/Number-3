export type LeadStatus = 'New' | 'Qualified' | 'Contacted' | 'Converted' | 'Disqualified';

export type LeadSource = 'Referral' | 'Website' | 'LinkedIn' | 'Conference' | 'Instagram' | 'Webinar';

export interface Lead {
  id: string;
  name: string;
  email: string;
  score: number;
  source: LeadSource;
  status: LeadStatus;
  value: number;
  createdAt: string;
  lastContactedAt?: string;
}

export interface CalendarEvent {
  id: string;
  leadName: string;
  startTime: string;
  endTime: string;
  successRate: number;
} 