'use client';

import { AuthSync } from '@/components/AuthSync';

/**
 * A simple wrapper component for AuthSync
 * Used to ensure AuthSync only runs on the client-side
 */
export function AuthSyncWrapper() {
  return <AuthSync />;
} 