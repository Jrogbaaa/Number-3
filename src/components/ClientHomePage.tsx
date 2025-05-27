'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ClientHomePageProps {
  children: React.ReactNode;
}

// Separate component for search params logic
function SearchParamsHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const isLandingPage = searchParams.get('landing') === 'true';

  // Check authentication status on page load
  useEffect(() => {
    if (status === 'authenticated' && session && !isLandingPage) {
      console.log('[Home] User is authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [status, session, isLandingPage, router]);

  const handleGetStarted = () => {
    try {
      setIsLoading(true);
      if (status === 'authenticated') {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.log('[Home] Error navigating:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-40">
      {/* Hero Section Interactive Elements */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 disabled:opacity-70 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                <>
                  Get Started for Free
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            
            <a 
              href="#features" 
              className="text-lg font-semibold text-white hover:text-blue-300 transition-colors flex items-center gap-2"
            >
              Learn more 
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA Section Interactive Elements */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-10 py-4 rounded-lg text-xl font-semibold transition-all duration-300 disabled:opacity-70 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
            ) : (
              'Start Your Free Trial'
            )}
          </button>
        </div>
      </section>

      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-4 right-4 p-2 bg-gray-800/90 rounded-md text-xs text-gray-300 max-w-48 z-50">
          <h3 className="font-medium text-amber-400 mb-1 text-xs">Debug</h3>
          <p className="text-xs">Auth: {status}</p>
          <p className="text-xs">Session: {session ? 'Yes' : 'No'}</p>
          <p className="text-xs">Landing: {isLandingPage ? 'Yes' : 'No'}</p>
          
          <div className="mt-1 pt-1 border-t border-gray-700/50">
            <div className="space-y-1">
              <Link 
                href="/signin" 
                className="block text-xs text-blue-300 hover:underline"
              >
                Sign In
              </Link>
              <Link 
                href="/dashboard" 
                className="block text-xs text-blue-300 hover:underline"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientHomePage({ children }: ClientHomePageProps) {
  return (
    <>
      {children}
      
      {/* Client-side interactive elements wrapped in Suspense */}
      <Suspense fallback={
        <div className="relative z-40">
          {/* Fallback content while loading */}
          <section className="py-32 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 shadow-lg opacity-70">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  Loading...
                </div>
              </div>
            </div>
          </section>
        </div>
      }>
        <SearchParamsHandler />
      </Suspense>
    </>
  );
} 