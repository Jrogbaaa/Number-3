'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Mock testimonials data
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechNova',
    quote: 'OptiLeads.ai helped us find hundreds of quality leads that converted at 3x our previous rate.',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
  },
  {
    name: 'Michael Chen',
    role: 'Growth Lead',
    company: 'Sequoia Startups',
    quote: 'We increased our qualified leads by 240% in just 2 months with OptiLeads.ai.',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Sales Operations',
    company: 'EnterpriseCloud',
    quote: 'The AI-powered lead scoring saved our team countless hours and improved conversion by 45%.',
    avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
  },
];

// Mock stats data
const stats = [
  { value: '250%', label: 'Average increase in qualified leads' },
  { value: '45%', label: 'Reduction in lead qualification time' },
  { value: '3.2x', label: 'Higher conversion rate' },
  { value: '78%', label: 'of users see results in first month' },
];

// Companies using the platform
const companies = [
  'Adobe', 'Shopify', 'Stripe', 'Dropbox', 'Slack', 'Atlassian'
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();
  const isLandingPage = searchParams.get('landing') === 'true';

  // Handle potential session errors and recovery
  useEffect(() => {
    // If there's an error state or we're stuck in loading for too long, try to recover
    const timeoutId = setTimeout(() => {
      if (status === 'loading' && !recoveryAttempted) {
        console.log('[Home] Session loading timeout, attempting recovery');
        setSessionError(true);
        setRecoveryAttempted(true);
        
        // Try to force a session update
        update().catch(err => {
          console.log('[Home] Session update failed:', err);
        });
      }
    }, 5000); // Wait 5 seconds before considering it stuck

    return () => clearTimeout(timeoutId);
  }, [status, recoveryAttempted, update]);

  // Check authentication status on page load
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard, unless landing=true
    if (status === 'authenticated' && session?.user?.id && !isLandingPage) {
      console.log('[Home] User is authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [status, session, router, isLandingPage]);

  const handleGetStarted = () => {
    try {
      setIsLoading(true);
      if (status === 'authenticated') {
        router.push('/dashboard');
      } else {
        // Redirect to sign-in page for non-authenticated users
        router.push('/signin');
      }
    } catch (error) {
      console.log('[Home] Error navigating:', error);
      setIsLoading(false);
    }
  };

  const handleResetSession = async () => {
    try {
      setIsLoading(true);
      console.log('[Home] Resetting session...');
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Safely clear localStorage
        try {
          if (window.localStorage) {
            localStorage.clear();
          }
        } catch (e) {
          console.log('[Home] Error clearing localStorage:', e);
        }
        
        // Safely clear sessionStorage
        try {
          if (window.sessionStorage) {
            sessionStorage.clear();
          }
        } catch (e) {
          console.log('[Home] Error clearing sessionStorage:', e);
        }
        
        // Sign out if we have a session
        if (status === 'authenticated') {
          try {
            await signOut({ redirect: false });
          } catch (e) {
            console.log('[Home] Error during signOut:', e);
          }
        }
        
        // Clear cookies related to authentication
        try {
          if (document.cookie) {
            document.cookie.split(';').forEach(cookie => {
              const [name] = cookie.trim().split('=');
              if (name && (name.includes('next-auth') || name.includes('optileads') || name.includes('props'))) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
              }
            });
          }
        } catch (e) {
          console.log('[Home] Error clearing cookies:', e);
        }
        
        // Wait briefly to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reload the page to get a fresh state
        window.location.href = '/';
      }
    } catch (error) {
      console.log('[Home] Error resetting session:', error);
      setIsLoading(false);
      
      // If all else fails, try a hard reload
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  // If we're in a loading state for too long, show a recovery UI
  if (status === 'loading' && sessionError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dark-navy p-4 text-white">
        <div className="w-full max-w-md rounded-lg bg-navy p-8 shadow-lg text-center">
          <h2 className="mb-4 text-2xl font-bold text-yellow-400">Loading Stuck</h2>
          <p className="mb-6 text-gray-300">
            We're having trouble loading your session. This could be due to cached data from a previous version.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleResetSession}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Reset session data and reload"
            >
              Reset & Reload
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Try again without resetting"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-navy text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-dark-navy to-navy min-h-screen">
      {/* Header/Navigation */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/?landing=true"
              className="text-2xl font-bold text-white hover:text-gray-200 transition-colors"
              aria-label="OptiLeads.ai Home"
              tabIndex={0}
            >
              OptiLeads.ai
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center space-x-4">
            {status === 'authenticated' ? (
              <Link 
                href="/dashboard"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/signin"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signin"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with CTA */}
      <main>
        <div className="relative isolate">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Find Your Best Leads with AI Precision
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                OptiLeads.ai uses advanced AI to identify, score, and engage high-quality leads that are most likely to convert, saving you time and maximizing your ROI.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-70"
                  aria-label="Get started with OptiLeads.ai"
                  tabIndex={0}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    'Get Started for Free'
                  )}
                </button>
                <a href="#how-it-works" className="text-sm font-semibold leading-6 text-white">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="bg-navy/60 py-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-xl font-semibold leading-8 text-white">
                Trusted by innovative companies worldwide
              </h2>
              <div className="mt-8 flex items-center justify-center gap-x-8 gap-y-4 flex-wrap">
                {companies.map((company) => (
                  <div key={company} className="text-gray-400 text-lg sm:text-xl md:text-2xl font-semibold">
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Testimonial */}
        <div className="bg-dark-navy py-24" id="testimonials">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-12">
                Real Results from Real Customers
              </h2>
            </div>
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.name}
                  className="rounded-2xl bg-navy/40 p-8 backdrop-blur-sm shadow-lg ring-1 ring-white/10"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                      <p className="text-sm text-gray-400">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-navy/60 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-8">
                Proven Performance
              </h2>
            </div>
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="p-6">
                  <p className="text-4xl font-bold text-indigo-500">{stat.value}</p>
                  <p className="mt-2 text-sm text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-dark-navy py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to transform your lead generation?
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Get started today and see the difference AI-powered lead management can make for your business.
              </p>
              <div className="mt-10 flex items-center justify-center">
                <button
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-70"
                  aria-label="Get started with OptiLeads.ai"
                  tabIndex={0}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    'Start Your Free Trial'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-navy border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.064-.926-2.064-2.065 0-1.138.92-2.063 2.064-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2023 OptiLeads.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-4 right-4 p-3 bg-gray-800/80 rounded-md text-xs text-gray-300 max-w-xs">
          <h3 className="font-medium text-amber-400 mb-1">Debug Info</h3>
          <p>Auth Status: {status}</p>
          <p>Has Session: {session ? 'Yes' : 'No'}</p>
          {session?.user?.id && <p>User ID: {session.user.id}</p>}
          
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <p className="font-medium text-white mb-1">Quick Links:</p>
            <div className="space-y-1">
              <a 
                href="/signin" 
                className="block p-1 text-blue-300 hover:underline"
              >
                Sign In Page
              </a>
              <a 
                href="/dashboard" 
                className="block p-1 text-blue-300 hover:underline"
              >
                Dashboard
              </a>
              <button
                onClick={handleResetSession}
                className="block w-full p-1 text-red-300 hover:underline text-left"
              >
                Reset Session Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 