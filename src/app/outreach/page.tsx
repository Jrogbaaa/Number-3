'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ScriptGenerator from '@/components/outreach/ScriptGenerator';
import ContentCalendar from '@/components/outreach/ContentCalendar';

const SCRIPT_TEMPLATES = [
  {
    id: 'overview',
    name: 'Lead Overview',
    description: 'General overview of all lead data and key metrics',
  },
  {
    id: 'personalized',
    name: 'Personalized Outreach',
    description: 'Customized script for reaching out to a specific lead',
  },
  {
    id: 'source',
    name: 'Source Performance',
    description: 'Analysis of which lead sources are performing best',
  },
  {
    id: 'segmentation',
    name: 'Lead Segmentation',
    description: 'Breakdown of leads by segment/tag for targeted messaging',
  },
];

export default function OutreachPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('overview');
  const [generatedScript, setGeneratedScript] = useState(`
Hi there! I've just completed an analysis of our lead data, and I'd like to share some key insights with you.

We currently have 10 leads in our pipeline with a total estimated value of $110,000. That's an average of $11,000 per lead.

Our current conversion rate stands at 10.0%, with 1 leads successfully converted.

The majority of our leads are coming from Referral, LinkedIn, Website.

Based on this analysis, I recommend we focus our efforts on nurturing high-value leads and optimizing our approach for our top-performing channels.

Let me know if you'd like a more detailed breakdown of any specific aspect of our lead performance.
  `.trim());

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
  };

  const handleRegenerate = () => {
    // Add regeneration logic here
    console.log('Regenerating script...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Script Generator</h1>
          <div className="text-blue-300">Using data from 10 leads</div>
        </div>

        <div className="card">
          <ScriptGenerator />
        </div>

        <div className="card">
          <h2 className="text-xl font-medium mb-4">Content Calendar</h2>
          <ContentCalendar />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Generated Script</h2>
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
              >
                Regenerate
              </button>
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
              {generatedScript}
            </pre>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 