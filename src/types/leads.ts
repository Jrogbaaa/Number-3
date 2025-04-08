export interface Lead {
  id?: string;
  name: string;
  email: string;
  score: number;
  source: LeadSource;
  status: LeadStatus;
  value: number;
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
  tags?: string[];
  assignedTo?: string;
  company?: string;
  phone?: string;
  lastContactDate?: Date;
  nextFollowUp?: Date;
}

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

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Converted'
  | 'Lost'
  | 'On Hold';

export interface LeadActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  createdAt: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}

export type ActivityType = 
  | 'Note'
  | 'Email'
  | 'Call'
  | 'Meeting'
  | 'Task'
  | 'Status Change'
  | 'Document'
  | 'Other';

export interface LeadFilter {
  status?: LeadStatus[];
  source?: LeadSource[];
  scoreRange?: {
    min?: number;
    max?: number;
  };
  valueRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  assignedTo?: string[];
  tags?: string[];
}

export interface LeadAnalytics {
  totalLeads: number;
  totalValue: number;
  conversionRate: number;
  averageScore: number;
  sourceDistribution: Record<LeadSource, number>;
  statusDistribution: Record<LeadStatus, number>;
  scoreDistribution: {
    range: string;
    count: number;
  }[];
} 