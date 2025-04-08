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
  | 'Referral'
  | 'Website'
  | 'LinkedIn'
  | 'Conference'
  | 'Instagram'
  | 'Cold Call'
  | 'Email Campaign'
  | 'Partner'
  | 'Other';

export interface LeadInsights {
  topics?: string[];
  interests?: string[];
  background?: string[];
  potentialValue?: number;
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
  linkedinUrl?: string;
}

export interface CalendarEvent {
  id: string;
  leadName: string;
  startTime: string;
  endTime: string;
  successRate: number;
} 