'use client';

import { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const ResetSettingsButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/reset-preferences', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Clear localStorage if the API tells us to
        if (data.clearLocalStorage) {
          // Clear all user preferences from localStorage
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('user-preferences-')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        // Also clear any cached onboarding completion flags and mark reset time
        localStorage.removeItem('hasVisitedDashboard');
        localStorage.setItem('lastSettingsReset', Date.now().toString());

        toast.success('Settings reset successfully! Starting onboarding...');
        
        // Small delay to show the success message, then force reload to trigger onboarding
        // Use a hard reload to clear any cached state
        setTimeout(() => {
          window.location.href = window.location.href;
        }, 1000);
      } else {
        throw new Error(data.error || 'Failed to reset settings');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error(`Failed to reset settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-900/30 rounded-full">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Reset Targeting Settings?</h3>
        </div>
        
        <p className="text-gray-300 mb-6 leading-relaxed">
          This will reset your targeting preferences and lead prioritization settings. You'll immediately go through the onboarding process again to choose:
        </p>
        
        <ul className="text-gray-400 text-sm mb-6 space-y-2 ml-4">
          <li>• <strong className="text-gray-200">Target roles:</strong> CMOs, CEOs, Marketing Directors, VPs, etc.</li>
          <li>• <strong className="text-gray-200">Company filters:</strong> Size, industry, and revenue preferences</li>
          <li>• <strong className="text-gray-200">Business info:</strong> Your company details and value proposition</li>
          <li>• <strong className="text-gray-200">Messaging:</strong> Personalized outreach templates</li>
        </ul>
        
        <p className="text-orange-300 text-sm mb-6 bg-orange-900/20 p-3 rounded-md">
          ⚠️ This will re-score all your leads based on your new preferences.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Reset Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShowConfirmDialog(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm font-medium border border-gray-600"
        title="Reset targeting preferences to change who you want to reach"
      >
        <RotateCcw className="h-4 w-4" />
        Reset Settings
      </button>

      {showConfirmDialog && <ConfirmDialog />}
    </>
  );
};

export default ResetSettingsButton; 