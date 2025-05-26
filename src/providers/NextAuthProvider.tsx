'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';

interface NextAuthProviderProps {
  children: ReactNode;
}

export function NextAuthProvider({ children }: NextAuthProviderProps) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
} 