import React from 'react';
import { Mic, Video } from 'lucide-react';

const HeygenTools = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-blue-800/50">
            <Mic className="w-10 h-10 text-blue-300" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2">AI Podcast Creation</h3>
        <p className="text-blue-200 mb-6">
          Create professional AI-powered podcasts with natural-sounding
          conversations between multiple hosts
        </p>
        <div className="text-sm text-blue-200 mt-auto">
          labs.heygen.com/video-podcast
        </div>
      </div>

      <div className="flex flex-col bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-purple-800/50">
            <Video className="w-10 h-10 text-purple-300" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2">Heygen Studio</h3>
        <p className="text-purple-200 mb-6">
          Create personalized videos with AI avatars using scripts generated from
          your lead data
        </p>
        <div className="text-sm text-purple-200 mt-auto">
          heygen.com/studio
        </div>
      </div>
    </div>
  );
};

export default HeygenTools; 