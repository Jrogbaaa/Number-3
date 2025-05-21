'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function DebugAuthPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [isVercel, setIsVercel] = useState(false);
  
  // Get session safely
  const session = useSession?.() || { data: null, status: 'loading' };
  const sessionStatus = session?.status || 'loading';
  const sessionData = session?.data || null;

  useEffect(() => {
    // Check if running on Vercel
    setIsVercel(window.location.hostname.includes('vercel.app'));
    
    async function checkAuthStatus() {
      try {
        setLoading(true);
        const response = await fetch('/api/auth-status');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch auth status: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setAuthStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Auth debug error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuthStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6">
          <h1 className="text-2xl font-bold text-white">Authentication Debug Page</h1>
          <p className="text-blue-100 mt-2">
            Use this page to diagnose authentication issues
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-100 rounded-md">
            <h2 className="font-medium text-gray-800 mb-2">NextAuth Session Status</h2>
            <p>Status: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{sessionStatus}</span></p>
            {sessionData && (
              <pre className="mt-2 bg-gray-200 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            )}
          </div>
          
          {loading && (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading authentication status...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <h2 className="font-bold">Error</h2>
              <p>{error}</p>
            </div>
          )}
          
          {authStatus && (
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h2 className="font-medium text-gray-700">Authentication Status</h2>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${authStatus.authenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">
                      {authStatus.authenticated ? 'Authenticated' : 'Not Authenticated'}
                    </span>
                  </div>
                  
                  {authStatus.userId && (
                    <p className="text-sm text-gray-600">User ID: {authStatus.userId}</p>
                  )}
                  
                  {authStatus.userEmail && (
                    <p className="text-sm text-gray-600">Email: {authStatus.userEmail}</p>
                  )}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h2 className="font-medium text-gray-700">Supabase Connection</h2>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      authStatus.supabase.connectionStatus === 'connected' 
                        ? 'bg-green-500' 
                        : authStatus.supabase.connectionStatus === 'error'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                    }`}></div>
                    <span className="font-medium">
                      {authStatus.supabase.connectionStatus === 'connected' 
                        ? 'Connected' 
                        : authStatus.supabase.connectionStatus === 'error'
                          ? 'Error'
                          : 'Unknown Status'}
                    </span>
                  </div>
                  
                  {authStatus.supabase.error && (
                    <div className="mt-2 p-3 bg-red-50 text-red-700 text-sm rounded">
                      <strong>Error:</strong> {authStatus.supabase.error}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h2 className="font-medium text-gray-700">Environment Settings</h2>
                </div>
                <div className="p-4 text-sm">
                  <table className="min-w-full">
                    <tbody>
                      {Object.entries(authStatus.environment).map(([key, value]: [string, any]) => (
                        <tr key={key} className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-medium text-gray-700">{key}</td>
                          <td className="py-2">
                            {typeof value === 'boolean' 
                              ? (value ? '✅ Set' : '❌ Not Set') 
                              : value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-4">
                <Link 
                  href="/signin" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Go to Sign In
                </Link>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Go to Dashboard
                </Link>
              </div>
              
              {isVercel && (
                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
                  <h3 className="font-medium">Vercel Deployment Detected</h3>
                  <p className="mt-1 text-sm">
                    Make sure all required environment variables are properly set in your Vercel project settings.
                    You can verify this in the Vercel dashboard under Project Settings → Environment Variables.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 