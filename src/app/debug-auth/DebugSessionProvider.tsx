"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";

export default function DebugSessionProvider({ 
  children 
}: { 
  children: ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Catch and log any errors related to session initialization
    const handleError = (error: ErrorEvent) => {
      console.error("Debug page error:", error);
      setError(error.message || "Error initializing session");
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="font-bold text-red-700">Session Provider Error</h2>
        <p className="text-red-600 mt-2">{error}</p>
        <div className="mt-4">
          <a 
            href="/signin" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block mr-3"
          >
            Go to Sign In
          </a>
          <a 
            href="/" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 inline-block"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Wrap with a try/catch to handle possible initialization errors
  try {
    return (
      <SessionProvider refetchInterval={0}>
        {children}
      </SessionProvider>
    );
  } catch (err) {
    console.error("Failed to initialize SessionProvider:", err);
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="font-bold text-red-700">Session Provider Initialization Error</h2>
        <p className="text-red-600 mt-2">
          There was an error initializing the authentication session provider.
          This might be due to missing configuration or environment variables.
        </p>
        <div className="mt-4">
          <a 
            href="/signin" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block mr-3"
          >
            Go to Sign In
          </a>
          <a 
            href="/" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 inline-block"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }
} 