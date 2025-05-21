'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BasicDebugPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState<any>({});

  useEffect(() => {
    // Basic environment check
    if (typeof window !== 'undefined') {
      setEnvInfo({
        userAgent: navigator.userAgent,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        isVercel: window.location.hostname.includes('vercel.app'),
        isLocal: window.location.hostname === 'localhost',
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSessionStorage: typeof sessionStorage !== 'undefined',
        cookiesEnabled: navigator.cookieEnabled,
      });
    }
    
    async function checkApiStatus() {
      try {
        setLoading(true);
        const response = await fetch('/api/auth-status');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch status: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setAuthStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Debug API error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    checkApiStatus();
  }, []);

  return (
    <div className="min-h-screen bg-dark-navy text-gray-200 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Basic Debug Page</h1>
          <p className="text-gray-400">
            This page uses direct API calls without useSession to check system status
          </p>
        </div>
        
        {loading && (
          <div className="flex items-center justify-center p-8 bg-gray-800 rounded-lg mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading system status...</span>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg mb-6 text-red-200">
            <h2 className="font-bold">API Error</h2>
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-5">
            <h2 className="text-xl font-bold mb-4 text-white">Environment</h2>
            {Object.entries(envInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">{key}</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
          
          {authStatus && (
            <div className="bg-gray-800 rounded-lg p-5">
              <h2 className="text-xl font-bold mb-4 text-white">API Status Check</h2>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${authStatus.authenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>
                    {authStatus.authenticated ? 'Authenticated' : 'Not Authenticated'}
                  </span>
                </div>
                
                {authStatus.userId && (
                  <p className="text-sm text-gray-400">User ID: {authStatus.userId}</p>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-blue-400 mb-2">Supabase</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    authStatus.supabase.connectionStatus === 'connected' 
                      ? 'bg-green-500' 
                      : authStatus.supabase.connectionStatus === 'error'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}></div>
                  <span>
                    {authStatus.supabase.connectionStatus.toUpperCase()}
                  </span>
                </div>
                
                {authStatus.supabase.error && (
                  <div className="mt-2 p-2 bg-red-900/30 text-red-300 text-sm rounded">
                    {authStatus.supabase.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex flex-wrap gap-4">
          <Link 
            href="/signin" 
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded"
          >
            Sign In Page
          </Link>
          <Link 
            href="/debug-auth" 
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded"
          >
            Try Advanced Debug
          </Link>
          <Link 
            href="/dashboard" 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Dashboard
          </Link>
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
} 