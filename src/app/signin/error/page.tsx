'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

// The actual content component that uses the searchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: string } = {
    default: 'There was an error signing in. Please try again.',
    configuration: 'There is a problem with the server configuration.',
    accessdenied: 'You do not have permission to sign in.',
    verification: 'The verification link was invalid or has expired.',
    OAuthSignin: 'Error in the OAuth sign-in process.',
    OAuthCallback: 'Error in the OAuth callback process.',
    OAuthCreateAccount: 'Could not create OAuth provider account.',
    EmailCreateAccount: 'Could not create email provider account.',
    Callback: 'Error in the OAuth callback handler.',
    OAuthAccountNotLinked: 'Email already exists with a different provider.',
    SessionRequired: 'You must be signed in to access this page.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.default : errorMessages.default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-navy p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-navy p-8 shadow-lg text-center">
        <div className="mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Authentication Error</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-300">{errorMessage}</p>
        </div>
        
        <div>
          <Link
            href="/signin"
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function ErrorLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-navy p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-navy p-8 shadow-lg text-center">
        <div className="animate-pulse">
          <div className="h-14 w-14 mx-auto rounded-full bg-gray-600 mb-4"></div>
          <div className="h-6 w-48 mx-auto rounded bg-gray-600 mb-6"></div>
          <div className="h-4 w-64 mx-auto rounded bg-gray-600 mb-6"></div>
          <div className="h-10 w-full rounded bg-gray-600"></div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense
export default function SignInErrorPage() {
  return (
    <Suspense fallback={<ErrorLoadingFallback />}>
      <ErrorContent />
    </Suspense>
  );
} 