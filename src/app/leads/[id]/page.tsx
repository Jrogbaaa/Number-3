import { Suspense } from 'react';
import LeadDetailClient from './LeadDetailClient';

// Define the expected props structure for server component in Next.js 15
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
};

// Server component that resolves the promise and passes data to client component
export default async function LeadDetailPage({ params, searchParams }: PageProps) {
  // Await the params to get the id
  const { id } = await params;
  
  return (
    <Suspense fallback={<div className="p-4">Loading lead details...</div>}>
      <LeadDetailClient id={id} searchParams={searchParams} />
    </Suspense>
  );
} 