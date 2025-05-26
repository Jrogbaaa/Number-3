'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function FixAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [fixing, setFixing] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const addResult = (result: any) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const fixOnboarding = async () => {
    setFixing(true);
    try {
      const response = await fetch('/api/fix-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      addResult({
        action: 'Fix Onboarding',
        success: data.success,
        message: data.message || data.error,
        data: data.data
      });
      
      if (data.success) {
        // Refresh the page to update the user preferences
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      addResult({
        action: 'Fix Onboarding',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setFixing(false);
    }
  };

  const transferLeads = async () => {
    setTransferring(true);
    try {
      const response = await fetch('/api/transfer-leads-back', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      addResult({
        action: 'Transfer Leads',
        success: data.success,
        message: data.message || data.error,
        transferred: data.transferred
      });
    } catch (error) {
      addResult({
        action: 'Transfer Leads',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTransferring(false);
    }
  };

  const fixBoth = async () => {
    await fixOnboarding();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await transferLeads();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-navy flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-dark-navy flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Please Sign In</h1>
          <p className="text-gray-300 mb-6">You need to be signed in to fix your account.</p>
          <a 
            href="/api/auth/signin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-navy p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Fix Account Issues</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Current Status</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>User ID:</strong> {session?.user?.id}</p>
            <p><strong>Email:</strong> {session?.user?.email}</p>
            <p><strong>Name:</strong> {session?.user?.name}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Issues to Fix</h2>
          <div className="space-y-4">
            <div className="border border-gray-700 rounded p-4">
              <h3 className="font-medium text-white mb-2">1. Onboarding Status</h3>
              <p className="text-gray-300 text-sm mb-3">
                Your onboarding completion status was lost when you cleared browser data.
                This needs to be set to "completed" in the database.
              </p>
              <button
                onClick={fixOnboarding}
                disabled={fixing}
                className={`px-4 py-2 rounded text-white ${
                  fixing 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {fixing ? 'Fixing...' : 'Fix Onboarding Status'}
              </button>
            </div>

            <div className="border border-gray-700 rounded p-4">
              <h3 className="font-medium text-white mb-2">2. Lead Transfer</h3>
              <p className="text-gray-300 text-sm mb-3">
                Your 426 leads are currently associated with the incognito account.
                This will transfer them back to your current account.
              </p>
              <button
                onClick={transferLeads}
                disabled={transferring}
                className={`px-4 py-2 rounded text-white ${
                  transferring 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                {transferring ? 'Transferring...' : 'Transfer Leads Back'}
              </button>
            </div>

            <div className="border border-gray-700 rounded p-4 bg-blue-900/20">
              <h3 className="font-medium text-white mb-2">Fix Both Issues</h3>
              <p className="text-gray-300 text-sm mb-3">
                Run both fixes in sequence for a complete solution.
              </p>
              <button
                onClick={fixBoth}
                disabled={fixing || transferring}
                className={`px-6 py-3 rounded text-white font-medium ${
                  (fixing || transferring)
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-500'
                }`}
              >
                {(fixing || transferring) ? 'Processing...' : 'Fix Everything'}
              </button>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`border rounded p-3 ${
                    result.success 
                      ? 'border-green-600 bg-green-900/20' 
                      : 'border-red-600 bg-red-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium ${
                        result.success ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {result.action} - {result.success ? 'Success' : 'Failed'}
                      </h3>
                      <p className="text-gray-300 text-sm mt-1">{result.message}</p>
                      {result.transferred && (
                        <p className="text-gray-400 text-xs mt-1">
                          Transferred: {result.transferred} leads
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{result.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 