'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const [envCheck, setEnvCheck] = useState<Record<string, boolean>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [authEvents, setAuthEvents] = useState<string[]>([]);

  // Check environment variables (without showing actual values)
  useEffect(() => {
    // Log auth debug events
    const logAuthEvent = (event: string) => {
      setAuthEvents(prev => [
        `[${new Date().toLocaleTimeString()}] ${event}`, 
        ...prev.slice(0, 9)
      ]);
    };

    // Check URL for error parameters
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      const errorMessage = `Auth error detected: ${errorParam}`;
      setAuthError(errorMessage);
      logAuthEvent(errorMessage);
    }

    // Log authentication status change
    logAuthEvent(`Auth status changed to: ${status}`);
    if (status === 'authenticated') {
      logAuthEvent(`Authenticated as: ${session?.user?.email || 'unknown'}`);
    }
    
    // We can't directly access process.env on the client,
    // but we can check if public variables exist
    const clientEnvCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    };
    
    setEnvCheck(clientEnvCheck);
    
    // Check server-side env vars via API
    fetch('/api/debug-env')
      .then(res => res.json())
      .then(data => {
        setEnvCheck(prev => ({...prev, ...data}));
        logAuthEvent(`Environment variables loaded: ${Object.keys(data).filter(k => data[k]).length}/${Object.keys(data).length} are set`);
      })
      .catch(err => {
        console.error('Failed to check server environment variables:', err);
        logAuthEvent(`Failed to check server environment variables: ${err.message}`);
      });
  }, [status, session]);
  
  // Trigger direct Google sign-in
  const handleDirectSignIn = () => {
    window.location.href = "/api/auth/signin/google?callbackUrl=/dashboard";
  };

  // Trigger sign-in through NextAuth's signIn function
  const handleNextAuthSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };
  
  return (
    <div className="min-h-screen bg-dark-navy p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-navy p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-6">NextAuth Debug Page</h1>
          
          {/* Auth error notification */}
          {authError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded">
              <h2 className="text-lg font-semibold text-red-400 mb-2">Authentication Error Detected</h2>
              <p className="text-red-300">{authError}</p>
            </div>
          )}
          
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-blue-400 mb-3">Session Status</h2>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-300">Current status: <span className={`font-semibold ${status === 'authenticated' ? 'text-green-400' : status === 'loading' ? 'text-yellow-400' : 'text-red-400'}`}>{status}</span></p>
                {session && (
                  <div className="mt-2">
                    <p className="text-gray-300">User: {session.user?.name || 'Unknown'}</p>
                    <p className="text-gray-300">Email: {session.user?.email || 'No email'}</p>
                    <p className="text-gray-300">ID: {session.user?.id || 'No ID'}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-blue-400 mb-3">Environment Variables Check</h2>
              <div className="bg-gray-800 p-4 rounded">
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-300">GOOGLE_CLIENT_ID:</span>
                    <span className={envCheck.GOOGLE_CLIENT_ID ? 'text-green-400' : 'text-red-400'}>
                      {envCheck.GOOGLE_CLIENT_ID ? 'Available' : 'Missing'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-300">GOOGLE_CLIENT_SECRET:</span>
                    <span className={envCheck.GOOGLE_CLIENT_SECRET ? 'text-green-400' : 'text-red-400'}>
                      {envCheck.GOOGLE_CLIENT_SECRET ? 'Available' : 'Missing'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-300">NEXTAUTH_SECRET:</span>
                    <span className={envCheck.NEXTAUTH_SECRET ? 'text-green-400' : 'text-red-400'}>
                      {envCheck.NEXTAUTH_SECRET ? 'Available' : 'Missing'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-300">NEXTAUTH_URL:</span>
                    <span className={envCheck.NEXTAUTH_URL ? 'text-green-400' : 'text-red-400'}>
                      {envCheck.NEXTAUTH_URL ? 'Available' : 'Missing'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-300">NEXT_PUBLIC_SUPABASE_URL:</span>
                    <span className={envCheck.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-400' : 'text-red-400'}>
                      {envCheck.NEXT_PUBLIC_SUPABASE_URL ? 'Available' : 'Missing'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-300">SUPABASE_SERVICE_ROLE_KEY:</span>
                    <span className={envCheck.SUPABASE_SERVICE_ROLE_KEY ? 'text-green-400' : 'text-red-400'}>
                      {envCheck.SUPABASE_SERVICE_ROLE_KEY ? 'Available' : 'Missing'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-blue-400 mb-3">Authentication Actions</h2>
              <div className="bg-gray-800 p-4 rounded space-y-4">
                <div>
                  <h3 className="text-lg text-gray-300 mb-2">Sign In Options</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={handleDirectSignIn}
                      className="flex items-center justify-center gap-2 bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition w-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                        <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                        <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                        <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.7272727 L18.4363636,14.7272727 C18.1187732,16.6574066 17.2662994,18.0125889 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                        <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                      </svg>
                      URL Redirect (Direct)
                    </button>
                    
                    <button 
                      onClick={handleNextAuthSignIn}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                        <path fill="#fff" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                        <path fill="#fff" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                        <path fill="#fff" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.7272727 L18.4363636,14.7272727 C18.1187732,16.6574066 17.2662994,18.0125889 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                        <path fill="#fff" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                      </svg>
                      NextAuth.js signIn()
                    </button>
                    
                    <Link
                      href="/signin"
                      className="flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                    >
                      Go to Sign In Page
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-blue-400 mb-3">Auth Debug Events</h2>
              <div className="bg-gray-800 p-4 rounded">
                <ul className="space-y-1 text-xs text-gray-400 font-mono">
                  {authEvents.length > 0 ? (
                    authEvents.map((event, i) => (
                      <li key={i} className="border-b border-gray-700 pb-1 last:border-0 last:pb-0">
                        {event}
                      </li>
                    ))
                  ) : (
                    <li>No auth events logged yet...</li>
                  )}
                </ul>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-blue-400 mb-3">Fix Auth Issues</h2>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-300 mb-3">Run this command to diagnose and fix auth issues:</p>
                <pre className="bg-gray-900 p-2 rounded text-green-400 text-sm overflow-x-auto">
                  node src/scripts/fix-auth.js
                </pre>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-blue-400 mb-3">Navigation</h2>
              <div className="bg-gray-800 p-4 rounded space-y-2">
                <Link
                  href="/"
                  className="block bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 text-white"
                >
                  Home Page
                </Link>
                <Link
                  href="/dashboard"
                  className="block bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 text-white"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 