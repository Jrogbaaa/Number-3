'use client';

import { useState } from 'react';
import { Mic, Video } from 'lucide-react';

const PODCAST_FORMATS = [
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

export default function HeygenIntegrationPage() {
  const [selectedFormat, setSelectedFormat] = useState('discussion');

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-6">Heygen Integration</h1>
        
        <div className="grid grid-cols-2 gap-6">
          <a
            href="https://labs.heygen.com/video-podcast"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-8 rounded-lg bg-blue-900/20 hover:bg-blue-900/30 transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <Mic className="w-8 h-8 text-blue-400" />
              <h2 className="text-xl font-medium">AI Podcast Creation</h2>
            </div>
            <p className="text-gray-300">
              Create professional AI-powered podcasts with natural-sounding
              conversations between multiple hosts
            </p>
            <div className="mt-4 text-blue-400 text-sm">
              labs.heygen.com/video-podcast
            </div>
          </a>

          <a
            href="https://heygen.com/studio"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-8 rounded-lg bg-purple-900/20 hover:bg-purple-900/30 transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <Video className="w-8 h-8 text-purple-400" />
              <h2 className="text-xl font-medium">Heygen Studio</h2>
            </div>
            <p className="text-gray-300">
              Create personalized videos with AI avatars using scripts generated
              from your lead data
            </p>
            <div className="mt-4 text-purple-400 text-sm">
              heygen.com/studio
            </div>
          </a>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-6">Podcast Script Generator</h2>
        <h3 className="text-lg mb-4">Select Podcast Format</h3>
        <div className="grid grid-cols-3 gap-4">
          {PODCAST_FORMATS.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-6 rounded-lg text-left ${
                selectedFormat === format.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              <h4 className="font-medium mb-2">{format.name}</h4>
              <p className="text-sm opacity-80">{format.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 