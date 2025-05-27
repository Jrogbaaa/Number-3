'use client';

import { useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ClientHomePageProps {
  children: React.ReactNode;
}

// Separate component for search params logic
function SearchParamsHandler() {
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

  // Enhance existing buttons with authentication-aware behavior
  useEffect(() => {
    const enhanceButtons = () => {
      // Find all "Get Started" and "Start Your Free Trial" buttons
      const buttons = document.querySelectorAll('a[href="/onboarding"]');
      
      buttons.forEach((button) => {
        const handleClick = (e: Event) => {
          e.preventDefault();
          if (status === 'authenticated') {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        };
        
        // Remove any existing listeners and add new one
        button.removeEventListener('click', handleClick);
        button.addEventListener('click', handleClick);
      });
    };

    // Only enhance buttons after component mounts and status is determined
    if (status !== 'loading') {
      enhanceButtons();
    }
  }, [status, router]);

  return null; // This component doesn't render anything, just adds behavior
}

export default function ClientHomePage({ children }: ClientHomePageProps) {
  return (
    <>
      {children}
      
      {/* Client-side behavior enhancement wrapped in Suspense */}
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
    </>
  );
} 