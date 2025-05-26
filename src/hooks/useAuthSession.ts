import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Hook to check authentication status from both NextAuth and Supabase
 * This provides a unified way to check if a user is authenticated across both systems
 */
export function useAuthSession() {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isFullyAuthenticated, setIsFullyAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (nextAuthStatus === 'loading') {
          return; // Wait for NextAuth to initialize
        }
        
        if (nextAuthStatus !== 'authenticated' || !nextAuthSession) {
          setIsFullyAuthenticated(false);
          return;
        }
        
        // NextAuth is authenticated, now check Supabase via our API
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch auth session');
        }
        
        const sessionData = await response.json();
        setSupabaseUser(sessionData.supabase?.user || null);
        setIsFullyAuthenticated(
          sessionData.authenticated && 
          !!sessionData.supabase?.hasSession
        );
        
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError(err instanceof Error ? err.message : 'Authentication check failed');
        setIsFullyAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [nextAuthSession, nextAuthStatus]);

  return {
    isLoading,
    error,
    nextAuthSession,
    nextAuthStatus,
    supabaseUser,
    isFullyAuthenticated,
    // Return combined authentication state for ease of use
    isAuthenticated: nextAuthStatus === 'authenticated' && isFullyAuthenticated,
  };
} 