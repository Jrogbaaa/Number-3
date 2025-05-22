'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log('[ErrorBoundary] Error caught:', error);
    console.log('[ErrorBoundary] Error info:', errorInfo);
  }

  resetApplication = (): void => {
    // Clear potentially corrupted session/storage data
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Safely clear localStorage
        try {
          if (window.localStorage) {
            Object.keys(localStorage).forEach(key => {
              if (key.includes('next-auth') || key.includes('optileads') || key.includes('props')) {
                localStorage.removeItem(key);
              }
            });
          }
        } catch (e) {
          console.log('[ErrorBoundary] Error clearing localStorage:', e);
        }

        // Safely clear sessionStorage
        try {
          if (window.sessionStorage) {
            sessionStorage.clear();
          }
        } catch (e) {
          console.log('[ErrorBoundary] Error clearing sessionStorage:', e);
        }

        // Safely clear cookies
        try {
          if (document.cookie) {
            document.cookie.split(';').forEach(cookie => {
              const [name] = cookie.trim().split('=');
              if (name && (name.includes('next-auth') || name.includes('optileads') || name.includes('props'))) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
              }
            });
          }
        } catch (e) {
          console.log('[ErrorBoundary] Error clearing cookies:', e);
        }

        console.log('[ErrorBoundary] Application state reset');
        
        // Reload the application with a slight delay
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    } catch (e) {
      console.error('[ErrorBoundary] Error during reset:', e);
      
      // Last resort - attempt a direct reload
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-dark-navy p-4 text-white">
          <div className="w-full max-w-md rounded-lg bg-navy p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-red-400">Something went wrong</h2>
            <p className="mb-6 text-gray-300">
              We encountered an error while loading the application. This might be due to corrupted session data or browser cache.
            </p>
            <div className="space-y-4">
              <button
                onClick={this.resetApplication}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Reset application data and reload"
                tabIndex={0}
              >
                Reset & Reload
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                className="w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Reload without resetting"
                tabIndex={0}
              >
                Try Again
              </button>
            </div>
            {this.state.error && process.env.NODE_ENV !== 'production' && (
              <div className="mt-6 rounded border border-red-800 bg-red-900/30 p-3 text-sm text-red-300">
                <p className="font-bold">Error details:</p>
                <p className="mt-1 font-mono text-xs">{this.state.error.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 