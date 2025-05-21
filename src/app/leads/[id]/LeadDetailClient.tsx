'use client';

import React, { useEffect, useState } from 'react';
import { Lead } from '@/types/lead';
// import { OutreachTimeEnricher } from "@/components/OutreachTimeEnricher"; // Uncomment if used
// import { LeadsAPI } from '@/lib/api'; // Assuming LeadsAPI is defined here

type LeadDetailClientProps = {
  id: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function LeadDetailClient({ id, searchParams }: LeadDetailClientProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace this placeholder with your actual API call to fetch lead data
        // Example using LeadsAPI (uncomment relevant imports above):
        // const fetchedLead = await LeadsAPI.getById(id);
        // if (!fetchedLead) {
        //   throw new Error('Lead not found');
        // }
        // setLead(fetchedLead);

        // --- Mock Data Placeholder --- 
        // Remove this section when you have your actual API call
        console.log(`Fetching lead with id: ${id}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        const mockLead: Lead = {
          id: id,
          name: `Lead ${id}`,
          title: `Mock Title for Lead ${id}`,
          email: `lead${id}@example.com`,
          status: 'New',
          score: 50,
          value: 1000,
          created_at: new Date().toISOString(),
          // updated_at: new Date().toISOString(), // Removed as it might not be in the Lead type
          // Add other necessary fields from your Lead type
          company: 'Mock Company',
          source: 'Website', // Using a valid LeadSource value
          location: 'Mock Location',
          timezone: 'UTC',
          optimalOutreachTime: '10:00 AM - 12:00 PM'
        };
        setLead(mockLead);
        // --- End Mock Data Placeholder --- 

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lead data');
        console.error("Error fetching lead:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLead();
    } else {
      setError('Lead ID is missing.');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="p-4">Loading lead details...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!lead) {
    return <div className="p-4">Lead not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lead Details: {lead.name}</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <p><strong>ID:</strong> {lead.id}</p>
        <p><strong>Email:</strong> {lead.email}</p>
        <p><strong>Status:</strong> {lead.status}</p>
        <p><strong>Score:</strong> {lead.score}</p>
        <p><strong>Value:</strong> {lead.value}</p>
        {/* TODO: Add other lead details display here */}

        {/* TODO: Integrate OutreachTimeEnricher here if needed */}
        {/* Example:
        <div className="mt-6">
          <OutreachTimeEnricher
            leadId={lead.id}
            companyName={lead.company || ""}
            initialLocation={lead.location || ""}
            initialTimezone={lead.timezone || ""}
            initialOutreachTime={lead.optimalOutreachTime || ""}
            onUpdate={(data) => {
              console.log("Lead location data updated:", data);
              setLead(prevLead => prevLead ? { ...prevLead, ...data } : null);
            }}
          />
        </div>
        */}
      </div>
    </div>
  );
} 