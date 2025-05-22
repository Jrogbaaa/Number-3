'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lead } from '@/types/lead';
import ContentCalendar from '@/components/ContentCalendar';
import LeadsTable from '@/components/LeadsTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LeadScoreDistribution from '@/components/dashboard/LeadScoreDistribution';
import WelcomeModal from '@/components/ui/WelcomeModal';
import OnboardingModal from '@/components/ui/OnboardingModal';
import { useUserPreferences } from '@/providers/UserPreferencesProvider';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    resetFirstVisitFlag?: () => void;
  }
}

// Add this component for debugging
const DebugInfo = ({ 
  session, 
  status, 
  preferences 
}: { 
  session: any; 
  status: 'loading' | 'authenticated' | 'unauthenticated'; 
  preferences: any;
}) => {
  // Only show in development mode
  if (process.env.NODE_ENV === 'production') return null;
  
  return (
    <div className="mt-4 p-3 bg-gray-800/80 border border-gray-700 rounded-md text-xs text-gray-300 overflow-auto max-h-[50vh]">
      <h3 className="font-semibold text-sm text-amber-400 mb-2">Debug Information</h3>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-amber-300">Authentication:</h4>
          <pre className="p-1 bg-gray-900/50 rounded mt-1 overflow-x-auto">
            {JSON.stringify({ status, session }, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium text-amber-300">User Preferences:</h4>
          <pre className="p-1 bg-gray-900/50 rounded mt-1 overflow-x-auto">
            {JSON.stringify(preferences, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <p>If you're seeing authentication issues:</p>
        <ul className="list-disc list-inside ml-1 mt-1">
          <li>Check that your cookies are not being blocked</li>
          <li>Verify that the NEXTAUTH_SECRET environment variable is properly set</li>
          <li>Try signing out and back in</li>
        </ul>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(process.env.NODE_ENV !== 'production');
  
  // Always call the hook, but only use its values when authenticated
  const userPreferences = useUserPreferences();
  
  // Safely access user preferences values
  const hasCompletedOnboarding = status === 'authenticated' ? userPreferences.hasCompletedOnboarding : false;
  const preferencesLoading = status === 'authenticated' ? userPreferences.loading : false;
  const preferences = status === 'authenticated' ? userPreferences.preferences : null;
  const preferencesError = status === 'authenticated' ? userPreferences.error : null;

  // Check authentication
  useEffect(() => {
    console.log('Dashboard - auth status:', status);
    console.log('Dashboard - session:', session);
    console.log('Dashboard - hasCompletedOnboarding:', hasCompletedOnboarding);
    
    if (status === 'unauthenticated') {
      console.log('Dashboard: User not authenticated, redirecting to signin');
      router.push('/signin');
    }
  }, [status, router, hasCompletedOnboarding]);

  // Define fetchLeads outside the conditional block to avoid linter error
  const fetchLeads = async () => {
      try {
        setLoading(true);
        
        // Use the new server-side API route instead of direct Supabase call
        const response = await fetch('/api/fetch-leads');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load leads data');
        }
        
        const fetchedLeads = data.leads || [];
        
        // Apply scoring based on user preferences - key enhancement to make leads relevant
        const scoredLeads = scoreLeadsBasedOnPreferences(fetchedLeads, preferences);
        
        setLeads(scoredLeads);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads data');
      } finally {
        setLoading(false);
      }
  };

  // Score leads based on user preferences from onboarding
  const scoreLeadsBasedOnPreferences = (leads: Lead[], userPrefs: any) => {
    if (!userPrefs) return leads;
    
    return leads.map(lead => {
      // Initialize scores for different dimensions
      let marketingScore = 0;
      let budgetPotential = 0;
      let intentScore = 0;
      let spendAuthorityScore = 0;
      let businessOrientation = lead.businessOrientation || 'Unknown';
      let orientationConfidence = lead.orientationConfidence || 'Low';
      let budgetConfidence = lead.budgetConfidence || 'Low';
      
      // Check for matching target roles (highest weight in scoring)
      if (userPrefs.targetRoles && lead.title) {
        const leadTitleLower = lead.title.toLowerCase();
        for (const role of userPrefs.targetRoles) {
          if (leadTitleLower.includes(role.toLowerCase())) {
            // Role match is very significant
            marketingScore += 40;
            intentScore += 35;
            spendAuthorityScore += 30;
            break;
          }
        }
      }
      
      // Check for matching industries
      if (userPrefs.targetIndustries && lead.company) {
        // We don't have direct industry info, so use company name as proxy
        const companyNameLower = lead.company.toLowerCase();
        for (const industry of userPrefs.targetIndustries) {
          if (companyNameLower.includes(industry.toLowerCase())) {
            marketingScore += 25;
            intentScore += 20;
            break;
          }
        }
      }
      
      // Check for company size match
      if (userPrefs.targetCompanySizes && lead.insights?.companySize) {
        const companySize = lead.insights.companySize;
        const sizeCategoryMap: Record<string, number[]> = {
          'Startup (1-10)': [1, 10],
          'Small (11-50)': [11, 50],
          'Medium (51-200)': [51, 200],
          'Large (201-1000)': [201, 1000],
          'Enterprise (1000+)': [1001, 100000]
        };
        
        for (const sizeCategory of userPrefs.targetCompanySizes) {
          const range = sizeCategoryMap[sizeCategory];
          if (range && companySize >= range[0] && companySize <= range[1]) {
            marketingScore += 15;
            budgetPotential += 25;
            break;
          }
        }
      }
      
      // Check for location match if available
      if (userPrefs.targetDemographics?.locations && lead.location) {
        const leadLocationLower = lead.location.toLowerCase();
        for (const location of userPrefs.targetDemographics.locations) {
          if (leadLocationLower.includes(location.toLowerCase())) {
            marketingScore += 10;
            break;
          }
        }
      }
      
      // Use company seniority signals from the job title to estimate spend authority
      if (lead.title) {
        const titleLower = lead.title.toLowerCase();
        const seniorityTerms = ['ceo', 'cto', 'cfo', 'cmo', 'chief', 'vp', 'vice president', 'director', 'head of', 'senior', 'lead'];
        
        for (const term of seniorityTerms) {
          if (titleLower.includes(term)) {
            spendAuthorityScore += 25;
            budgetPotential += 20;
            budgetConfidence = 'Medium';
            break;
          }
        }
      }
      
      // Determine B2B vs B2C orientation based on company and other signals
      if (lead.company) {
        const companyLower = lead.company.toLowerCase();
        // B2B signals: enterprise, solutions, tech, software, services, consulting
        const b2bSignals = ['enterprise', 'solutions', 'software', 'consulting', 'services', 'technologies', 'b2b'];
        // B2C signals: retail, consumer, shop, store
        const b2cSignals = ['retail', 'consumer', 'shop', 'store', 'b2c'];
        
        let b2bScore = 0;
        let b2cScore = 0;
        
        for (const signal of b2bSignals) {
          if (companyLower.includes(signal)) b2bScore++;
        }
        
        for (const signal of b2cSignals) {
          if (companyLower.includes(signal)) b2cScore++;
        }
        
        if (b2bScore > b2cScore) {
          businessOrientation = 'B2B';
          orientationConfidence = b2bScore > 2 ? 'High' : 'Medium';
        } else if (b2cScore > b2bScore) {
          businessOrientation = 'B2C';
          orientationConfidence = b2cScore > 2 ? 'High' : 'Medium';
        } else if (b2bScore > 0 && b2cScore > 0) {
          businessOrientation = 'Mixed';
          orientationConfidence = 'Medium';
        }
      }
      
      // Calculate base score without preferences if we don't have enough signals
      if (marketingScore === 0) {
        marketingScore = lead.chromeScore || lead.propsScore || Math.floor(Math.random() * 40) + 40;
      }
      
      // Ensure we have reasonable values for all scores
      if (intentScore === 0) {
        intentScore = Math.max(20, Math.min(marketingScore - 10, 90));
      }
      
      if (budgetPotential === 0) {
        budgetPotential = Math.max(20, Math.min(marketingScore - 15, 85));
      }
      
      if (spendAuthorityScore === 0) {
        spendAuthorityScore = Math.max(20, Math.min(marketingScore - 20, 80));
      }
      
      // Apply final normalization to scores (0-100 range)
      marketingScore = Math.min(100, Math.max(0, marketingScore));
      intentScore = Math.min(100, Math.max(0, intentScore));
      budgetPotential = Math.min(100, Math.max(0, budgetPotential));
      spendAuthorityScore = Math.min(100, Math.max(0, spendAuthorityScore));
      
      // Apply user's custom scoring weights if available
      if (userPrefs.customScoringWeights) {
        const weights = userPrefs.customScoringWeights;
        if (weights.marketingScore) marketingScore = Math.round(marketingScore * weights.marketingScore);
        if (weights.budgetPotential) budgetPotential = Math.round(budgetPotential * weights.budgetPotential);
        if (weights.intentScore) intentScore = Math.round(intentScore * weights.intentScore);
      }
      
      // Set chromeScore to marketingScore for backward compatibility
      return {
        ...lead,
        marketingScore,
        budgetPotential,
        intentScore,
        spendAuthorityScore,
        businessOrientation,
        orientationConfidence,
        budgetConfidence,
        chromeScore: marketingScore // For backward compatibility
      };
    })
    .sort((a, b) => {
      // Sort by multiple factors (prioritizing intent, spend authority, etc.)
      // 1. Intent Score (Highest priority)
      const intentComparison = (b.intentScore ?? 0) - (a.intentScore ?? 0);
      if (intentComparison !== 0) return intentComparison;
      
      // 2. Spend Authority Score
      const spendAuthorityComparison = (b.spendAuthorityScore ?? 0) - (a.spendAuthorityScore ?? 0);
      if (spendAuthorityComparison !== 0) return spendAuthorityComparison;
      
      // 3. Marketing Score
      const marketingComparison = (b.marketingScore ?? 0) - (a.marketingScore ?? 0);
      if (marketingComparison !== 0) return marketingComparison;
      
      // 4. Budget Potential
      return (b.budgetPotential ?? 0) - (a.budgetPotential ?? 0);
    });
  };

  useEffect(() => {
    // Only fetch leads if user is authenticated
    if (status === 'authenticated') {
      fetchLeads();
    }
  }, [status]);

  // Check for first visit when component mounts
  useEffect(() => {
    // Skip if not authenticated
    if (status !== 'authenticated') return;
    
    // Only show welcome modal if user has completed onboarding
    // For users who haven't completed onboarding, they'll see the OnboardingModal instead
    if (hasCompletedOnboarding) {
      // Check if the user has visited the dashboard before
      const hasVisitedBefore = localStorage.getItem('hasVisitedDashboard');
      
      // If this is the first visit, show the welcome modal and set the localStorage flag
      if (!hasVisitedBefore) {
        setShowWelcomeModal(true);
        localStorage.setItem('hasVisitedDashboard', 'true');
      }
    }
    
    // Add developer utility to reset first visit flag (available in browser console)
    // Usage: window.resetFirstVisitFlag()
    window.resetFirstVisitFlag = () => {
      localStorage.removeItem('hasVisitedDashboard');
      console.log('First visit flag reset. Refresh the page to see the welcome modal again.');
    };
    
    // Cleanup
    return () => {
      delete window.resetFirstVisitFlag;
    };
  }, [status, hasCompletedOnboarding]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  // Show loading state while checking authentication or preferences
  if (status === 'loading' || preferencesLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="animate-pulse text-gray-400 mb-6">Loading...</div>
          
          {/* Debug info - only visible in development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 p-3 bg-gray-800/60 rounded-md text-xs text-gray-300 max-w-md">
              <h3 className="font-medium text-amber-400 mb-1">Debug Information</h3>
              <p>Auth Status: {status}</p>
              <p>Has Session: {session ? 'Yes' : 'No'}</p>
              <p>Preferences Loading: {preferencesLoading ? 'Yes' : 'No'}</p>
              
              <div className="mt-2 pt-2 border-t border-gray-700/50">
                <p className="font-medium text-white mb-1">Sign In Directly:</p>
                <a 
                  href="/api/auth/signin/google?callbackUrl=/dashboard" 
                  className="block p-1.5 bg-blue-900/30 rounded text-blue-300 hover:bg-blue-900/50"
                >
                  Sign In with Google
                </a>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // If unauthenticated, show a sign-in button instead of just returning null
  if (status === 'unauthenticated') {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="text-xl text-white mb-4">Please sign in to access your dashboard</div>
          
          <a 
            href="/api/auth/signin/google?callbackUrl=/dashboard"
            className="flex items-center justify-center gap-3 rounded-md bg-white px-4 py-3 text-gray-800 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all w-64"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
              <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
              <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.7272727 L18.4363636,14.7272727 C18.1187732,16.6574066 17.2662994,18.0125889 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
              <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
            </svg>
            <span>Sign in with Google</span>
          </a>
          
          {/* Debug info - only visible in development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 p-3 bg-gray-800/60 rounded-md text-xs text-gray-300">
              <h3 className="font-medium text-amber-400 mb-1">Debug Information</h3>
              <p>Auth Status: {status}</p>
              <p>Has Session: {session ? 'Yes' : 'No'}</p>
              <p>Preferences Loading: {preferencesLoading ? 'Yes' : 'No'}</p>
              
              <div className="mt-2 pt-2 border-t border-gray-700/50">
                <p className="font-medium text-white mb-1">Try These Links:</p>
                <div className="space-y-1">
                  <a 
                    href="/api/auth/signin/google?callbackUrl=/dashboard" 
                    className="block p-1.5 bg-blue-900/30 rounded text-blue-300 hover:bg-blue-900/50"
                  >
                    Direct Google Sign In
                  </a>
                  <a 
                    href="/signin" 
                    className="block p-1.5 bg-gray-700/30 rounded text-gray-300 hover:bg-gray-700/50"
                  >
                    Go to Sign In Page
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Content for authenticated users
  return (
    <DashboardLayout>
      {/* Render OnboardingModal if the user hasn't completed onboarding */}
      {!hasCompletedOnboarding && <OnboardingModal />}
      
      {/* Show welcome modal on first visit (only if the user has completed onboarding) */}
      {showWelcomeModal && <WelcomeModal onClose={handleCloseWelcomeModal} />}
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
            <p className="font-medium">{error}</p>
            <button 
              onClick={fetchLeads}
              className="mt-2 text-sm text-red-300 hover:text-red-100 underline"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Preferences error message */}
        {preferencesError && (
          <div className="mb-6 p-4 bg-orange-600/20 border border-orange-600/30 rounded-lg text-orange-200">
            <p className="font-medium">{preferencesError}</p>
            <p className="mt-2 text-sm">
              Your preferences are currently stored locally. They will sync automatically when the database connection is restored.
            </p>
          </div>
        )}
        
        {/* Lead Score Distribution */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Lead Quality Distribution</h2>
          <div className="rounded-lg">
            <LeadScoreDistribution />
          </div>
        </div>

        {/* Content Calendar */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Outreach Calendar</h2>
          <div className="rounded-lg">
            <ContentCalendar />
          </div>
        </div>

        {/* Leads Table */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Top Leads</h2>
          <LeadsTable 
            leads={leads} 
            showChromeScore={true}
          />
        </div>
        
        {/* Debug info - only visible in development */}
        {showDebugInfo && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-amber-500">Debug Information</h3>
              <button 
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="text-xs text-gray-400 hover:text-white"
              >
                {showDebugInfo ? 'Hide' : 'Show'}
              </button>
            </div>
            <DebugInfo 
              session={session} 
              status={status} 
              preferences={preferences} 
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 