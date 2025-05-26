'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OnboardingModal from '@/components/ui/OnboardingModal';
import { useUserPreferences } from '@/providers/UserPreferencesProvider';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userPreferences = useUserPreferences();
  const [shouldPromptAuth, setShouldPromptAuth] = useState(false);
  const [hasTemporaryLeads, setHasTemporaryLeads] = useState(false);
  
  useEffect(() => {
    // Check for temporary leads to determine if onboarding should be shown
    try {
      const tempLeads = localStorage.getItem('temporary-leads');
      if (tempLeads) {
        const leads = JSON.parse(tempLeads);
        setHasTemporaryLeads(leads && Array.isArray(leads) && leads.length > 0);
      }
    } catch (error) {
      console.error('Error checking temporary leads:', error);
    }
    
    // If the user is already authenticated and has completed onboarding, go to dashboard
    if (status === 'authenticated' && userPreferences.hasCompletedOnboarding) {
      router.push('/dashboard');
      return;
    }
    
    // Show auth prompt if onboarding is complete but user is not authenticated
    if (userPreferences.hasCompletedOnboarding && status !== 'authenticated') {
      setShouldPromptAuth(true);
    } else {
      setShouldPromptAuth(false);
    }
  }, [status, userPreferences.hasCompletedOnboarding, router, hasTemporaryLeads]);

  return (
    <div className="min-h-screen bg-dark-navy flex flex-col">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-radial-dark pointer-events-none"></div>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          {/* Only render the modal if onboarding is not completed */}
          {!userPreferences.hasCompletedOnboarding && <OnboardingModal />}
          
          {/* Sign-in prompt that appears when appropriate */}
          {shouldPromptAuth && (
            <div className="mt-8 p-6 bg-gray-800/80 border border-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-3">
                Sign in to continue
              </h3>
              <p className="text-gray-300 mb-4">
                To save your preferences and access all features, please sign in with your account.
              </p>
              <a 
                href="/api/auth/signin/google?callbackUrl=/dashboard"
                className="flex items-center justify-center gap-3 rounded-md bg-white px-4 py-3 text-gray-800 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.7272727 L18.4363636,14.7272727 C18.1187732,16.6574066 17.2662994,18.0125889 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                </svg>
                <span>Sign in with Google</span>
              </a>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-4 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} OptiLeads. All rights reserved.</p>
      </footer>
    </div>
  );
} 