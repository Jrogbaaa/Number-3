// Mock data for the enhanced UI components

// Mock testimonials data
export const mockTestimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechNova',
    quote: 'OptiLeads.ai helped us find hundreds of quality leads that converted at 3x our previous rate.',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Michael Chen',
    role: 'Growth Lead',
    company: 'Sequoia Startups',
    quote: 'We increased our qualified leads by 240% in just 2 months with OptiLeads.ai.',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Sales Operations',
    company: 'EnterpriseCloud',
    quote: 'The AI-powered lead scoring saved our team countless hours and improved conversion by 45%.',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

// Mock stats data
export const mockStats = [
  { value: '250%', label: 'Average increase in qualified leads' },
  { value: '45%', label: 'Reduction in lead qualification time' },
  { value: '3.2x', label: 'Higher conversion rate' },
  { value: '78%', label: 'of users see results in first month' },
];

// Companies using the platform
export const mockCompanies = [
  'Adobe', 'Shopify', 'Stripe', 'Dropbox', 'Slack', 'Atlassian'
];

// Mock leads data with enhanced properties
export const mockLeads = [
  {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex.thompson@techcorp.com',
    company: 'TechCorp Solutions',
    title: 'Marketing Director',
    source: 'LinkedIn',
    status: 'Qualified' as const,
    value: 5000,
    created_at: '2024-01-15T10:30:00Z',
    marketingScore: 85,
    budgetPotential: 78,
    budgetConfidence: 'High' as const,
    businessOrientation: 'B2B' as const,
    orientationConfidence: 'High' as const,
    location: 'San Francisco, CA',
    timezone: 'PST',
    optimalOutreachTime: '10:00 AM - 12:00 PM PST',
    phone: '+1-555-0123',
    linkedinUrl: 'https://linkedin.com/in/alexthompson',
    intentScore: 82,
    spendAuthorityScore: 75,
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@innovatetech.com',
    company: 'InnovateTech',
    title: 'VP of Marketing',
    source: 'Website',
    status: 'New' as const,
    value: 8000,
    created_at: '2024-01-14T14:20:00Z',
    marketingScore: 92,
    budgetPotential: 88,
    budgetConfidence: 'High' as const,
    businessOrientation: 'B2B' as const,
    orientationConfidence: 'Medium' as const,
    location: 'New York, NY',
    timezone: 'EST',
    optimalOutreachTime: '9:00 AM - 11:00 AM EST',
    phone: '+1-555-0124',
    linkedinUrl: 'https://linkedin.com/in/sarahmitchell',
    intentScore: 89,
    spendAuthorityScore: 91,
  },
  {
    id: '3',
    name: 'David Park',
    email: 'david.park@growthstartup.com',
    company: 'Growth Startup Inc',
    title: 'Content Marketing Manager',
    source: 'Referral',
    status: 'Contacted' as const,
    value: 3500,
    created_at: '2024-01-13T09:15:00Z',
    marketingScore: 76,
    budgetPotential: 65,
    budgetConfidence: 'Medium' as const,
    businessOrientation: 'B2B' as const,
    orientationConfidence: 'High' as const,
    location: 'Austin, TX',
    timezone: 'CST',
    optimalOutreachTime: '2:00 PM - 4:00 PM CST',
    phone: '+1-555-0125',
    linkedinUrl: 'https://linkedin.com/in/davidpark',
    intentScore: 71,
    spendAuthorityScore: 58,
  },
  {
    id: '4',
    name: 'Lisa Chen',
    email: 'lisa.chen@digitalagency.com',
    company: 'Digital Agency Pro',
    title: 'CEO',
    source: 'Conference',
    status: 'Converted' as const,
    value: 12000,
    created_at: '2024-01-12T16:45:00Z',
    marketingScore: 94,
    budgetPotential: 95,
    budgetConfidence: 'High' as const,
    businessOrientation: 'B2B' as const,
    orientationConfidence: 'High' as const,
    location: 'Los Angeles, CA',
    timezone: 'PST',
    optimalOutreachTime: '11:00 AM - 1:00 PM PST',
    phone: '+1-555-0126',
    linkedinUrl: 'https://linkedin.com/in/lisachen',
    intentScore: 96,
    spendAuthorityScore: 98,
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'james.wilson@retailchain.com',
    company: 'Retail Chain Corp',
    title: 'Brand Manager',
    source: 'Cold Email',
    status: 'Lost' as const,
    value: 2000,
    created_at: '2024-01-11T11:30:00Z',
    marketingScore: 45,
    budgetPotential: 42,
    budgetConfidence: 'Low' as const,
    businessOrientation: 'B2C' as const,
    orientationConfidence: 'Medium' as const,
    location: 'Chicago, IL',
    timezone: 'CST',
    optimalOutreachTime: '1:00 PM - 3:00 PM CST',
    phone: '+1-555-0127',
    linkedinUrl: 'https://linkedin.com/in/jameswilson',
    intentScore: 38,
    spendAuthorityScore: 35,
  },
  // ... existing code ...
];

// Mock dashboard stats
export const mockDashboardStats = {
  totalLeads: mockLeads.length,
  qualifiedLeads: mockLeads.filter(lead => lead.status === 'Qualified' || lead.status === 'Converted').length,
  conversionRate: Math.round((mockLeads.filter(lead => lead.status === 'Converted').length / mockLeads.length) * 100),
  avgScore: Math.round(mockLeads.reduce((sum, lead) => sum + (lead.marketingScore || 0), 0) / mockLeads.length),
};

// Mock user preferences
export const mockUserPreferences = {
  targetRoles: ['Marketing Director', 'VP of Marketing', 'Content Manager'],
  targetIndustries: ['Technology', 'SaaS', 'Digital Marketing'],
  companyProduct: 'AI-powered content marketing platform',
  targetCompanySizes: ['50-200', '200-1000'],
};

// Export all mock data
export const mockData = {
  testimonials: mockTestimonials,
  stats: mockStats,
  companies: mockCompanies,
  leads: mockLeads,
  dashboardStats: mockDashboardStats,
  userPreferences: mockUserPreferences,
};