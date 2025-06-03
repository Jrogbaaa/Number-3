import { useState, useEffect } from 'react';

const TUTORIAL_STORAGE_KEY = 'scoring-tutorial-completed';

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

  // Trigger tutorial for first-time users after lead upload
  const triggerTutorialAfterUpload = (leadCount: number) => {
    if (isLoading) return;
    
    console.log('[ScoringTutorial] Checking if tutorial should show after upload:', {
      leadCount,
      hasSeenTutorial,
      showTutorial
    });

    // Only show if they haven't seen it and this is their first upload with leads
    if (!hasSeenTutorial && leadCount > 0 && !showTutorial) {
      console.log('[ScoringTutorial] Showing tutorial after first upload');
      setShowTutorial(true);
    }
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