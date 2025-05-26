'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

// Define AuthStatus type
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  authStatus: AuthStatus;
  syncWithBackend: () => Promise<boolean>;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  authStatus: 'loading',
  syncWithBackend: async () => false,
  error: null
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  
  // Function to sync with backend - can be called from any component
  const syncWithBackend = async (): Promise<boolean> => {
    try {
      // Skip sync if not authenticated
      if (status !== 'authenticated' || !session) {
        return false;
      }
      
      // Call our server API to establish a synchronized session
      const response = await fetch('/api/auth/session');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to synchronize session');
      }
      
      const sessionData = await response.json();
      
      if (sessionData.authenticated) {
        setAuthStatus('authenticated');
        setError(null);
        return true;
      } else {
        setAuthStatus('error');
        setError('Authentication sync failed');
        return false;
      }
    } catch (err) {
      console.error('AuthProvider: Error synchronizing sessions:', err);
      setAuthStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error during auth sync');
      return false;
    }
  };
  
  // Main effect to run auth sync when session changes
  useEffect(() => {
    // Skip sync on server side
    if (typeof window === 'undefined') return;
    
    if (status === 'loading') {
      setAuthStatus('loading');
    } else if (status === 'authenticated' && session) {
      setAuthStatus('authenticated');
      syncWithBackend().catch(err => {
        console.error('Failed to sync with backend:', err);
      });
    } else {
      setAuthStatus('unauthenticated');
    }
  }, [session, status]);
  
  // Provide the auth context
  return (
    <AuthContext.Provider value={{
      isAuthenticated: authStatus === 'authenticated',
      authStatus,
      syncWithBackend,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
} 