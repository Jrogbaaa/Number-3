import { StaticImageData } from "next/image";

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
  propsContentEngagement?: number;
  relevantPostings?: string[];
  industryGroupParticipation?: string[];
  companySize?: number;
  companySizeRange?: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  annualRevenue?: string;
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
  timezone?: string;
  optimalOutreachTime?: string;
  outreachReason?: string;
  tags?: string[];
  user_id?: string;

  marketingScore?: number;
  budgetPotential?: number;
  budgetConfidence?: 'Low' | 'Medium' | 'High';
  businessOrientation?: 'B2B' | 'B2C' | 'Mixed' | 'Unknown';
  orientationConfidence?: 'Low' | 'Medium' | 'High';
  optimalOutreachTimeEastern?: string;
  intentScore?: number;
  spendAuthorityScore?: number;
}

export interface CalendarEvent {
  id: string;
  leadName: string;
  companyName?: string;
  startTime: string;
  endTime: string;
  successRate: number;
  displayTime?: string;
  _sortTime?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  isPrimary?: boolean;
}

export interface InteractionLog {
  id: string;
  timestamp: string;
  type: "Email" | "Call" | "Meeting" | "Note";
  notes: string;
  outcome?: string;
  followUpDate?: string;
} 