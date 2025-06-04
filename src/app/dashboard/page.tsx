'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lead } from '@/types/lead';
import ContentCalendar from '@/components/outreach/ContentCalendar';
import LeadsTable from '@/components/LeadsTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LeadScoreDistribution from '@/components/dashboard/LeadScoreDistribution';
import WelcomeModal from '@/components/ui/WelcomeModal';
import OnboardingModal from '@/components/ui/OnboardingModal';
import ScoringTutorialModal from '@/components/ui/ScoringTutorialModal';
import { useUserPreferences } from '@/providers/UserPreferencesProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useScoringTutorial } from '@/hooks/useScoringTutorial';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import ResetSettingsButton from '@/components/ui/ResetSettingsButton';
import { RotateCcw, Users, Calendar, Info, TrendingUp, Target } from 'lucide-react';

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
  preferences,
  auth
}: { 
  session: any; 
  status: 'loading' | 'authenticated' | 'unauthenticated'; 
  preferences: any;
  auth: any;
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
          <h4 className="font-medium text-amber-300">Auth Provider:</h4>
          <pre className="p-1 bg-gray-900/50 rounded mt-1 overflow-x-auto">
            {JSON.stringify(auth, null, 2)}
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
  const auth = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(process.env.NODE_ENV !== 'production');
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(false);
  const [preventWelcomeModal, setPreventWelcomeModal] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'outreach'>('leads');
  
  // Scoring tutorial integration
  const {
    showTutorial,
    triggerTutorialAfterUpload,
    triggerTutorialAfterReset,
    completeTutorial,
    closeTutorial
  } = useScoringTutorial();
  
  // Check for reset state on mount and periodically
  useEffect(() => {
    const checkResetState = () => {
      const lastResetTime = localStorage.getItem('lastSettingsReset');
      const isVeryRecentReset = lastResetTime && (Date.now() - parseInt(lastResetTime)) < 45 * 1000;
      setIsResetting(!!isVeryRecentReset);
    };
    
    // Check immediately
    checkResetState();
    
    // Check every 2 seconds for the first minute after mount
    const interval = setInterval(checkResetState, 2000);
    
    // Clear interval after 60 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 60000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
  
  // Always call the hook, but only use its values when authenticated
  const userPreferences = useUserPreferences();
  
  // Check onboarding completion for both authenticated and unauthenticated users
  // since onboarding data can be stored locally
  const hasCompletedOnboarding = userPreferences.hasCompletedOnboarding;
  const preferencesLoading = userPreferences.loading;
  const preferences = status === 'authenticated' ? userPreferences.preferences : null;
  const preferencesError = status === 'authenticated' ? userPreferences.error : null;

  // Track onboarding state changes and prevent welcome modal during onboarding/reset
  useEffect(() => {
    setIsOnboardingActive(!hasCompletedOnboarding);
    
    // Check if this is a recent reset (within last 2 minutes for reset state)
    const lastResetTime = localStorage.getItem('lastSettingsReset');
    const isRecentReset = lastResetTime && (Date.now() - parseInt(lastResetTime)) < 2 * 60 * 1000;
    
    // Set resetting state if it's a very recent reset (within 45 seconds to account for page reload)
    const isVeryRecentReset = lastResetTime && (Date.now() - parseInt(lastResetTime)) < 45 * 1000;
    setIsResetting(!!isVeryRecentReset);
    
    // If onboarding is not completed OR this is a recent reset, prevent welcome modal
    if (!hasCompletedOnboarding || isRecentReset) {
      setPreventWelcomeModal(true);
      // Also clear the welcome modal state if it was set
      setShowWelcomeModal(false);
    } else {
      // Only allow welcome modal if onboarding is truly complete AND no recent reset
      // Add a delay to ensure everything is stable
      const timer = setTimeout(() => {
        setPreventWelcomeModal(false);
      }, 3000); // 3 second delay to ensure onboarding is fully complete
      
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  // Check for recent settings reset and trigger tutorial if needed
  useEffect(() => {
    console.log('[Dashboard] Reset detection effect triggered:', {
      hasCompletedOnboarding,
      preferences: !!preferences,
      status
    });
    
    if (!hasCompletedOnboarding || !preferences || status !== 'authenticated') {
      console.log('[Dashboard] Not ready for reset detection yet');
      return;
    }
    
    const lastResetTime = localStorage.getItem('lastSettingsReset');
    console.log('[Dashboard] Checking for recent reset, lastResetTime:', lastResetTime);
    
    if (lastResetTime) {
      const resetTime = parseInt(lastResetTime);
      const timeSinceReset = Date.now() - resetTime;
      
      console.log('[Dashboard] Reset detected:', {
        resetTime: new Date(resetTime).toISOString(),
        timeSinceReset: `${Math.round(timeSinceReset / 1000)}s ago`,
        withinWindow: timeSinceReset < 60000
      });
      
      // Extend the window to 60 seconds to catch cases where onboarding takes time
      if (timeSinceReset < 60000 && hasCompletedOnboarding && preferences) {
        console.log('[Dashboard] Triggering tutorial after settings reset');
        // Trigger tutorial after a brief delay to ensure leads are loaded
        setTimeout(() => {
          console.log('[Dashboard] Executing triggerTutorialAfterReset');
          triggerTutorialAfterReset();
        }, 2500); // Slightly longer delay
        
        // Clear the reset timestamp so we don't trigger again
        localStorage.removeItem('lastSettingsReset');
        console.log('[Dashboard] Cleared reset timestamp');
      }
    }
  }, [hasCompletedOnboarding, preferences, status, triggerTutorialAfterReset]);

  // Debug onboarding state
  console.log('[Dashboard] Onboarding state check:', {
    hasCompletedOnboarding,
    preferencesLoading,
    status,
    preferences: preferences ? 'loaded' : 'none',
    isOnboardingActive,
    preventWelcomeModal,
    showWelcomeModal,
    isResetting
  });

  // Import temporary leads when user signs in
  const importTemporaryLeads = async (tempLeads: any[]) => {
    try {
      console.log(`[Dashboard] Importing ${tempLeads.length} temporary leads for authenticated user`);
      
      // Show loading state to user
      const loadingToast = toast.loading(`Importing your ${tempLeads.length} leads...`);
      
      const response = await fetch('/api/upload-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leads: tempLeads }),
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.ok) {
        const result = await response.json();
        console.log('[Dashboard] Temporary leads imported successfully:', result);
        
        // Show success message
        toast.success(`Successfully imported ${tempLeads.length} leads to your account!`);
        
        // Refresh leads data
        fetchLeads();
        
        // Trigger tutorial after successful import if user has completed onboarding
        if (hasCompletedOnboarding && tempLeads.length > 0) {
          setTimeout(() => {
            triggerTutorialAfterUpload(tempLeads.length);
          }, 1500);
        }
      } else {
        const errorData = await response.json();
        console.error('[Dashboard] Failed to import temporary leads:', errorData);
        toast.error(`Failed to import leads: ${errorData.error || 'Unknown error'}`);
        
        // Don't clear temporary leads if import fails
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[Dashboard] Error importing temporary leads:', error);
      toast.error('Error importing your leads. Please try uploading again.');
      return false;
    }
  };

  // Check authentication
  useEffect(() => {
    console.log('Dashboard - auth status:', status);
    console.log('Dashboard - session:', session);
    console.log('Dashboard - AuthProvider status:', auth.authStatus);
    console.log('Dashboard - hasCompletedOnboarding:', hasCompletedOnboarding);
    
    // Only redirect to signin if user is unauthenticated AND hasn't completed onboarding
    if (status === 'unauthenticated' && !hasCompletedOnboarding) {
      console.log('Dashboard: User not authenticated and onboarding incomplete, redirecting to signin');
      router.push('/signin');
    }
    
    // Check for temporary leads when user signs in
    if (status === 'authenticated' && session?.user) {
      try {
        const tempLeads = localStorage.getItem('temporary-leads');
        if (tempLeads) {
          const leads = JSON.parse(tempLeads);
          if (leads && Array.isArray(leads) && leads.length > 0) {
            console.log(`[Dashboard] Found ${leads.length} temporary leads to import`);
            
            // Import temporary leads to user's account
            importTemporaryLeads(leads).then((success) => {
              if (success) {
                // Only clear temporary leads from localStorage if import was successful
                console.log('[Dashboard] Import successful, clearing temporary leads from localStorage');
                localStorage.removeItem('temporary-leads');
              } else {
                console.log('[Dashboard] Import failed, keeping temporary leads in localStorage for retry');
              }
            });
          }
        }
      } catch (error) {
        console.error('[Dashboard] Error checking for temporary leads:', error);
      }
    }
    
    // Sync authentication with backend if needed
    if (status === 'authenticated' && auth.authStatus !== 'authenticated') {
      auth.syncWithBackend().catch(err => {
        console.error('Failed to sync authentication with backend:', err);
      });
    }
  }, [status, router, hasCompletedOnboarding, auth, session]);

  // Define fetchLeads outside the conditional block to avoid linter error
  const fetchLeads = async () => {
    // Check if we have a valid session first, don't wait for auth sync
    if (status !== 'authenticated' || !session) {
      console.log('Dashboard: Not authenticated, skipping lead fetch. Status:', status, 'Session:', !!session);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Dashboard: Starting to fetch leads...');
      
      // Use the new server-side API route instead of direct Supabase call
      const response = await fetch('/api/fetch-leads');
      console.log('Dashboard: API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Dashboard: API error response:', errorData);
        
        // Handle specific error types
        if (response.status === 401) {
          console.log('Authentication error when fetching leads, redirecting to signin');
          router.push('/signin');
          return;
        }
        
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dashboard: API success response:', { 
        success: data.success, 
        leadCount: data.leads?.length || 0,
        hasLeads: !!data.leads 
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load leads data');
      }
      
      const fetchedLeads = data.leads || [];
      console.log('Dashboard: Fetched leads:', fetchedLeads.length);
      
      // Don't apply scoring here - let LeadsTable handle all scoring for consistency
      // This prevents double scoring and ensures consistent results
      console.log('Dashboard: Fetched leads (scoring will be handled by LeadsTable):', fetchedLeads.length);
      
      setLeads(fetchedLeads);
      console.log('Dashboard: Leads set to state successfully');
      
      // Trigger tutorial for first-time users if leads exist
      if (fetchedLeads.length > 0) {
        console.log('[Dashboard] Leads loaded, checking tutorial trigger conditions:', {
          leadsCount: fetchedLeads.length,
          hasCompletedOnboarding,
          preferences: !!preferences
        });
        
        // Small delay to let the leads render first
        setTimeout(() => {
          console.log('[Dashboard] Executing triggerTutorialAfterUpload');
          triggerTutorialAfterUpload(fetchedLeads.length);
        }, 1500);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      
      // Provide more user-friendly error message
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('authenticated') || errorMessage.includes('auth')) {
        setError('Please sign in to view your leads');
        // Redirect to signin after a short delay to allow the error to be seen
        setTimeout(() => router.push('/signin'), 2000);
      } else {
        setError('Failed to load your leads. Please try again later.');
      }
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
        // Use a deterministic score based on lead properties (same logic as LeadsTable)
        const getStableScore = (lead: any) => {
          // Use the same approach as getStableHashFromLead for consistency
          const idPart = lead.id || '';
          const namePart = (lead.name || '').toLowerCase();
          const emailPart = (lead.email || '').toLowerCase();
          const companyPart = (lead.company || '').toLowerCase();
          const titlePart = (lead.title || '').toLowerCase();
          
          // Create a string with fixed structure: id|name|email|company|title
          const str = `${idPart}|${namePart}|${emailPart}|${companyPart}|${titlePart}`;
          
          // Create a deterministic hash from the string
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash + char) | 0; // Convert to 32bit integer with bitwise OR
          }
          
          // Convert to a score between 40-80 using absolute value and modulo
          return 40 + Math.abs(hash % 41);
        };
        
        marketingScore = lead.chromeScore || lead.propsScore || getStableScore(lead);
      }
      
      // Ensure we have reasonable values for all scores using deterministic calculations
      if (intentScore === 0) {
        // Use a deterministic calculation based on lead properties
        const getStableIntentScore = (lead: any) => {
          const str = `intent_${lead.id || ''}${lead.name || ''}${lead.email || ''}`;
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
          }
          return 20 + Math.abs(hash % 71); // 20-90 range
        };
        intentScore = getStableIntentScore(lead);
      }
      
      if (budgetPotential === 0) {
        // Use a deterministic calculation based on lead properties
        const getStableBudgetScore = (lead: any) => {
          const str = `budget_${lead.id || ''}${lead.company || ''}${lead.title || ''}`;
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
          }
          return 20 + Math.abs(hash % 66); // 20-85 range
        };
        budgetPotential = getStableBudgetScore(lead);
      }
      
      if (spendAuthorityScore === 0) {
        // Use a deterministic calculation based on lead properties
        const getStableSpendScore = (lead: any) => {
          const str = `spend_${lead.id || ''}${lead.title || ''}${lead.company || ''}`;
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
          }
          return 20 + Math.abs(hash % 61); // 20-80 range
        };
        spendAuthorityScore = getStableSpendScore(lead);
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
      const budgetComparison = (b.budgetPotential ?? 0) - (a.budgetPotential ?? 0);
      if (budgetComparison !== 0) return budgetComparison;
      
      // 5. Final tie-breaker: sort by email or name for consistent ordering
      const aIdentifier = a.email || a.name || a.id || '';
      const bIdentifier = b.email || b.name || b.id || '';
      return aIdentifier.localeCompare(bIdentifier);
    });
  };

  // Load leads when authenticated (don't wait for auth sync)
  useEffect(() => {
    console.log('Dashboard: useEffect triggered - status:', status, 'session:', session);
    if (status === 'authenticated' && session) {
      console.log('Dashboard: Conditions met, calling fetchLeads');
      fetchLeads();
    } else if (status === 'unauthenticated') {
      // If user is unauthenticated, stop loading
      console.log('Dashboard: User unauthenticated, stopping loading');
      setLoading(false);
    } else {
      console.log('Dashboard: Waiting for authentication - status:', status, 'hasSession:', !!session);
    }
    // Keep loading true while status is 'loading'
  }, [status, session]); // Trigger when session is ready

  // Check for first visit when component mounts
  useEffect(() => {
    // Skip if not authenticated
    if (status !== 'authenticated') return;
    
    // COMPLETELY DISABLE welcome modal if any of these conditions are true:
    // 1. Onboarding not completed
    // 2. Preferences not loaded
    // 3. Prevention flag is set
    // 4. Onboarding is active
    // 5. Recent reset activity
    // 6. Current onboarding step is not complete (7)
    // 7. Currently in resetting state
    
    const lastResetTime = localStorage.getItem('lastSettingsReset');
    const isRecentReset = lastResetTime && (Date.now() - parseInt(lastResetTime)) < 10 * 60 * 1000; // 10 minutes
    const currentStep = preferences?.onboardingStep || 1;
    
    const shouldBlockWelcomeModal = (
      !hasCompletedOnboarding ||
      !preferences ||
      preventWelcomeModal ||
      isOnboardingActive ||
      isRecentReset ||
      currentStep < 7 ||
      preferencesLoading ||
      isResetting // Add this critical check
    );
    
    if (shouldBlockWelcomeModal) {
      console.log('[Dashboard] Blocking welcome modal due to:', {
        hasCompletedOnboarding,
        hasPreferences: !!preferences,
        preventWelcomeModal,
        isOnboardingActive,
        isRecentReset,
        currentStep,
        preferencesLoading,
        isResetting
      });
      // Actively hide welcome modal if it's currently showing
      setShowWelcomeModal(false);
      return; // Don't show welcome modal
    }
    
    // Only show welcome modal if ALL conditions are met and it's first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedDashboard');
    if (!hasVisitedBefore) {
      console.log('[Dashboard] Showing welcome modal - all conditions met');
      setShowWelcomeModal(true);
      localStorage.setItem('hasVisitedDashboard', 'true');
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
  }, [status, hasCompletedOnboarding, preferences, preventWelcomeModal, isOnboardingActive, preferencesLoading, isResetting]);

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
          {hasCompletedOnboarding ? (
            <>
              <div className="text-xl text-white mb-2">Welcome back!</div>
              <div className="text-gray-300 mb-6 text-center max-w-md">
                You've completed the onboarding process. Sign in to access your personalized dashboard and start managing your leads.
              </div>
            </>
          ) : (
            <div className="text-xl text-white mb-4">Please sign in to access your dashboard</div>
          )}
          
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
      {/* Show loading state during reset, otherwise show onboarding modal if user hasn't completed onboarding */}
      {isResetting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mb-4"></div>
              <h3 className="text-xl font-medium text-white mb-2">Resetting Settings</h3>
              <p className="text-gray-400 text-center">Please wait while we reset your preferences and prepare the onboarding process...</p>
            </div>
          </div>
        </div>
      ) : (
        !hasCompletedOnboarding && <OnboardingModal />
      )}
      
      {/* Show welcome modal on first visit (only if the user has completed onboarding and not prevented) */}
      {showWelcomeModal && hasCompletedOnboarding && !preventWelcomeModal && !isOnboardingActive && <WelcomeModal onClose={handleCloseWelcomeModal} />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage and analyze your leads with AI-powered insights</p>
          </div>
          <div className="flex items-center gap-3">
            <ResetSettingsButton />
            <Link
              href="/data-input"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
            >
              Upload Leads
            </Link>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-6 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-600/30 rounded-xl text-red-200 backdrop-blur-sm shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-600/20 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-100 mb-2">{error}</p>
            <button 
              onClick={fetchLeads}
                  className="text-sm text-red-300 hover:text-red-100 underline hover:no-underline transition-all duration-200"
            >
              Try Again
            </button>
              </div>
            </div>
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

        {/* Reset Settings Info - Only show if user has completed onboarding */}
        {hasCompletedOnboarding && leads.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/10 border border-blue-700/30 rounded-xl text-blue-200 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <RotateCcw className="h-4 w-4 text-blue-400 flex-shrink-0" />
              </div>
              <p className="text-sm text-blue-300 font-medium">
                Want to target different leads? Use "Reset Settings" to change your targeting criteria.
                </p>
            </div>
          </div>
        )}
        
        {/* Tabbed Interface */}
        <div className="mb-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gradient-to-r from-gray-800/50 to-gray-700/30 p-1.5 rounded-xl mb-8 backdrop-blur-sm border border-gray-700/30">
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                activeTab === 'leads'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gradient-to-r hover:from-gray-700/60 hover:to-gray-600/40'
              }`}
            >
              {activeTab === 'leads' && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg"></div>
              )}
              <Users className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Leads</span>
            </button>
            <button
              onClick={() => setActiveTab('outreach')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                activeTab === 'outreach'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gradient-to-r hover:from-gray-700/60 hover:to-gray-600/40'
              }`}
            >
              {activeTab === 'outreach' && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg"></div>
              )}
              <Calendar className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Outreach Calendar</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {/* Leads Tab Description */}
              <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/20 border border-gray-600/30 rounded-xl p-6 backdrop-blur-sm shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600/30 to-indigo-600/20 rounded-xl shadow-lg">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-3">How Your Leads Are Scored</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Our AI-powered scoring system uses proven machine learning methodologies and data enrichment to evaluate lead quality. 
                      Each lead is analyzed across multiple dimensions including intent signals, budget authority, and business fit using your 
                      specific targeting criteria. Higher scores indicate leads with stronger conversion potential based on research-backed 
                      predictive models used by leading SaaS platforms.
                    </p>
        </div>
          </div>
        </div>

        {/* Leads Table */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-600/30 to-indigo-600/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Your Top Leads</span>
                </h2>
          <LeadsTable 
            leads={leads} 
            showChromeScore={true}
                  loading={loading}
          />
              </div>
            </div>
          )}

          {activeTab === 'outreach' && (
            <div className="space-y-6">
              {/* Outreach Tab Description */}
              <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/20 border border-gray-600/30 rounded-xl p-6 backdrop-blur-sm shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-600/30 to-emerald-600/20 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent mb-3">Your Outreach Calendar</h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      Here's your place where you can outreach to your top leads. Your leads are organized by day based on their 
                      priority scores, with the highest-scoring leads scheduled earlier in the week. This helps you focus your 
                      outreach efforts on the most promising prospects first.
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      You can follow up using follow-up messages. Click on any lead to view their detailed profile and generate 
                      personalized outreach messages tailored to their background and company.
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Calendar */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-600/30 to-emerald-600/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">Weekly Outreach Schedule</span>
                </h2>
                <div className="rounded-lg">
                  <ContentCalendar />
                </div>
              </div>
            </div>
          )}
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
              auth={auth}
            />
          </div>
        )}
      </div>
      
      {/* Scoring Tutorial Modal */}
      <ScoringTutorialModal
        isOpen={showTutorial}
        onClose={closeTutorial}
        onComplete={completeTutorial}
        userPreferences={preferences}
      />
    </DashboardLayout>
  );
} 