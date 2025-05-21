import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '@/providers/SessionProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter', 
});

export const metadata: Metadata = {
  title: 'PROPS - Lead Management Platform',
  description: 'AI-powered insights and outreach automation for lead management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-dark-navy text-white min-h-screen`}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
} 