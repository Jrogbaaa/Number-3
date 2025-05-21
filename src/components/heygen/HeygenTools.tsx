import React from 'react';
import { Mic, Video } from 'lucide-react';

const HeygenTools = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* AI Podcast Creation Link Card */}
      <a 
        href="https://labs.heygen.com/video-podcast"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col bg-gray-800/70 border border-gray-700 rounded-lg p-6 text-left hover:border-blue-600/70 hover:bg-gray-800 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
        aria-label="Create AI Podcast on Heygen Labs"
      >
        {/* Icon and Title Section */}
        <div className="flex items-center gap-4 mb-4">
          {/* Icon Background */}
          <div className="p-3 rounded-full bg-blue-600/20 flex-shrink-0">
            <Mic className="w-6 h-6 text-blue-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">AI Podcast Creation</h3>
        </div>
        
        {/* Description */}
        <p className="text-gray-300 text-sm mb-5 flex-grow">
          Create professional AI-powered podcasts with natural-sounding
          conversations between multiple hosts
        </p>
        
        {/* Link Text */}
        <div className="text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
          labs.heygen.com/video-podcast
        </div>
      </a>

      {/* Heygen Studio Link Card */}
      <a 
        href="https://app.heygen.com/home"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col bg-gray-800/70 border border-gray-700 rounded-lg p-6 text-left hover:border-purple-600/70 hover:bg-gray-800 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
        aria-label="Go to Heygen Studio"
      >
        {/* Icon and Title Section */}
        <div className="flex items-center gap-4 mb-4">
          {/* Icon Background */}
          <div className="p-3 rounded-full bg-purple-600/20 flex-shrink-0">
            <Video className="w-6 h-6 text-purple-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">Heygen Studio</h3>
        </div>
        
        {/* Description */}
        <p className="text-gray-300 text-sm mb-5 flex-grow">
          Create personalized videos with AI avatars using scripts generated from
          your lead data
        </p>
        
        {/* Link Text */}
        <div className="text-xs text-purple-400 group-hover:text-purple-300 transition-colors">
          heygen.com/studio
        </div>
      </a>
    </div>
  );
};

export default HeygenTools; 