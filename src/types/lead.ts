export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Responded'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Converted'
  | 'Lost'
  | 'On Hold';

export type LeadSource = 
  | 'LinkedIn'
  | 'Website'
  | 'Referral'
  | 'Cold Outreach'
  | 'Event'
  | 'Conference'
  | 'Other';

export interface LeadInsights {
  topics?: string[];
  interests?: string[];
  background?: string[];
  potentialValue?: number;
  lastInteraction?: string;
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  score: number;
  source: LeadSource;
  status: LeadStatus;
  value: number;
  company: string;
  title: string;
  created_at: string;
  last_contacted_at?: string;
  insights?: LeadInsights;
  chromeScore?: number;
  propsScore?: number;
  linkedinUrl?: string;
  phone?: string;
  location?: string;
  tags?: string[];
}

export interface CalendarEvent {
  id: string;
  leadName: string;
  startTime: string;
  endTime: string;
  successRate: number;
} 