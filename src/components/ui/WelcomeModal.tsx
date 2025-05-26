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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-gray-700/50 rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 animate-in fade-in-0 slide-in-from-bottom-5 duration-300 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Welcome to <span className="text-white">Opti<span className="text-blue-400">Leads</span><span className="text-white opacity-80">.</span><span className="text-indigo-300">ai</span></span></h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-200 p-2 rounded-lg hover:bg-gray-700/50"
            aria-label="Close welcome message"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-center h-28 w-28 rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/20 mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <Database className="h-14 w-14 text-blue-400" />
          </div>
          <p className="text-gray-300 text-center mb-4">
            Get started by uploading your leads to take advantage of OptiLeads' powerful lead scoring and outreach system.
          </p>
          <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/10 border border-blue-700/30 rounded-xl p-5 text-sm text-gray-300 backdrop-blur-sm">
            <p className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Quick Start Guide:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Upload your leads CSV file</li>
              <li>Let OptiLeads analyze and score your leads</li>
              <li>Prioritize outreach based on lead quality</li>
              <li>Use personalized templates for effective communication</li>
            </ol>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
            aria-label="Explore dashboard first"
            tabIndex={0}
          >
            <ArrowRight className="h-4 w-4" />
            Explore Dashboard
          </button>
          <button
            onClick={handleGoToUpload}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
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