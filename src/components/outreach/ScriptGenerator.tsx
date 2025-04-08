'use client';

import React, { useState } from 'react';

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

const ScriptGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('lead-overview');
  const [generatedScript, setGeneratedScript] = useState<string>(`
Hi there! I've just completed an analysis of our lead data, and I'd like to share some key insights with you.

We currently have 10 leads in our pipeline with a total estimated value of $110,000. That's an average of $11,000 per lead.

Our current conversion rate stands at 10.0%, with 1 leads successfully converted.

The majority of our leads are coming from Referral, LinkedIn, Website.

Based on this analysis, I recommend we focus our efforts on nurturing high-value leads and optimizing our approach for our top-performing channels.

Let me know if you'd like a more detailed breakdown of any specific aspect of our lead performance.
  `);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // In a real app, we would generate a new script based on the template
    // For demo purposes, we'll use the same script
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">Script Generator</h2>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-gray-400">Select Script Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scriptTemplates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border border-gray-700 rounded-lg cursor-pointer transition-colors ${
                selectedTemplate === template.id
                  ? 'border-accent-blue bg-accent-blue/5'
                  : 'hover:border-gray-600'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedTemplate === template.id}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleTemplateSelect(template.id);
                }
              }}
            >
              <h4 className="font-medium">{template.name}</h4>
              <p className="text-sm text-gray-400 mt-1">{template.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3 flex justify-between">
          Generated Script
          <div>
            <button
              className="px-4 py-1.5 bg-accent-blue text-white rounded-lg mr-2"
              aria-label="Regenerate script"
              tabIndex={0}
            >
              Regenerate
            </button>
            <button
              className="px-4 py-1.5 bg-gray-700 text-white rounded-lg"
              aria-label="Copy script to clipboard"
              tabIndex={0}
            >
              Copy
            </button>
          </div>
        </h3>
        <div className="p-4 bg-gray-900 rounded-lg whitespace-pre-line">
          {generatedScript}
        </div>
      </div>
    </div>
  );
};

export default ScriptGenerator; 