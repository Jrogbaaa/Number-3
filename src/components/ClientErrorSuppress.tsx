'use client';

import { useEffect } from 'react';

export const ClientErrorSuppress = () => {
  useEffect(() => {
    // Suppress NextAuth CLIENT_FETCH_ERROR in production and development
    // This error occurs in incognito mode and doesn't affect functionality
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Check if this is a NextAuth CLIENT_FETCH_ERROR
      const message = args.join(' ');
      if (message.includes('CLIENT_FETCH_ERROR') || 
          message.includes('Not authenticated') ||
          message.includes('next-auth')) {
        // Log a less intrusive warning instead
        console.warn('NextAuth: Session check failed (this is normal in incognito mode)');
        return;
      }
      // Call original console.error for other errors
      originalError.apply(console, args);
    };

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalError;
    };
  }, []);

  // This component doesn't render anything
  return null;
}; 