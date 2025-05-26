'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [envCheck, setEnvCheck] = useState<Record<string, boolean>>({});
  const [isEnvironmentReady, setIsEnvironmentReady] = useState<boolean | null>(null);

  // Check environment variables and auth status
  useEffect(() => {
    const authDebugInfo = `Auth Status: ${status}, Session: ${session ? 'exists' : 'null'}`;
    console.log('[SignIn] Debug:', authDebugInfo);
    setDebugInfo(authDebugInfo);
    
    // If somehow the user is already authenticated when landing on this page,
    // redirect them to dashboard (this should be handled by middleware but adding as failsafe)
    if (status === 'authenticated' && session?.user?.id) {
      console.log('[SignIn] User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
    
    // Check if there was an error in the URL (from auth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      // Log the error but don't show it prominently unless it's a critical configuration issue
      console.log('[SignIn] Auth callback error:', error);
      
      // Only show critical configuration errors to the user
      // OAuth flow errors (like temporary failures or user cancellation) should not be prominently displayed
      const criticalErrors = ['Configuration'];
      
      if (criticalErrors.includes(error)) {
        const errorMessages: Record<string, string> = {
          'Configuration': 'There is a configuration issue with the authentication service.',
        };
        setAuthError(errorMessages[error]);
      } else {
        // For other errors (OAuth flow errors), just log them but don't show prominent UI error
        console.log('[SignIn] OAuth flow error (not showing to user):', error);
        
        // Clear the URL parameters to clean up the URL after handling the error
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }

    // Check environment variables to see if OAuth is properly configured
    fetch('/api/debug-env')
      .then(res => res.json())
      .then(data => {
        setEnvCheck(data);
        const isGoogleConfigured = data.GOOGLE_CLIENT_ID && data.GOOGLE_CLIENT_SECRET;
        setIsEnvironmentReady(isGoogleConfigured);
        
        if (!isGoogleConfigured) {
          console.log('[SignIn] Google OAuth credentials are not configured');
          setAuthError('Google authentication is not configured. Please set up OAuth credentials.');
        }
      })
      .catch(err => {
        console.log('[SignIn] Failed to check environment:', err);
        setAuthError('Failed to verify authentication configuration.');
        setIsEnvironmentReady(false);
      });
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    try {
      if (!envCheck.GOOGLE_CLIENT_ID || !envCheck.GOOGLE_CLIENT_SECRET) {
        setAuthError('Google OAuth credentials are not configured. Authentication cannot proceed.');
        return;
      }
      
      setIsLoading(true);
      setAuthError(null);
      console.log('[SignIn] Initiating Google sign-in...');
      
      // Use NextAuth's signIn function with redirect: false to handle errors properly
      // instead of direct window.location redirect
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false
      });
      
      if (result?.error) {
        console.log('[SignIn] Sign-in error:', result.error);
        // Only show critical errors, not OAuth flow errors
        if (result.error === 'Configuration') {
          setAuthError('Authentication configuration error. Please contact support.');
        } else {
          console.log('[SignIn] OAuth flow error (not showing to user):', result.error);
        }
        setIsLoading(false);
      } else if (result?.url) {
        // If successful, redirect to the URL returned by NextAuth
        router.push(result.url);
      }
    } catch (error) {
      console.log('[SignIn] Exception during sign-in with Google:', error);
      setAuthError('Failed to start sign-in process. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-navy p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-navy p-8 shadow-lg text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to OptiLeads</h2>
          <p className="text-gray-400">Sign in to access your leads dashboard</p>
          
          {/* Only show critical configuration errors */}
          {authError && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800/50 rounded text-red-300 text-sm">
              {authError}
              {(!envCheck.GOOGLE_CLIENT_ID || !envCheck.GOOGLE_CLIENT_SECRET) && (
                <div className="mt-2 pt-2 border-t border-red-800/30 text-xs text-left">
                  <p className="font-medium mb-1">Missing environment variables:</p>
                  <ul className="list-disc list-inside">
                    {!envCheck.GOOGLE_CLIENT_ID && <li>GOOGLE_CLIENT_ID</li>}
                    {!envCheck.GOOGLE_CLIENT_SECRET && <li>GOOGLE_CLIENT_SECRET</li>}
                  </ul>
                  <p className="mt-1 mb-1">Set these in your .env.local file and restart the server.</p>
                  <p className="text-xs">
                    <Link href="/debug-auth" className="text-blue-400 hover:underline">
                      Go to Debug Page →
                    </Link>
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Debug info - only visible in development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 p-2 bg-gray-800 rounded text-xs text-left text-gray-400">
              <p>Auth Debug: {debugInfo}</p>
              <p>Has Session: {session ? 'Yes' : 'No'}</p>
              {session?.user?.id && <p>User ID: {session.user.id}</p>}
              <p>Environment Ready: {isEnvironmentReady === null ? 'Checking...' : isEnvironmentReady ? 'Yes' : 'No'}</p>
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="font-medium">Google Auth Direct Link:</p>
                <a 
                  href="/api/auth/signin/google?callbackUrl=/dashboard" 
                  className="text-blue-400 hover:underline"
                >
                  /api/auth/signin/google
                </a>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="font-medium">Alternative Sign-in Methods:</p>
                <button 
                  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  className="text-blue-400 hover:underline block mb-1"
                >
                  Use signIn() with redirect
                </button>
                <button 
                  onClick={() => signIn('google', { callbackUrl: '/dashboard', redirect: false })}
                  className="text-blue-400 hover:underline block"
                >
                  Use signIn() without redirect
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading || isEnvironmentReady === false}
          className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-3 text-gray-800 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Sign in with Google"
          tabIndex={0}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-800"></div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.7272727 L18.4363636,14.7272727 C18.1187732,16.6574066 17.2662994,18.0125889 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
        
        {isEnvironmentReady === false && (
          <div className="mt-4">
            <Link
              href="/debug-auth"
              className="text-sm text-blue-400 hover:underline"
            >
              Go to Auth Debug Page
            </Link>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
} 