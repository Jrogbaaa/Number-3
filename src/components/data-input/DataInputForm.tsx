'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
import { Lead } from '@/types/lead';
import { uploadLeads } from '@/lib/supabase';

interface CSVRow {
  // LinkedIn specific fields - using exact header names from LinkedIn export
  'First Name'?: string;
  'Last Name'?: string;
  'Email Address'?: string;
  'Company'?: string;
  'Position'?: string;
  'Connected On'?: string;
  // Add potential location headers
  'Location'?: string;
  'City'?: string;
  'Region'?: string;
  'Country'?: string;
  'Address'?: string;
  [key: string]: string | undefined; // Allow for any other headers
}

const cleanupHeaderName = (header: string): string => {
  // Remove any non-alphanumeric characters and convert to lowercase
  return header.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

const findHeaderVariation = (row: CSVRow, variations: string[]): string | undefined => {
  for (const variation of variations) {
    if (row[variation] !== undefined) {
      return row[variation];
    }
  }
  return undefined;
};

const calculateLeadScore = (row: CSVRow): number => {
  let score = 50; // Base score

  // Adjust score based on position seniority
  const position = findHeaderVariation(row, ['Position', 'Title', 'Job Title'])?.toLowerCase() || '';
  if (position.includes('ceo') || position.includes('founder') || position.includes('owner')) {
    score += 30;
  } else if (position.includes('director') || position.includes('head')) {
    score += 25;
  } else if (position.includes('manager') || position.includes('lead')) {
    score += 20;
  }

  // Adjust score based on company
  if (findHeaderVariation(row, ['Company', 'Organization'])) {
    score += 10;
  }

  return Math.min(100, score);
};

const calculateLeadValue = (row: CSVRow): number => {
  let value = 1000; // Base value

  // Adjust value based on position seniority
  const position = findHeaderVariation(row, ['Position', 'Title', 'Job Title'])?.toLowerCase() || '';
  if (position.includes('ceo') || position.includes('founder') || position.includes('owner')) {
    value *= 3;
  } else if (position.includes('director') || position.includes('head')) {
    value *= 2.5;
  } else if (position.includes('manager') || position.includes('lead')) {
    value *= 2;
  }

  return Math.round(value / 100) * 100;
};

export const DataInputForm = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('Please select a CSV file');
      return;
    }

    const file = acceptedFiles[0];
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Processing your CSV file...');

    try {
      const results = await new Promise<CSVRow[]>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => {
            // Keep original header names
            return header.trim();
          },
          complete: (results) => {
            console.log('CSV Headers:', results.meta.fields);
            // console.log('First row sample:', results.data[0]);
            resolve(results.data as CSVRow[]);
          },
          error: (error) => reject(error),
        });
      });

      if (results.length === 0) {
        throw new Error('The CSV file is empty');
      }

      toast.loading(`Processing ${results.length} leads... Location lookups may take time.`, { id: toastId });

      // --- Process leads asynchronously to allow for location lookup ---
      const leadProcessingPromises = results.map(async (row, index): Promise<Lead | null> => {
        try {
          // Get name from various possible header combinations
          const firstName = findHeaderVariation(row, ['First Name', 'FirstName', 'First']) || '';
          const lastName = findHeaderVariation(row, ['Last Name', 'LastName', 'Last', 'last_name']) || '';
          const fullName = firstName && lastName ? `${firstName} ${lastName}` :
                          findHeaderVariation(row, ['Full Name', 'Name']) ||
                          `${firstName}${lastName}`;

          const company = findHeaderVariation(row, ['Company', 'Organization', 'company_name']) || '';
          
          // Attempt to find location header first
          let location = findHeaderVariation(row, ['Location', 'City', 'Region', 'Country', 'Address']) || '';

          const leadPartial: Omit<Lead, 'location'> & { location?: string } = { // Use partial type initially
            id: crypto.randomUUID(),
            name: fullName.trim() || 'Unknown',
            email: findHeaderVariation(row, ['Email Address', 'Email', 'E-mail']) || '',
            company: company,
            title: findHeaderVariation(row, ['Position', 'Title', 'Job Title']) || '',
            source: 'LinkedIn', // Assuming LinkedIn source for this form
            status: 'New',
            score: calculateLeadScore(row),
            value: calculateLeadValue(row),
            created_at: new Date().toISOString(),
            last_contacted_at: findHeaderVariation(row, ['Connected On', 'Connection Date']) || undefined,
            // Location is handled below
          };

          // --- Location Lookup Logic via API Route ---
          if (!location && company) {
            console.log(`Location missing for ${leadPartial.name} at ${company}. Calling API route...`);
            try {
              const response = await fetch('/api/enrich-lead-location', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ companyName: company }),
              });

              if (!response.ok) {
                console.error(`API Error for ${company}: ${response.status} ${response.statusText}`);
                // Log response body if possible
                try { console.error(await response.text()); } catch (_) {}
              } else {
                const data = await response.json();
                if (data.location) {
                  console.log(`API returned location for ${company}: ${data.location}`);
                  location = data.location; // Update location if found
                }
              }
            } catch (fetchError) {
              console.error(`Error calling enrichment API for company ${company}:`, fetchError);
              // Continue without deduced location on fetch error
            }
          }

          const finalLead: Lead = {
            ...leadPartial,
            location: location || undefined, // Assign final location (or undefined if still empty)
          };

          // Basic validation check after enrichment attempt
          if (!finalLead.email || !finalLead.name) {
             console.warn('Skipping invalid lead (missing name or email):', finalLead);
             return null; // Return null for invalid leads to filter later
          }

          return finalLead;

        } catch (mapError) {
           console.error(`Error processing row ${index}:`, mapError);
           return null; // Return null if there's an error processing the row
        }
      });

      // Wait for all lead processing (including lookups) to complete
      const processedLeadsRaw = await Promise.all(leadProcessingPromises);
      // Filter out any nulls from processing errors or invalid leads
      const leads: Lead[] = processedLeadsRaw.filter((lead): lead is Lead => lead !== null);

      // --- Original Validation and Upload Logic ---
      if (leads.length === 0) {
         throw new Error('No valid leads found in the CSV file after processing');
      }

      console.log(`Uploading ${leads.length} valid leads to Supabase...`);
      toast.loading(`Uploading ${leads.length} leads...`, { id: toastId });
      await uploadLeads(leads);

      toast.success(`Successfully processed and uploaded ${leads.length} leads!`, { id: toastId });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error(
        error instanceof Error
          ? `Error: ${error.message}`
          : 'Error processing CSV file',
        { id: toastId }
      );
    } finally {
      setIsUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          transition-colors cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50/10' : 'border-gray-300'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 text-center">
          {isUploading
            ? 'Uploading...'
            : isDragActive
            ? 'Drop your LinkedIn CSV file here'
            : 'Drag and drop your LinkedIn CSV file here, or click to select'}
        </p>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Upload your exported LinkedIn connections CSV file
        </p>
      </div>
    </div>
  );
}; 