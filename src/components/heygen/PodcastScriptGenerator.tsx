'use client';

import React, { useState } from 'react';

interface PodcastFormat {
  id: string;
  name: string;
  description: string;
}

const podcastFormats: PodcastFormat[] = [
  {
    id: 'interview',
    name: 'Interview Style',
    description: 'One host interviews an expert about lead data insights',
  },
  {
    id: 'discussion',
    name: 'Discussion Format',
    description: 'Multiple hosts discuss lead insights and strategies',
  },
  {
    id: 'debate',
    name: 'Debate Format',
    description: 'Hosts present contrasting views on lead generation approaches',
  },
];

const PodcastScriptGenerator = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>('interview');

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">Select Podcast Format</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {podcastFormats.map((format) => (
          <div
            key={format.id}
            className={`p-4 border border-gray-700 rounded-lg cursor-pointer transition-colors ${
              selectedFormat === format.id
                ? 'border-accent-blue bg-accent-blue/5'
                : 'hover:border-gray-600'
            }`}
            onClick={() => handleFormatSelect(format.id)}
            role="button"
            tabIndex={0}
            aria-pressed={selectedFormat === format.id}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleFormatSelect(format.id);
              }
            }}
          >
            <h4 className="font-medium">{format.name}</h4>
            <p className="text-sm text-gray-400 mt-1">{format.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Podcast Configuration</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Number of Hosts
            </label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <option value="1">1 Host</option>
              <option value="2" selected>2 Hosts</option>
              <option value="3">3 Hosts</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Podcast Duration
            </label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <option value="5">5 minutes</option>
              <option value="10" selected>10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="20">20 minutes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Voice Style
            </label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <option value="professional" selected>Professional</option>
              <option value="casual">Casual</option>
              <option value="energetic">Energetic</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Focus Area
            </label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <option value="general" selected>General Lead Insights</option>
              <option value="conversion">Conversion Strategies</option>
              <option value="sources">Lead Sources Analysis</option>
              <option value="nurturing">Lead Nurturing Tips</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-3 bg-accent-blue text-white rounded-lg"
            aria-label="Generate podcast script"
            tabIndex={0}
          >
            Generate Podcast Script
          </button>
        </div>
      </div>
    </div>
  );
};

export default PodcastScriptGenerator; 