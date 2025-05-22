import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import { UserPreferencesProvider } from '@/providers/UserPreferencesProvider';
import { ErrorBoundary } from '@/components';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter', 
});

export const metadata: Metadata = {
  title: 'OptiLeads.ai - AI-Powered Lead Generation Platform',
  description: 'Find, score, and engage high-quality leads that are most likely to convert with our advanced AI lead management platform.',
  keywords: 'lead generation, AI, machine learning, sales, marketing, lead scoring',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-dark-navy text-white min-h-screen`}>
        <ErrorBoundary>
          <NextAuthProvider>
            <UserPreferencesProvider>
              {children}
              <Toaster />
            </UserPreferencesProvider>
          </NextAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
} 