'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';

interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
}

const scriptTemplates: ScriptTemplate[] = [
  {
    id: 'lead-overview',
    name: 'Lead Overview',
    description: 'General overview of all lead data and key metrics',
  },
  {
    id: 'personalized-outreach',
    name: 'Personalized Outreach',
    description: 'Customized script for reaching out to a specific lead',
  },
  {
    id: 'source-performance',
    name: 'Source Performance',
    description: 'Analysis of which lead sources are performing best',
  },
  {
    id: 'lead-segmentation',
    name: 'Lead Segmentation',
    description: 'Breakdown of leads by segment/tag for targeted messaging',
  },
];

// Mock leads data - replace with real data from your backend
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Michael Wong',
    email: 'michael@bigcorp.com',
    score: 67,
    source: 'Referral',
    status: 'Converted',
    value: 25000,
    company: 'BigCorp Inc.',
    title: 'CTO',
    createdAt: '2024-04-01',
  },
  {
    id: '2',
    name: 'Sarah Miller',
    email: 'sarah@techstart.io',
    score: 82,
    source: 'LinkedIn',
    status: 'Qualified',
    value: 35000,
    company: 'TechStart',
    title: 'CEO',
    createdAt: '2024-04-01',
  },
];

export default function ScriptGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('personalized-outreach');
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [generatedScript, setGeneratedScript] = useState<string>('');

  const generatePersonalizedScript = (lead: Lead) => {
    switch (selectedTemplate) {
      case 'personalized-outreach':
        return `Hi ${lead.name},

I noticed your impressive work at ${lead.company} as ${lead.title}. Your experience in the industry really stands out, and I believe we could create some valuable synergies.

Based on your background and interests, I'd love to share how we've helped similar ${lead.source === 'Referral' ? 'referred' : ''} companies achieve their goals. Our platform has been particularly effective for ${lead.company}'s industry.

Would you be open to a brief conversation this week to explore how we could potentially help ${lead.company} achieve similar results?

Looking forward to connecting,
[Your name]`;

      case 'lead-overview':
        return `Hi ${lead.name},

I've been analyzing our potential collaboration with ${lead.company}, and I'm excited about the possibilities. Your focus on [industry trend] aligns perfectly with our solutions.

Key points I'd love to discuss:
1. Specific solutions for ${lead.company}'s needs
2. Success stories from similar companies
3. Potential value impact of ${lead.value.toLocaleString()} or more

Would you be interested in a quick call to discuss these points in detail?

Best regards,
[Your name]`;

      default:
        return 'Please select a template and lead to generate a personalized script.';
    }
  };

  const handleLeadSelect = (leadId: string) => {
    setSelectedLead(leadId);
    const lead = mockLeads.find(l => l.id === leadId);
    if (lead) {
      setGeneratedScript(generatePersonalizedScript(lead));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (selectedLead) {
      const lead = mockLeads.find(l => l.id === selectedLead);
      if (lead) {
        setGeneratedScript(generatePersonalizedScript(lead));
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
  };

  const handleRegenerate = () => {
    if (selectedLead) {
      const lead = mockLeads.find(l => l.id === selectedLead);
      if (lead) {
        setGeneratedScript(generatePersonalizedScript(lead));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Select Lead</h3>
          <div className="space-y-2">
            {mockLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => handleLeadSelect(lead.id)}
                className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                  selectedLead === lead.id
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-700 hover:border-gray-600 text-gray-300'
                }`}
              >
                <div className="font-medium">{lead.name}</div>
                <div className="text-sm text-gray-500">{lead.company}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs 
                    ${lead.status === 'Converted' ? 'bg-green-500/20 text-green-400' : ''}
                    ${lead.status === 'Qualified' ? 'bg-blue-500/20 text-blue-400' : ''}
                  `}>
                    {lead.status}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500 text-sm">{lead.source}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Select Template</h3>
          <div className="space-y-2">
            {scriptTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-700 hover:border-gray-600 text-gray-300'
                }`}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-gray-500">{template.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Generated Script</h3>
          <div className="flex gap-2">
            <button
              onClick={handleRegenerate}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Regenerate
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
            {generatedScript || 'Select a lead and template to generate a personalized script.'}
          </pre>
        </div>
      </div>
    </div>
  );
} 