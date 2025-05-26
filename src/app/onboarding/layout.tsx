import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OptiLeads - Complete Your Onboarding',
  description: 'Set up your preferences to get the most out of OptiLeads lead management platform',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 