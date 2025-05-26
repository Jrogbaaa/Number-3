'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserPreferences } from '@/types/user';

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  hasCompletedOnboarding: boolean;
  currentOnboardingStep: number;
  setOnboardingStep: (step: number) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

interface UserPreferencesProviderProps {
  children: ReactNode;
}

// Default preferences when the table doesn't exist yet or we can't access it
const DEFAULT_PREFERENCES: UserPreferences = {
  id: 'default',
  userId: '',
  hasCompletedOnboarding: false,
  onboardingStep: 1,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Helper to convert snake_case to camelCase for our app
const snakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  return Object.keys(obj).reduce((acc: any, key) => {
    // Convert keys from snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Handle specific date fields
    if (key === 'created_at' || key === 'updated_at') {
      acc[camelKey] = new Date(obj[key]);
    } else {
      // Recursively convert nested objects
      acc[camelKey] = snakeToCamel(obj[key]);
    }
    
    // Debug logging for the specific field we're having trouble with
    if (key === 'has_completed_onboarding') {
      console.log('[UserPreferencesProvider] Converting has_completed_onboarding:', obj[key], 'to hasCompletedOnboarding:', acc[camelKey]);
    }
    
    return acc;
  }, {});
};

// Helper to convert camelCase to snake_case for database operations
const camelToSnake = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  return Object.keys(obj).reduce((acc: any, key) => {
    // Convert keys from camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    // Handle specific date fields
    if (key === 'createdAt' || key === 'updatedAt') {
      acc[snakeKey] = obj[key].toISOString();
    } else {
      // Recursively convert nested objects
      acc[snakeKey] = camelToSnake(obj[key]);
    }
    
    return acc;
  }, {});
};

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(status === 'authenticated');
  const [error, setError] = useState<string | null>(null);
  const [useLocalStorage, setUseLocalStorage] = useState<boolean>(false);
  const [isIncognitoDetected, setIsIncognitoDetected] = useState<boolean>(false);

  // Check if we're in incognito mode
  useEffect(() => {
    const checkIncognito = async () => {
      try {
        // A simple way to detect incognito is to try writing to localStorage
        const testKey = `test_${Math.random()}`;
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        setIsIncognitoDetected(false);
      } catch (e) {
        console.log('Local storage not available, likely in incognito mode');
        setIsIncognitoDetected(true);
        setUseLocalStorage(false); // Can't use localStorage in incognito
        setError('You appear to be in incognito mode. Some features may be limited.');
      }
    };
    
    checkIncognito();
  }, []);

  // Load preferences from localStorage if available (for fallback)
  const loadFromLocalStorage = (userIdParam?: string) => {
    const sessionAny = session as any;
    const userId = userIdParam || session?.user?.id || sessionAny?.user?.sub || sessionAny?.nextAuth?.user?.id || sessionAny?.supabase?.user?.id;
    
    if (!userId || isIncognitoDetected) return null;
    
    try {
      // Try loading with the original user ID
      const localPrefs = localStorage.getItem(`user-preferences-${userId}`);
      
      if (localPrefs) {
        const parsedPrefs = JSON.parse(localPrefs);
        console.log('[UserPreferencesProvider] Loaded preferences from localStorage:', parsedPrefs);
        
        // Ensure the userId in the preferences matches the session userId
        // This handles cases where the backend might have transformed the ID
        parsedPrefs.userId = userId;
        
        return parsedPrefs;
      }
    } catch (err) {
      console.error('[UserPreferencesProvider] Error parsing local preferences:', err);
    }
    
    // Return default preferences if nothing in localStorage
    return {
      ...DEFAULT_PREFERENCES,
      userId: userId
    };
  };

  // Check if onboarding was completed in localStorage (to prevent reset)
  const checkOnboardingCompletionInLocalStorage = (userIdParam?: string) => {
    const sessionAny = session as any;
    const userId = userIdParam || session?.user?.id || sessionAny?.user?.sub || sessionAny?.nextAuth?.user?.id || sessionAny?.supabase?.user?.id;
    
    if (!userId || isIncognitoDetected) return false;
    
    try {
      const localPrefs = localStorage.getItem(`user-preferences-${userId}`);
      if (localPrefs) {
        const parsedPrefs = JSON.parse(localPrefs);
        return parsedPrefs.hasCompletedOnboarding || false;
      }
    } catch (err) {
      console.error('[UserPreferencesProvider] Error checking onboarding completion:', err);
    }
    
    return false;
  };

  // Save preferences to localStorage as backup
  const saveToLocalStorage = (prefs: UserPreferences, userIdParam?: string) => {
    const sessionAny = session as any;
    const userId = userIdParam || session?.user?.id || sessionAny?.user?.sub || sessionAny?.nextAuth?.user?.id || sessionAny?.supabase?.user?.id;
    
    if (!userId || isIncognitoDetected) return;
    
    try {
      localStorage.setItem(
        `user-preferences-${userId}`,
        JSON.stringify(prefs)
      );
    } catch (err) {
      console.error('[UserPreferencesProvider] Error saving to localStorage:', err);
    }
  };

  // Fetch user preferences when session is available
  useEffect(() => {
    // Extract user ID from different possible locations in the session
    const sessionAny = session as any; // Type assertion to access extended properties
    const userId = session?.user?.id || sessionAny?.user?.sub || sessionAny?.nextAuth?.user?.id || sessionAny?.supabase?.user?.id;
    
    // Skip fetching if not authenticated - critical fix for auth flow
    if (status !== 'authenticated' || !userId) {
      console.log('[UserPreferencesProvider] Skipping fetch - status:', status, 'userId:', userId);
      console.log('[UserPreferencesProvider] Full session object:', session);
      setLoading(false);
      return;
    }
    
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        console.log('[UserPreferencesProvider] Fetching preferences for user:', userId);
        console.log('[UserPreferencesProvider] Current useLocalStorage flag:', useLocalStorage);
        
        // Always try to load from localStorage first as a backup
        const localPrefs = loadFromLocalStorage(userId);
        console.log('[UserPreferencesProvider] LocalPrefs loaded:', localPrefs);
        
        if (useLocalStorage) {
          // If we already know we should use localStorage, don't try the API
          console.log('[UserPreferencesProvider] Using localStorage mode');
          setPreferences(localPrefs);
          setLoading(false);
          return;
        }
        
        try {
          // Try the API
          const response = await fetch(`/api/user-preferences`, {
            credentials: 'include', // Include cookies for session
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('[UserPreferencesProvider] API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch user preferences');
          }
          
          const data = await response.json();
          console.log('[UserPreferencesProvider] Successfully fetched preferences from API:', data);
          console.log('[UserPreferencesProvider] Raw API data has_completed_onboarding:', data.has_completed_onboarding);
          
          // Convert from snake_case (from DB) to camelCase (for our app)
          const camelCaseData = snakeToCamel(data);
          console.log('[UserPreferencesProvider] After camelCase conversion - hasCompletedOnboarding:', camelCaseData.hasCompletedOnboarding);
          
          // Ensure the userId in the preferences matches the session userId
          // This handles cases where the backend might have transformed the ID
          camelCaseData.userId = userId;
          
          console.log('[UserPreferencesProvider] Final preferences object:', camelCaseData);
          setPreferences(camelCaseData);
          
          // Also save to localStorage as backup (if not in incognito)
          if (!isIncognitoDetected) {
            saveToLocalStorage(camelCaseData, userId);
          }
        } catch (apiError) {
          console.error('[UserPreferencesProvider] API error, falling back to localStorage:', apiError);
          
          // Set user-friendly error message
          const errorMessage = apiError instanceof Error 
            ? apiError.message 
            : 'Failed to fetch user preferences';
          
          setError(errorMessage.includes('table') 
            ? 'Database table not ready. Using local storage fallback.' 
            : errorMessage);
          
          // Set flag to use localStorage if it's available
          if (!isIncognitoDetected) {
            setUseLocalStorage(true);
            // Use the localPrefs we loaded earlier
            setPreferences(localPrefs);
          } else {
            // In incognito mode without API, preserve onboarding completion if it exists
            const hadCompletedOnboarding = checkOnboardingCompletionInLocalStorage(userId);
            setPreferences({
              ...DEFAULT_PREFERENCES,
              userId: userId || 'anonymous',
              hasCompletedOnboarding: hadCompletedOnboarding,
              onboardingStep: hadCompletedOnboarding ? 7 : DEFAULT_PREFERENCES.onboardingStep
            });
          }
          
          // Try to run the check-table script in the background
          fetch('/api/migration-status').catch(e => {
            console.error('[UserPreferencesProvider] Migration check failed:', e);
          });
        }
      } catch (err) {
        console.error('[UserPreferencesProvider] Error fetching user preferences:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        
        // Fall back to localStorage or memory
        if (!isIncognitoDetected) {
          setUseLocalStorage(true);
          const localPrefs = loadFromLocalStorage(userId);
          setPreferences(localPrefs);
        } else {
          // In incognito mode, preserve onboarding completion if it exists
          const hadCompletedOnboarding = checkOnboardingCompletionInLocalStorage(userId);
          setPreferences({
            ...DEFAULT_PREFERENCES,
            userId: userId || 'anonymous',
            hasCompletedOnboarding: hadCompletedOnboarding,
            onboardingStep: hadCompletedOnboarding ? 7 : DEFAULT_PREFERENCES.onboardingStep
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [status, useLocalStorage, isIncognitoDetected, session]);

  const updatePreferences = async (newPrefs: Partial<UserPreferences>): Promise<void> => {
    try {
      setLoading(true);
      
      // Extract user ID from session
      const sessionAny = session as any;
      const userId = session?.user?.id || sessionAny?.user?.sub || sessionAny?.nextAuth?.user?.id || sessionAny?.supabase?.user?.id;
      
      // Check if user is authenticated
      const isAuthenticated = !!userId;
      
      // Get current preferences to merge with
      const currentPrefs = preferences || {
        ...DEFAULT_PREFERENCES,
        userId: userId || 'anonymous-user' // Always use a string value
      };
      
      // Merge with new preferences
      const mergedPrefs = {
        ...currentPrefs,
        ...newPrefs,
        updatedAt: new Date()
      };
      
      // If not authenticated or in localStorage mode, save to localStorage
      if (!isAuthenticated || useLocalStorage || isIncognitoDetected) {
        console.log('[UserPreferencesProvider] User not authenticated or using local storage mode, saving preferences locally');
        
        if (!isIncognitoDetected) {
          // Save to localStorage if not in incognito
          saveToLocalStorage(mergedPrefs, userId);
        }
        
        // Update state
        setPreferences(mergedPrefs);
        setLoading(false);
        return;
      }
      
      // If we got here, user is authenticated and we're not in localStorage mode
      
      // Always update localStorage as backup (if not in incognito)
      if (!isIncognitoDetected) {
        saveToLocalStorage(mergedPrefs, userId);
      }
      
      try {
        // Try to update via API
        // Convert to snake_case for the API
        const snakeCasePrefs = camelToSnake(newPrefs);
        
        const response = await fetch('/api/user-preferences', {
          method: 'PUT',
          credentials: 'include', // Include cookies for session
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(snakeCasePrefs),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update user preferences');
        }

        const updatedData = await response.json();
        const camelCaseUpdated = snakeToCamel(updatedData);
        setPreferences(camelCaseUpdated);
        
        // Also update localStorage backup (if not in incognito)
        if (!isIncognitoDetected) {
          saveToLocalStorage(camelCaseUpdated, userId);
        }
      } catch (apiError) {
        console.error('[UserPreferencesProvider] API update error, falling back to localStorage:', apiError);
        setError(apiError instanceof Error ? apiError.message : 'Failed to update user preferences');
        
        // Set flag to use localStorage for future operations (if not in incognito)
        if (!isIncognitoDetected) {
          setUseLocalStorage(true);
        }
        
        // Keep the merged preferences in state
        setPreferences(mergedPrefs);
      }
    } catch (err) {
      console.error('[UserPreferencesProvider] Error updating user preferences:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setOnboardingStep = async (step: number): Promise<void> => {
    return updatePreferences({ onboardingStep: step });
  };

  const completeOnboarding = async (): Promise<void> => {
    return updatePreferences({
      hasCompletedOnboarding: true,
      onboardingStep: 7, // 'complete' step
    });
  };

  const hasCompletedOnboarding = preferences?.hasCompletedOnboarding ?? false;
  const currentOnboardingStep = preferences?.onboardingStep ?? 1;

  const value = {
    preferences,
    loading,
    error,
    updatePreferences,
    hasCompletedOnboarding,
    currentOnboardingStep,
    setOnboardingStep,
    completeOnboarding
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}; 