'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getLeads } from '@/lib/supabase';
import { Lead } from '@/types/lead';
import { ExternalLink, Briefcase, Award, Calendar, Mail, Phone, MessageSquare, Linkedin } from 'lucide-react';

interface OutreachTemplate {
  id: string;
  name: string;
  content: string;
}

// Pre-defined templates for outreach
const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn Message',
    content: `Hi {name},

I came across your profile and was impressed by your work at {company} as {title}. Your experience in the industry really stands out!

I'd love to connect and explore potential synergies between our organizations. We're helping companies similar to {company} with innovative solutions that might be of interest to you.

Looking forward to connecting!

Best regards,
[Your Name]`
  },
  {
    id: 'email',
    name: 'Email Outreach',
    content: `Subject: Quick question about {company}'s approach to growth

Hi {name},

I hope this email finds you well. Your work at {company} caught my attention, particularly your role as {title}.

I've been working with similar organizations on solutions that have helped them achieve significant growth. Based on your background, I believe we could have a valuable conversation about how these approaches might benefit {company} as well.

Would you be open to a 15-minute call next week to discuss this further?

Best regards,
[Your Name]`
  },
  {
    id: 'follow-up',
    name: 'Follow-up Message',
    content: `Hi {name},

I wanted to follow up on my previous message, as I understand how busy things can get at {company}.

I'm still interested in connecting to share some insights that have benefited companies similar to yours. Based on your experience as {title}, I believe you'd find these particularly relevant.

Let me know if you'd be open to a brief conversation at your convenience.

Best regards,
[Your Name]`
  }
];

// Client component that uses useParams
function LeadDetailContent() {
  const params = useParams();
  const leadId = params.id as string;
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('linkedin');
  const [personalizedMessage, setPersonalizedMessage] = useState<string>('');
  
  useEffect(() => {
    async function fetchLead() {
      try {
        setLoading(true);
        const leads = await getLeads();
        const foundLead = leads.find(l => l.id === leadId);
        
        if (foundLead) {
          setLead(foundLead);
          // Initialize with the first template
          setPersonalizedMessage(personalizeTemplate(foundLead, OUTREACH_TEMPLATES[0].content));
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (leadId) {
      fetchLead();
    }
  }, [leadId]);
  
  // Select a template and personalize it
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (lead) {
      const template = OUTREACH_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        setPersonalizedMessage(personalizeTemplate(lead, template.content));
      }
    }
  };
  
  // Replace placeholders with actual lead data
  const personalizeTemplate = (lead: Lead, template: string): string => {
    return template
      .replace(/{name}/g, lead.name)
      .replace(/{company}/g, lead.company)
      .replace(/{title}/g, lead.title);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(personalizedMessage);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading lead details...</div>
      </div>
    );
  }
  
  if (!lead) {
    return (
      <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">
        Lead not found. Please select a valid lead.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lead Outreach</h1>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm
            ${lead.status === 'Converted' ? 'bg-green-500/20 text-green-400' : ''}
            ${lead.status === 'Qualified' ? 'bg-blue-500/20 text-blue-400' : ''}
            ${lead.status === 'New' ? 'bg-purple-500/20 text-purple-400' : ''}
            ${lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400' : ''}
            ${lead.status === 'Lost' ? 'bg-red-500/20 text-red-400' : ''}
          `}>
            {lead.status}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lead Profile Card */}
        <div className="bg-[#1A1F2B] rounded-lg p-6 col-span-1">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-semibold text-blue-400">
                {lead.name.charAt(0)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-center">{lead.name}</h2>
            <p className="text-gray-400 text-center">{lead.title}</p>
            
            {lead.linkedinUrl && (
              <a 
                href={lead.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 text-blue-400 flex items-center hover:underline"
              >
                <Linkedin className="w-4 h-4 mr-1" />
                <span>View LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Company</p>
                <p className="font-medium">{lead.company}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Chrome Score</p>
                <p className="font-medium text-green-400">{lead.chromeScore || lead.score}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-medium">{lead.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Added on</p>
                <p className="font-medium">
                  {new Date(lead.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {lead.last_contacted_at && (
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Last Contacted</p>
                  <p className="font-medium">
                    {new Date(lead.last_contacted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {lead.insights && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-medium mb-4">Insights</h3>
              
              {lead.insights.topics && lead.insights.topics.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Key Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.insights.topics.map((topic, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {lead.insights.interests && lead.insights.interests.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.insights.interests.map((interest, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Outreach Templates */}
        <div className="bg-[#1A1F2B] rounded-lg p-6 col-span-2">
          <h2 className="text-xl font-medium mb-6">Personalized Outreach</h2>
          
          <div className="flex space-x-4 mb-6">
            {OUTREACH_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedTemplate === template.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Personalized Message</h3>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Copy
              </button>
            </div>
            
            <div className="bg-[#0D1117] rounded-lg p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
                {personalizedMessage}
              </pre>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Outreach History</h3>
            
            {lead.last_contacted_at ? (
              <div className="bg-[#0D1117] rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-blue-400 font-medium">LinkedIn Message</span>
                    <p className="text-gray-400 text-sm">
                      Sent on {new Date(lead.last_contacted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                    Sent
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Initial outreach message sent through LinkedIn.
                </p>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-4">
                No outreach history found. Send your first message to this lead.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function LeadDetailLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-gray-400">Loading lead details...</div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function LeadDetailPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<LeadDetailLoadingFallback />}>
        <LeadDetailContent />
      </Suspense>
    </DashboardLayout>
  );
} 