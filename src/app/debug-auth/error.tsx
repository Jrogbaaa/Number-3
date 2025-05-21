'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console
    console.error('Debug page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Error</h1>
      
      <div className="bg-red-900/30 border border-red-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Error Loading Debug Page</h2>
        <p className="mb-4">
          There was an error loading the debug page. This is likely related to authentication issues.
        </p>
        
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <p className="font-mono text-sm overflow-auto">{error.message}</p>
          {error.digest && (
            <p className="font-mono text-xs text-gray-400 mt-2">Digest: {error.digest}</p>
          )}
        </div>
        
        <button
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
      
      <div className="mt-6">
        <a 
          href="/signin" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mr-4"
        >
          Go to Sign In
        </a>
        <a 
          href="/" 
          className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
} 