'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    // Show a short message and then redirect to dashboard
    toast.success('Authentication bypassed for demo purposes');
    
    // Short delay for toast to show before redirect
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-navy p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-navy p-8 shadow-lg text-center">
        <div className="animate-pulse">
          <p className="text-lg text-white">Bypassing authentication...</p>
          <p className="mt-2 text-sm text-gray-400">Redirecting to dashboard</p>
        </div>
      </div>
    </div>
  );
} 