import { useState, useEffect } from 'react';

const TUTORIAL_STORAGE_KEY = 'scoring-tutorial-completed';
const TUTORIAL_TRIGGER_KEY = 'tutorial-trigger-on-dashboard';

export const useScoringTutorial = () => {
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user has seen the tutorial before
  useEffect(() => {
    const checkTutorialStatus = () => {
      try {
        const tutorialCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY);
        const hasSeen = tutorialCompleted === 'true';
        setHasSeenTutorial(hasSeen);
        setIsLoading(false);
        console.log('[ScoringTutorial] Tutorial status loaded:', { hasSeen });
      } catch (error) {
        console.warn('[ScoringTutorial] Failed to load tutorial status:', error);
        setHasSeenTutorial(false);
        setIsLoading(false);
      }
    };

    checkTutorialStatus();
  }, []);

  // Check if tutorial should show on dashboard visit
  const checkForDashboardTrigger = () => {
    if (isLoading) return false;
    
    try {
      const shouldTrigger = localStorage.getItem(TUTORIAL_TRIGGER_KEY);
      console.log('[ScoringTutorial] Checking dashboard trigger:', {
        shouldTrigger,
        hasSeenTutorial,
        showTutorial
      });
      
      // Only show if they haven't seen it, trigger flag is set, and not already showing
      if (!hasSeenTutorial && shouldTrigger === 'true' && !showTutorial) {
        console.log('[ScoringTutorial] Showing tutorial on dashboard visit');
        setShowTutorial(true);
        // Clear the trigger flag so it doesn't show again
        localStorage.removeItem(TUTORIAL_TRIGGER_KEY);
        return true;
      }
    } catch (error) {
      console.warn('[ScoringTutorial] Failed to check dashboard trigger:', error);
    }
    
    return false;
  };

  // Legacy function for backward compatibility - now just checks dashboard trigger
  const triggerTutorialAfterUpload = (leadCount: number) => {
    console.log('[ScoringTutorial] triggerTutorialAfterUpload called (legacy) - checking dashboard trigger instead');
    return checkForDashboardTrigger();
  };

  // Trigger tutorial when settings are reset
  const triggerTutorialAfterReset = () => {
    console.log('[ScoringTutorial] Showing tutorial after settings reset');
    setShowTutorial(true);
    // Clear the tutorial completion flag since settings were reset
    try {
      localStorage.removeItem(TUTORIAL_STORAGE_KEY);
      setHasSeenTutorial(false);
    } catch (error) {
      console.warn('[ScoringTutorial] Failed to clear tutorial status:', error);
    }
  };

  // Mark tutorial as completed
  const completeTutorial = () => {
    console.log('[ScoringTutorial] Tutorial completed by user');
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
      setHasSeenTutorial(true);
      setShowTutorial(false);
      // Also clear any pending dashboard trigger
      localStorage.removeItem(TUTORIAL_TRIGGER_KEY);
    } catch (error) {
      console.warn('[ScoringTutorial] Failed to save tutorial completion:', error);
    }
  };

  // Close tutorial without marking as completed (user can see it again)
  const closeTutorial = () => {
    console.log('[ScoringTutorial] Tutorial closed without completion');
    setShowTutorial(false);
  };

  // Reset tutorial state (for testing or admin purposes)
  const resetTutorial = () => {
    console.log('[ScoringTutorial] Tutorial state reset');
    try {
      localStorage.removeItem(TUTORIAL_STORAGE_KEY);
      localStorage.removeItem(TUTORIAL_TRIGGER_KEY);
      setHasSeenTutorial(false);
      setShowTutorial(false);
    } catch (error) {
      console.warn('[ScoringTutorial] Failed to reset tutorial:', error);
    }
  };

  return {
    hasSeenTutorial,
    showTutorial,
    isLoading,
    triggerTutorialAfterUpload,
    triggerTutorialAfterReset,
    checkForDashboardTrigger,
    completeTutorial,
    closeTutorial,
    resetTutorial
  };
};

// Export a test function for manual testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testScoringTutorial = () => {
    console.log('[ScoringTutorial] Manual test triggered');
    localStorage.removeItem('scoring-tutorial-completed');
    localStorage.setItem('tutorial-trigger-on-dashboard', 'true');
    window.location.reload();
  };
  
  // Add manual trigger for testing reset scenario
  (window as any).testScoringTutorialAfterReset = () => {
    console.log('[ScoringTutorial] Manual reset test triggered');
    localStorage.removeItem('scoring-tutorial-completed');
    localStorage.setItem('lastSettingsReset', Date.now().toString());
    window.location.reload();
  };
} 