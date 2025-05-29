'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataUpload } from '@/components/shared/DataUpload';
import { DataClear } from '@/components/shared/DataClear';
import ScoringTutorialModal from '@/components/ui/ScoringTutorialModal';
import { useScoringTutorial } from '@/hooks/useScoringTutorial';
import { useUserPreferences } from '@/providers/UserPreferencesProvider';
import { Upload, Database, Info, RefreshCw, Trash2, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface TemporaryLead {
  id: string;
  name: string;
  email: string;
  company?: string;
  title?: string;
  phone?: string;
  linkedinUrl?: string;
  source?: string;
  score?: number;
  insights?: any;
}

export default function DataInputPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [temporaryLeads, setTemporaryLeads] = useState<TemporaryLead[]>([]);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Scoring tutorial integration
  const {
    showTutorial,
    triggerTutorialAfterUpload,
    completeTutorial,
    closeTutorial
  } = useScoringTutorial();

  // Get user preferences for tutorial personalization
  const userPreferences = useUserPreferences();

  // Load temporary leads from localStorage on mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      try {
        const savedLeads = localStorage.getItem('temporary-leads');
        if (savedLeads) {
          const leads = JSON.parse(savedLeads);
          setTemporaryLeads(leads);
        }
      } catch (error) {
        console.error('Error loading temporary leads:', error);
      }
    }
  }, [status]);

  const handleClearComplete = () => {
    // Force a router refresh to update the UI
    router.refresh();
    // Show success message
    toast.success('All leads cleared successfully');
  };

  const handleUploadComplete = (uploadedLeads?: TemporaryLead[]) => {
    console.log('[DataInput] handleUploadComplete called');
    console.log('[DataInput] Session status:', status);
    console.log('[DataInput] Uploaded leads count:', uploadedLeads?.length || 0);
    
    if (status === 'authenticated') {
      console.log('[DataInput] Processing authenticated user upload');
      // Authenticated user - normal flow
      router.refresh();
      toast.success('Leads uploaded successfully!');
      
      // Set a flag that leads were uploaded and tutorial should show on dashboard visit
      if (uploadedLeads && uploadedLeads.length > 0) {
        try {
          localStorage.setItem('tutorial-trigger-on-dashboard', 'true');
        } catch (error) {
          console.warn('[DataInput] Failed to set tutorial trigger flag:', error);
        }
      }
    } else {
      console.log('[DataInput] Processing unauthenticated user upload');
      // Unauthenticated user - save temporarily and show sign-in prompt
      if (uploadedLeads && uploadedLeads.length > 0) {
        try {
          console.log('[DataInput] Saving', uploadedLeads.length, 'leads to localStorage');
          localStorage.setItem('temporary-leads', JSON.stringify(uploadedLeads));
          setTemporaryLeads(uploadedLeads);
          setShowSignInPrompt(true);
          toast.success(`${uploadedLeads.length} leads processed! Sign in to see your results.`);
        } catch (error) {
          console.error('Error saving temporary leads:', error);
          toast.error('Error saving leads temporarily. Please try again.');
        }
      } else {
        console.log('[DataInput] No leads provided to save');
      }
    }
  };

  const handleSignInClick = () => {
    // Redirect to sign-in with callback to dashboard
    window.location.href = '/api/auth/signin/google?callbackUrl=/dashboard';
  };

  const handleContinueWithoutSignIn = () => {
    setShowSignInPrompt(false);
    // Clear temporary leads if user chooses not to sign in
    localStorage.removeItem('temporary-leads');
    setTemporaryLeads([]);
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const isAuthenticated = status === 'authenticated';

  console.log('[DataInput] Render - Session status:', status, 'isAuthenticated:', isAuthenticated);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent mb-2">Upload Your Leads</h1>
            <p className="text-gray-400">Upload and analyze your leads with AI-powered scoring</p>
          </div>
          <div className="text-gray-300 px-4 py-2.5 bg-gradient-to-r from-gray-800/60 to-gray-700/40 rounded-lg border border-gray-700/50 text-sm flex items-center gap-2 backdrop-blur-sm">
            <Upload className="h-4 w-4 text-blue-400" />
            <span>{isAuthenticated ? 'Import your lead data' : 'Try our lead scoring - no sign up required'}</span>
          </div>
        </div>

        {/* Authentication status banner for unauthenticated users */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/10 border border-blue-700/30 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm shadow-lg mb-6">
            <div className="p-2 bg-blue-600/20 rounded-lg flex-shrink-0">
              <Info className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-blue-300 font-semibold mb-1 text-sm">Ready to See Your Personalized Results</h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                Upload your leads now to see our AI analyze them based on your preferences.
              </p>
            </div>
          </div>
        )}

        {/* Sign-in prompt modal for successful upload */}
        {showSignInPrompt && temporaryLeads.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 backdrop-blur-sm">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-600/30 to-emerald-600/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                  <Upload className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent mb-2">
                  Perfect! {temporaryLeads.length} Leads Analyzed
                </h3>
                <p className="text-gray-300 mb-6">
                  Your leads have been analyzed using your personalized preferences. Sign in to view your customized dashboard, detailed lead rankings, AI-powered insights, scoring tutorial, and outreach calendar.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleSignInClick}
                    className="w-full flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white font-medium hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                      <path fill="#fff" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                      <path fill="#fff" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                      <path fill="#fff" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.7272727 L18.4363636,14.7272727 C18.1187732,16.6574066 17.2662994,18.0125889 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                      <path fill="#fff" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                    </svg>
                    Sign in to View Results
                  </button>
                  
                  <button
                    onClick={handleContinueWithoutSignIn}
                    className="w-full text-gray-400 hover:text-white text-sm"
                  >
                    Continue without signing in
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two-column layout: Upload on left, Info on right */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload Box */}
          <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/40 rounded-xl p-6 border border-gray-700/50 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Upload CSV File</h2>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-400 bg-gradient-to-r from-gray-800/60 to-gray-700/40 px-3 py-1.5 rounded-lg border border-gray-700/30">
                  {isAuthenticated ? 'Lead Import' : 'Lead Analysis'}
                </div>
                <button
                  onClick={() => router.refresh()}
                  className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-105"
                  aria-label="Refresh page"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <DataUpload 
              onUploadComplete={handleUploadComplete}
              allowUnauthenticated={!isAuthenticated}
            />
            
            {isAuthenticated && (
              <div className="mt-8 pt-6 border-t border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Clear All Leads</h3>
                    <p className="text-sm text-gray-400">
                      Remove all leads from your database
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-red-600/20 to-red-700/10 p-3 rounded-lg border border-red-700/30">
                    <DataClear onClearComplete={handleClearComplete} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - CSV Format Guide */}
          <div className="bg-blue-900/10 p-5 rounded-lg border border-blue-800/20">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-400">
                <p className="mb-4 font-medium text-gray-300">CSV Format Guide</p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="text-blue-400 font-medium mb-2 text-sm">Required Fields:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><span className="text-blue-400">name</span> - Full name</li>
                      <li><span className="text-blue-400">email</span> - Email address</li>
                      <li><span className="text-blue-400">company</span> - Company name</li>
                      <li><span className="text-blue-400">position</span> - Job title</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-green-400 font-medium mb-2 text-sm">Optional (improves AI scoring):</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><span className="text-green-400">industry</span> - Company industry</li>
                      <li><span className="text-green-400">company_size</span> - Employee count</li>
                      <li><span className="text-green-400">location</span> - Geographic location</li>
                      <li><span className="text-green-400">revenue</span> - Annual revenue</li>
                      <li><span className="text-green-400">phone</span> - Contact number</li>
                      <li><span className="text-green-400">linkedin_url</span> - LinkedIn profile</li>
                    </ul>
                  </div>
                </div>
                
                {/* Download Template Button */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/20 rounded-lg border border-blue-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 font-medium text-sm mb-1">Need the exact format?</p>
                      <p className="text-gray-400 text-xs">Download our template with all the correct column headers</p>
                    </div>
                    <a
                      href="/sample-leads.csv"
                      download="sample-leads.csv"
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Template
                    </a>
                  </div>
                </div>
                
                {!isAuthenticated && (
                  <p className="mt-4 text-blue-300 text-xs bg-blue-900/20 p-2 rounded border border-blue-800/30">
                    💡 Your leads will be analyzed but not saved until you sign in
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scoring Tutorial Modal */}
      <ScoringTutorialModal
        isOpen={showTutorial}
        onClose={closeTutorial}
        onComplete={completeTutorial}
        userPreferences={userPreferences.preferences}
      />
    </DashboardLayout>
  );
} 