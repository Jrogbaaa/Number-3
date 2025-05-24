'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataUpload } from '@/components/shared/DataUpload';
import { DataClear } from '@/components/shared/DataClear';
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-semibold">Upload Leads</h1>
          </div>
          <div className="text-gray-400 px-3 py-1.5 bg-gray-800/70 rounded-md border border-gray-700/50 text-sm flex items-center gap-1.5">
            <Upload className="h-4 w-4" />
            <span>{isAuthenticated ? 'Import your lead data' : 'Try our lead scoring - no sign up required'}</span>
          </div>
        </div>

        {/* Authentication status banner for unauthenticated users */}
        {!isAuthenticated && (
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-blue-300 font-medium mb-1">Ready to See Your Personalized Results</h3>
              <p className="text-gray-300 text-sm">
                Upload your leads now to see our AI analyze them based on your preferences. You'll get personalized lead scores, insights, and recommendations tailored to your business.
              </p>
            </div>
          </div>
        )}

        {/* Sign-in prompt modal for successful upload */}
        {showSignInPrompt && temporaryLeads.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Perfect! {temporaryLeads.length} Leads Analyzed
                </h3>
                <p className="text-gray-300 mb-6">
                  Your leads have been analyzed using your personalized preferences. Sign in to view your customized dashboard, detailed lead rankings, AI-powered insights, and outreach calendar.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleSignInClick}
                    className="w-full flex items-center justify-center gap-3 rounded-md bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
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

        <div className="bg-gray-900/70 rounded-xl p-6 border border-gray-800/50 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">Upload CSV File</h2>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 bg-gray-800/70 px-2 py-1 rounded">
                {isAuthenticated ? 'Lead Import' : 'Lead Analysis'}
              </div>
              <button
                onClick={() => router.refresh()}
                className="p-1.5 text-blue-400 hover:bg-blue-900/20 rounded-md"
                aria-label="Refresh page"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-blue-900/10 p-4 rounded-lg mb-6 border border-blue-800/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-400">
              <p>Upload your leads in CSV format. The file should include the following columns:</p>
              <ul className="list-disc list-inside mt-2 ml-1 space-y-1">
                <li><span className="text-blue-400">name</span> - Full name of the lead</li>
                <li><span className="text-blue-400">email</span> - Contact email address</li>
                <li><span className="text-blue-400">company</span> - Company name (optional)</li>
                <li><span className="text-blue-400">position</span> - Job title (optional)</li>
              </ul>
              {!isAuthenticated && (
                <p className="mt-2 text-blue-300 text-xs">
                  💡 Your leads will be analyzed but not saved until you sign in
                </p>
              )}
            </div>
          </div>
          
          <DataUpload 
            onUploadComplete={handleUploadComplete}
            allowUnauthenticated={!isAuthenticated}
          />
          
          {isAuthenticated && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex flex-col">
                <h3 className="text-lg font-medium mb-3">Data Management</h3>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400 max-w-lg">
                    If you're experiencing issues with data not clearing properly, use this button to clear all leads from the database. This action cannot be undone.
                  </p>
                  <DataClear onClearComplete={handleClearComplete} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 