'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * AuthSync Component
 * 
 * This component synchronizes authentication between NextAuth and Supabase.
 * It ensures the user session is properly synchronized across both auth systems.
 */
export function AuthSync() {
  const { data: session, status } = useSession();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncAttempts, setSyncAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Don't run if we're in the server environment
    if (typeof window === 'undefined') return;

    const syncAuth = async () => {
      // Only sync when we have an authenticated NextAuth session
      if (status !== 'authenticated' || !session) {
        return;
      }

      // Prevent infinite loop of sync attempts
      if (syncAttempts > 3) {
        console.error('AuthSync: Too many sync attempts, giving up');
        setSyncStatus('error');
        setError('Failed to synchronize auth after multiple attempts');
        signOut({ callbackUrl: '/signin?error=sync_failed' });
        return;
      }

      setSyncStatus('syncing');
      setError(null);
      
      try {
        console.log('AuthSync: Synchronizing NextAuth session with backend');
        
        // Call our server API to establish a synchronized session
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to synchronize session');
        }
        
        const sessionData = await response.json();
        
        if (sessionData.authenticated) {
          console.log('AuthSync: Session synchronized successfully');
          setSyncStatus('synced');
          setSyncAttempts(0); // Reset attempt counter on success
        } else {
          // Increment attempt counter
          setSyncAttempts(prev => prev + 1);
          
          console.warn('AuthSync: Session synchronization failed, retrying...');
          setSyncStatus('error');
          setError('Authentication sync failed');
          
          // Short delay before retry
          setTimeout(syncAuth, 1000);
        }
      } catch (err) {
        console.error('AuthSync: Error synchronizing sessions:', err);
        setSyncStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error during auth sync');
        
        // Increment attempt counter
        setSyncAttempts(prev => prev + 1);
        
        // Short delay before retry
        setTimeout(syncAuth, 1000);
      }
    };

    syncAuth();
  }, [session, status, syncAttempts, router]);

  // This component doesn't render anything visible
  return null;
} 