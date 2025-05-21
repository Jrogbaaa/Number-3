'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Upload, X, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const router = useRouter();
  
  const handleGoToUpload = () => {
    router.push('/data-input');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg mx-4 animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Welcome to PROPS</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close welcome message"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-center h-28 w-28 rounded-full bg-blue-600/20 mx-auto mb-6">
            <Database className="h-14 w-14 text-blue-400" />
          </div>
          <p className="text-gray-300 text-center mb-4">
            Get started by uploading your leads to take advantage of PROPS' powerful lead scoring and outreach system.
          </p>
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 text-sm text-gray-300">
            <p className="font-medium text-blue-400 mb-1">Quick Start Guide:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Upload your leads CSV file</li>
              <li>Let PROPS analyze and score your leads</li>
              <li>Prioritize outreach based on lead quality</li>
              <li>Use personalized templates for effective communication</li>
            </ol>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            aria-label="Explore dashboard first"
            tabIndex={0}
          >
            <ArrowRight className="h-4 w-4" />
            Explore Dashboard
          </button>
          <button
            onClick={handleGoToUpload}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            aria-label="Upload leads now"
            tabIndex={0}
          >
            <Upload className="h-4 w-4" />
            Upload Leads Now
          </button>
        </div>
      </div>
    </div>
  );
} 