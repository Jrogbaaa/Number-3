import React from 'react';
import { Mic, Video, FileText, ExternalLink } from 'lucide-react';
import PodcastScriptGenerator from './PodcastScriptGenerator';

const CreateMediaFeatures = () => {
  return (
    <div className="space-y-8">
      {/* Header Grid with Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Create Podcast Feature */}
        <div className="group">
          <a 
            href="https://labs.heygen.com/video-podcast"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-xl p-6 text-left hover:border-blue-500 hover:from-blue-900/40 hover:to-blue-800/30 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            aria-label="Create AI Podcast on Heygen Labs"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-blue-600/30 border border-blue-500/30">
                <Mic className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Create Podcast</h3>
                <div className="flex items-center gap-1 text-blue-400 text-sm">
                  <span>Launch Heygen Podcast Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4 flex-grow leading-relaxed">
              Generate professional AI-powered podcasts with natural conversations between multiple hosts. Perfect for content marketing and thought leadership.
            </p>
            
            <div className="mt-auto">
              <div className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                <span>labs.heygen.com/video-podcast</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </a>
        </div>

        {/* Create Video Feature */}
        <div className="group">
          <a 
            href="https://app.heygen.com/home"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-xl p-6 text-left hover:border-purple-500 hover:from-purple-900/40 hover:to-purple-800/30 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            aria-label="Go to Heygen Studio"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-purple-600/30 border border-purple-500/30">
                <Video className="w-7 h-7 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Create Video</h3>
                <div className="flex items-center gap-1 text-purple-400 text-sm">
                  <span>Launch Heygen Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4 flex-grow leading-relaxed">
              Create personalized videos with AI avatars using custom scripts. Ideal for sales outreach, training content, and personalized messaging.
            </p>
            
            <div className="mt-auto">
              <div className="inline-flex items-center gap-2 text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                <span>app.heygen.com/home</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </a>
        </div>

        {/* Create Script Feature */}
        <div className="flex flex-col bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-green-600/30 border border-green-500/30">
              <FileText className="w-7 h-7 text-green-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Create Script</h3>
              <div className="text-green-400 text-sm">
                Built-in Script Generator
              </div>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4 flex-grow leading-relaxed">
            Generate custom podcast scripts with AI. Configure format, hosts, duration, and voice style to create engaging content tailored to your audience.
          </p>
          
          <div className="mt-auto">
            <div className="text-green-400 font-medium">
              ↓ Available below
            </div>
          </div>
        </div>
      </div>

      {/* Script Generator Section */}
      <div className="bg-[#1A1F2B] border border-gray-700 rounded-xl p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Podcast Script Generator</h2>
          <p className="text-gray-400">
            Create professional podcast scripts with customizable formats, host configurations, and content focus areas.
          </p>
        </div>
        <PodcastScriptGenerator />
      </div>
    </div>
  );
};

export default CreateMediaFeatures; 