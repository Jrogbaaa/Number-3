'use client';

import { useState } from 'react';
import { Mic, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const handleGenerateScript = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGeneratedScript(null); // Clear previous script

    // Simulate fetching lead data and calling AI API
    console.log('Simulating script generation for format:', selectedFormat);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    let script = '';
    switch (selectedFormat) {
      case 'interview':
        script = `**Podcast Script: Interview Style**\n\n**Host:** Welcome! Today we're diving into recent lead data insights with our expert.\n**Expert:** Glad to be here. We've seen a significant trend in...\n**Host:** Fascinating! How does that translate to actionable strategies?\n**Expert:** Well, based on the data showing [Specific Lead Insight], we recommend focusing on...`;
        break;
      case 'discussion':
        script = `**Podcast Script: Discussion Format**\n\n**Host 1:** Welcome back! Let's discuss the latest lead generation performance.\n**Host 2:** Absolutely. I noticed a spike in conversions from [Source] after implementing [Strategy].\n**Host 1:** Interesting. My data shows something similar, but with a focus on [Different Aspect]. Perhaps we can combine these?\n**Host 2:** That's a great idea. We could try...`;
        break;
      case 'debate':
        script = `**Podcast Script: Debate Format**\n\n**Moderator:** Today's topic: Is [Approach A] or [Approach B] more effective for our current lead goals?\n**Host A (Pro-A):** The data clearly supports [Approach A]. We've seen a [Metric]% increase in qualified leads by...\n**Host B (Pro-B):** While [Approach A] has merits, [Approach B] offers better long-term scalability and targets a crucial demographic, as evidenced by...\n**Moderator:** Strong points from both sides. Let's delve deeper into the cost implications...`;
        break;
      default:
        script = 'Error: Invalid format selected.';
    }

    setGeneratedScript(script);
    setIsGenerating(false);
  };

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
            href="https://app.heygen.com/home"
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
              className={`p-6 rounded-lg text-left ${selectedFormat === format.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300'}
              }`}
            >
              <h4 className="font-medium mb-2">{format.name}</h4>
              <p className="text-sm opacity-80">{format.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleGenerateScript} 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Podcast Script"}
          </Button>
        </div>

        {/* Display Generated Script */}
        {generatedScript && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Generated Script:</h3>
            <pre className="text-gray-300 whitespace-pre-wrap text-sm font-sans">
              {generatedScript}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}