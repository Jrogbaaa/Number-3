'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmergencyResetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleReset = async () => {
    if (!window.confirm('⚠️ EMERGENCY RESET: This will completely delete all leads from your database. This action cannot be undone. Continue?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setResult(null);
      
      const response = await fetch('/api/reset-leads');
      const data = await response.json();
      
      setResult(data);
      
      if (data.success) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Error resetting leads:', error);
      setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="bg-red-900/20 p-8 rounded-lg border-2 border-red-500">
        <h1 className="text-3xl font-bold mb-4 text-white">Emergency Database Reset</h1>
        
        <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 mb-6">
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">⚠️ Warning</h2>
          <p className="text-yellow-100 mb-2">
            This page provides an emergency solution to completely clear all leads from your database.
          </p>
          <p className="text-yellow-100">
            This action cannot be undone. Make sure you have backups if needed.
          </p>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-md font-medium flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Processing...
                </>
              ) : (
                '🔥 Execute Emergency Reset'
              )}
            </button>
            
            <button
              onClick={() => router.push('/data-input')}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Go to Data Upload
            </button>
          </div>
          
          {result && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
              <h3 className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? 'Success' : 'Error'}
              </h3>
              <p className="text-gray-300 mt-2">
                {result.success 
                  ? `${result.message} (Remaining leads: ${result.remainingLeads})` 
                  : `Failed: ${result.error || 'Unknown error'}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 