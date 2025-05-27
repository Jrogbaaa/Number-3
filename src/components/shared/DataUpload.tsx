'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Check, AlertCircle, CheckCircle, Info, BarChart2, X } from 'lucide-react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { uploadLeads } from '@/lib/supabase';
import type { Lead, LeadSource, LeadStatus } from '@/types/lead';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

// Define the structure for the upload result directly here
// as it is not exported from supabase.ts
interface SupabaseUploadResult {
  success: boolean;
  count: number;
  successCount?: number;
  duplicateCount?: number;
  error?: string;
  errors?: any[];
  mockMode?: boolean;
  message?: string;
}

// Define the structure for the results state
interface UploadResults {
  success: boolean;
  inserted: number;
  duplicates: number;
  total: number;
}

interface UploadProgress {
  processed: number;
  total: number;
  currentBatch?: number;
  totalBatches?: number;
  inserted?: number;
  duplicates?: number;
}

interface CSVRow {
  [key: string]: string | undefined;
}

interface LeadInsights {
  topics?: string[];
  interests?: string[];
  background?: string[];
  potentialValue?: number;
  propsContentEngagement?: number;
  relevantPostings?: string[];
  industryGroupParticipation?: string[];
  companySize?: number;
  companySizeRange?: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  annualRevenue?: string;
  notes?: string;
}

type ProcessedLead = Omit<Lead, 'last_contacted_at'> & {
  last_contacted_at: undefined;
  insights?: LeadInsights;
};

const COMMON_FIELD_MAPPINGS = {
  name: ['name', 'full name', 'contact', 'person', 'first name', 'last name'],
  email: ['email', 'e-mail', 'mail', 'email address', 'contact email'],
  company: ['company', 'company_name', 'organization', 'employer', 'business', 'company name'],
  title: ['title', 'position', 'role', 'job title'],
  phone: ['phone', 'mobile', 'cell', 'contact number'],
  linkedin: ['linkedin', 'linkedin url', 'linkedin profile', 'profile url', 'social media', 'linkedin link'],
  industry: ['industry', 'sector', 'market'],
  interests: ['interests', 'focus', 'specialties', 'expertise'],
  background: ['background', 'experience', 'about'],
  firstName: ['firstname', 'first name', 'first'],
  lastName: ['lastname', 'last name', 'last', 'last_name'],
  companySize: ['company size', 'employees', 'headcount', 'company_size', 'employee count', 'size'],
  annualRevenue: ['revenue', 'annual revenue', 'yearly revenue', 'company revenue', 'turnover'],
  propsEngagement: ['props engagement', 'engagement score', 'content engagement', 'engagement'],
  relevantPosts: ['posts', 'content', 'articles', 'publications', 'blog', 'thought leadership'],
  industryGroups: ['groups', 'communities', 'associations', 'memberships', 'forums', 'networks'],
  notes: ['notes', 'comments', 'additional info', 'other information', 'details']
};

const extractFieldValue = (row: CSVRow, fieldMappings: string[]): string => {
  const foundKey = Object.keys(row).find(key => 
    fieldMappings.some(mapping => 
      key.toLowerCase().includes(mapping.toLowerCase())
    )
  );
  return foundKey ? row[foundKey] || '' : '';
};

const analyzeLeadData = (row: CSVRow): LeadInsights => {
  const insights: LeadInsights = {
    topics: [],
    interests: [],
    background: [],
    potentialValue: 50, // Default value
    relevantPostings: [],
    industryGroupParticipation: [],
  };

  // Extract interests and expertise
  const interestsText = extractFieldValue(row, COMMON_FIELD_MAPPINGS.interests);
  if (interestsText) {
    insights.interests = interestsText.split(/[,;]/).map(i => i.trim());
  }

  // Extract background information
  const backgroundText = extractFieldValue(row, COMMON_FIELD_MAPPINGS.background);
  if (backgroundText) {
    insights.background = backgroundText.split(/[.!?]/).map(b => b.trim()).filter(Boolean);
  }

  // Analyze potential value based on available data
  const title = extractFieldValue(row, COMMON_FIELD_MAPPINGS.title).toLowerCase();
  if (title.includes('ceo') || title.includes('founder') || title.includes('president')) {
    insights.potentialValue = 90;
  } else if (title.includes('director') || title.includes('vp') || title.includes('head')) {
    insights.potentialValue = 75;
  } else if (title.includes('manager') || title.includes('lead')) {
    insights.potentialValue = 60;
  }

  // Extract potential conversation topics
  const industry = extractFieldValue(row, COMMON_FIELD_MAPPINGS.industry);
  if (industry) {
    insights.topics = [`Industry trends in ${industry}`, `Challenges in ${industry}`];
  }

  // Extract props content engagement score
  const engagementText = extractFieldValue(row, COMMON_FIELD_MAPPINGS.propsEngagement);
  if (engagementText) {
    const engagementScore = parseInt(engagementText, 10);
    if (!isNaN(engagementScore)) {
      insights.propsContentEngagement = Math.min(100, Math.max(0, engagementScore));
    }
  }

  // Extract relevant postings
  const postsText = extractFieldValue(row, COMMON_FIELD_MAPPINGS.relevantPosts);
  if (postsText) {
    insights.relevantPostings = postsText.split(/[,;]/).map(post => post.trim()).filter(Boolean);
  }

  // Extract industry group participation
  const groupsText = extractFieldValue(row, COMMON_FIELD_MAPPINGS.industryGroups);
  if (groupsText) {
    insights.industryGroupParticipation = groupsText.split(/[,;]/).map(group => group.trim()).filter(Boolean);
  }

  // Extract company size information
  const companySizeText = extractFieldValue(row, COMMON_FIELD_MAPPINGS.companySize);
  if (companySizeText) {
    // Try to extract numeric value
    const numericSize = parseInt(companySizeText.replace(/[^0-9]/g, ''), 10);
    
    if (!isNaN(numericSize)) {
      insights.companySize = numericSize;
      
      // Set company size range based on number
      if (numericSize > 5000) {
        insights.companySizeRange = 'Enterprise';
      } else if (numericSize > 1000) {
        insights.companySizeRange = 'Large';
      } else if (numericSize > 100) {
        insights.companySizeRange = 'Medium';
      } else {
        insights.companySizeRange = 'Small';
      }
    } else {
      // If no numeric value, try to extract categorical size
      const lowerCaseSize = companySizeText.toLowerCase();
      if (lowerCaseSize.includes('enterprise') || lowerCaseSize.includes('large')) {
        insights.companySizeRange = 'Enterprise';
      } else if (lowerCaseSize.includes('mid') || lowerCaseSize.includes('medium')) {
        insights.companySizeRange = 'Medium';
      } else if (lowerCaseSize.includes('small')) {
        insights.companySizeRange = 'Small';
      }
    }
  }
  
  // Extract annual revenue information
  const revenueText = extractFieldValue(row, COMMON_FIELD_MAPPINGS.annualRevenue);
  if (revenueText) {
    insights.annualRevenue = revenueText;
  }
  
  // Extract notes
  const notesText = extractFieldValue(row, COMMON_FIELD_MAPPINGS.notes);
  if (notesText) {
    insights.notes = notesText;
  }

  return insights;
};

const mapSourceToLeadSource = (source: string): LeadSource => {
  const lowerSource = source.toLowerCase();
  if (lowerSource.includes('linkedin')) return 'LinkedIn';
  if (lowerSource.includes('website')) return 'Website';
  if (lowerSource.includes('email')) return 'Cold Outreach';
  if (lowerSource.includes('referral')) return 'Referral';
  return 'Other';
};

export interface DataUploadProps {
  onUploadComplete?: (uploadedLeads?: ProcessedLead[]) => void;
  allowUnauthenticated?: boolean;
}

const DataUpload: FC<DataUploadProps> = ({ onUploadComplete, allowUnauthenticated = false }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [results, setResults] = useState<UploadResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Check if it's a CSV file by extension or type
      const isCSV = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
      
      if (isCSV) {
        const fakeEvent = {
          target: {
            files: [file]
          }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        await handleUpload(fakeEvent);
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    console.log('[DataUpload] Starting upload process');
    console.log('[DataUpload] allowUnauthenticated:', allowUnauthenticated);
    console.log('[DataUpload] File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setIsProcessing(true);
    setIsCancelled(false);
    setResults(null);
    setProgress(null);
    setError(null);

    const batchSize = 25; // Define batchSize here to match uploadLeads

    const loadingToast = toast.loading('Processing CSV file...');

    try {
      const processedLeads = await processCSV(file);
      console.log('[DataUpload] Processed leads count:', processedLeads.length);
      toast.dismiss(loadingToast);
      
      // Check if file is extremely large
      if (processedLeads.length > 8000) {
        toast.error(`File extremely large (${processedLeads.length} leads). Please split into files of 8000 leads or fewer for best performance.`);
        setError(`File extremely large (${processedLeads.length} leads). Please split into files of 8000 leads or fewer for best performance.`);
        setIsProcessing(false);
        return;
      }
      
      // Show warning for large files but allow processing
      if (processedLeads.length > 4000) {
        const shouldContinue = window.confirm(
          `Large file detected (${processedLeads.length} leads).\n\n` +
          `This upload may take 3-5 minutes and could timeout if your file is too large.\n\n` +
          `For best results, consider splitting files larger than 5000 leads.\n\n` +
          `Do you want to continue with this upload?`
        );
        
        if (!shouldContinue) {
          toast.info('Upload cancelled by user');
          setIsProcessing(false);
          return;
        }
        
        toast.warning(`Processing large file (${processedLeads.length} leads). Please be patient - this may take 3-5 minutes.`, {
          duration: 10000
        });
      }
      
      // Check for cancellation *after* parsing and *before* starting upload
      if (isCancelled) {
        toast.info("Upload cancelled after processing, before database upload.");
        setIsProcessing(false);
        setProgress(null);
        return; // Stop before calling uploadLeads
      }

      // Check if we should skip the API call for unauthenticated users
      if (allowUnauthenticated) {
        console.log('[DataUpload] Running unauthenticated flow - skipping API call');
        // For unauthenticated users, just process locally without API call
        toast.dismiss(loadingToast);
        toast.success(`${processedLeads.length} leads analyzed successfully! Sign in to save results.`);
        
        // Set results to show successful local processing
        setResults({
          success: true,
          inserted: processedLeads.length,
          duplicates: 0,
          total: processedLeads.length
        });
        
        // Clear file input and notify parent
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        console.log('[DataUpload] Calling onUploadComplete with', processedLeads.length, 'leads');
        if (onUploadComplete) {
          onUploadComplete(processedLeads);
        }
        setProgress(null);
        setIsProcessing(false);
        return; // Skip API call completely
      }

      console.log('[DataUpload] Running authenticated flow - calling API');
      const uploadingToast = toast.loading('Uploading leads to database...');
      setProgress({ processed: 0, total: processedLeads.length });

      // --- Setup Console Listener ---
      const originalConsoleLog = console.log;
      const logMessages: string[] = [];
      const progressRegex = /Processing batch (\d+)\/(\d+) \((\d+)\/(\d+)\)/;
      const batchResultsRegex = /Batch results: (\d+) inserted, (\d+) duplicates skipped/;

      console.log = (...args: any[]) => {
        originalConsoleLog.apply(console, args);
        const message = args.map(arg => String(arg)).join(' ');
        logMessages.push(message);

        // Match batch processing progress
        const progressMatch = message.match(progressRegex);
        if (progressMatch) {
          const currentBatch = parseInt(progressMatch[1], 10);
          const totalBatches = parseInt(progressMatch[2], 10);
          const processed = parseInt(progressMatch[3], 10);
          const total = parseInt(progressMatch[4], 10);
          
          // Update progress with detailed information
          setProgress({
            processed,
            total,
            currentBatch,
            totalBatches
          });
          }
          
        // Match batch results
        const batchResultsMatch = message.match(batchResultsRegex);
        if (batchResultsMatch) {
          const inserted = parseInt(batchResultsMatch[1], 10);
          const duplicates = parseInt(batchResultsMatch[2], 10);
          
          // Update inserted/duplicates count with proper typing
              setProgress(prev => {
            if (!prev) return null;
                return {
              ...prev,
              inserted: (prev.inserted || 0) + inserted,
              duplicates: (prev.duplicates || 0) + duplicates
                };
              });
            }
      };
      // --- End Console Listener Setup ---

      let uploadResult: SupabaseUploadResult | null = null;
      try {
        // --- Call uploadLeads ---
        // Replace direct uploadLeads call with API route using service role key
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 65000); // 65 second timeout (slightly longer than server)
        
        const response = await fetch('/api/upload-leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ leads: processedLeads }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            // If response isn't JSON, create a generic error
            errorData = { error: `Server error: ${response.status} ${response.statusText}` };
          }
          console.error('[DataUpload] API response error:', errorData);
          
          // Handle specific error types
          if (response.status === 504) {
            throw new Error('Upload timeout - your file is too large. Please split it into smaller files (under 500 leads) and try again.');
          } else if (response.status === 413) {
            throw new Error('File too large - please reduce the file size and try again.');
          } else {
            throw new Error(errorData.error || `Server error: ${response.status}`);
          }
        }
        
        uploadResult = await response.json();
        console.log('[DataUpload] API response:', uploadResult);
        // --- End API call ---
      } catch (uploadError: any) {
        console.error('Upload error:', uploadError);
        toast.dismiss(uploadingToast);
        
        // Handle different error types with specific messages
        if (uploadError.name === 'AbortError') {
          toast.error('Upload timeout - file too large. Please split into smaller files.');
          setError('Upload timeout - file too large. Please split into smaller files.');
        } else if (uploadError.message?.includes('timeout')) {
          toast.error('Upload timeout - please try with a smaller file.');
          setError('Upload timeout - please try with a smaller file.');
        } else {
          toast.error(`Upload failed: ${uploadError.message || 'Unknown database error'}`);
          setError(uploadError.message || 'Unknown database error');
        }
      } finally {
        // --- Restore console.log ---
        console.log = originalConsoleLog;
        // --- End Restore ---
        toast.dismiss(uploadingToast); // Ensure loading toast is dismissed
      }
        
      // --- Process Results ---
      if (uploadResult) {
        if (uploadResult.mockMode) {
          toast.info(
            'Demo Mode Active', 
            { 
              description: uploadResult.message || 'Using sample data instead of actual database',
              duration: 5000
            }
          );
          console.info(`
            🛈 DEMO MODE ACTIVE
            -------------------
            Your data was processed successfully, but couldn't be saved to the database.
            This could be because:
            1. The 'leads' table doesn't exist in your Supabase database
            2. There's an issue with your Supabase connection or permissions
            
            Your data is being displayed as sample data for demonstration purposes.
            
            To fix this:
            - Visit the /debug page to set up your database
            - Download and run the SQL script in your Supabase project
          `);
          // Set results to show something in demo mode
           setResults({
              success: true, // Treat as success for UI
              inserted: processedLeads.length, // Show all processed as 'inserted'
              duplicates: 0,
              total: processedLeads.length
          });

        } else if (uploadResult.success) {
          setResults({
            success: true,
            inserted: uploadResult.successCount || 0,
            duplicates: uploadResult.duplicateCount || 0,
            total: uploadResult.count
          });
          toast.success(
            `Upload Complete: ${uploadResult.successCount || 0} leads added`,
            {
              description: `${uploadResult.duplicateCount || 0} duplicates were skipped.`,
              duration: 5000
            }
          );
        } else if (uploadResult.successCount && uploadResult.successCount > 0) {
          // Partial success
          setResults({
            success: true, // Still consider overall success=true if some were inserted
            inserted: uploadResult.successCount,
            duplicates: uploadResult.duplicateCount || 0,
            total: uploadResult.count
          });
          toast.warning( // Use warning for partial success
            `Partially successful: ${uploadResult.successCount} of ${uploadResult.count} leads uploaded`,
            {
              description: `${uploadResult.duplicateCount || 0} duplicates skipped. ${uploadResult.errors?.length || 0} batch errors.`
            }
          );
        } else {
          // Complete failure
          setResults({
            success: false,
            inserted: 0,
            duplicates: uploadResult.duplicateCount || 0,
            total: uploadResult.count
          });
          const errorMsg = uploadResult.error || `${uploadResult.errors?.length || 0} batch errors occurred.`;
          toast.error(`Upload failed: ${errorMsg}`);
          setError(errorMsg);
        }
        
        // --- Final Steps on Success/Completion (even mock mode) ---
        if (fileInputRef.current) {
           fileInputRef.current.value = ''; // Clear file input
        }
        if (onUploadComplete) {
           onUploadComplete(processedLeads); // Notify parent component
        }
        router.refresh(); // Refresh data on page
      }
      // --- End Process Results ---

    } catch (error: any) {
      // Catch errors from processCSV or other setup steps
      console.error('>>> [DataUpload.tsx CATCH BLOCK] Error during processCSV or initial setup:', error);
      console.error('Processing error:', error);
      toast.dismiss(loadingToast); // Dismiss initial loading toast if it was still active
      toast.error(`Processing failed: ${error.message || 'Could not process CSV file'}`);
      setError(error.message || 'Could not process CSV file');
    } finally {
      setIsProcessing(false); // Ensure processing state is always turned off
      // Cancellation state is handled earlier or implicitly by finishing
    }
  };

  // --- Function to handle cancellation ---
  const handleCancelUpload = () => {
    console.log("Cancellation requested...");
    setIsCancelled(true);
    
    // If we actually have data ready but the UI isn't showing it properly
    // Check if we might have completed processing but UI is stuck
    if (progress && progress.processed > 0) {
      console.log("Upload was in progress - checking if data is available");
      
      // Force refresh to show data that might actually be there
      setIsProcessing(false);
      toast.info("Upload canceled. Some data may have been processed successfully.");
      
      // Reset state and refresh router to capture any successful uploads
      if (onUploadComplete) {
        onUploadComplete();
      }
      router.refresh();
    } else {
      // Standard cancellation for early stages
      setIsProcessing(false);
      setProgress(null);
      toast.info("Upload cancelled.");
    }
  };
  // --- End Cancellation Handling ---

  const processCSV = async (file: File): Promise<ProcessedLead[]> => {
    // --- Log Entry to processCSV ---
    console.log('[DataUpload.tsx] Entered processCSV function.');
    // --- End Log ---
    return new Promise((resolve, reject) => {
      // Add timeout to prevent hanging on large files - scale timeout based on file size
      const timeoutDuration = file.size > 50000000 ? 300000 : file.size > 10000000 ? 180000 : 90000; // 5 min for >50MB, 3 min for >10MB, 1.5 min otherwise
      const timeoutId = setTimeout(() => {
        console.error('[DataUpload.tsx] CSV processing timeout - file may be too large');
        reject(new Error(`File processing timeout after ${Math.round(timeoutDuration/1000)} seconds. File size: ${Math.round(file.size/1000000)}MB. Please try splitting into smaller files.`));
      }, timeoutDuration);
      
      // First read the file as text to verify it has content
      const reader = new FileReader();
      
      reader.onload = (event) => {
        // --- Log Inside reader.onload ---
        console.log('[DataUpload.tsx] reader.onload triggered. Preparing to parse...');
        // --- End Log ---
        const text = event.target?.result as string;

        // Check if the file has any content
        if (!text || text.trim() === '') {
          clearTimeout(timeoutId);
          console.error('CSV file is empty');
          reject(new Error('The CSV file is empty - please check your file'));
            return;
          }

        // Log first 500 chars to verify file content
        console.log('CSV file content preview:', text.substring(0, 500));
        
        // Count lines in file
        const lineCount = text.split('\n').filter(line => line.trim() !== '').length;
        console.log(`CSV contains ${lineCount} non-empty lines`);
        
        // Early check for very large files - warn but allow with user confirmation
        if (lineCount > 10000) {
          clearTimeout(timeoutId);
          console.error(`CSV file extremely large: ${lineCount} lines`);
          reject(new Error(`File extremely large (${lineCount} lines). This may cause browser issues. Please split into smaller files of 8000 leads or fewer for best performance.`));
          return;
        }
        
        // Warn about large files but allow processing
        if (lineCount > 5000) {
          console.warn(`Large CSV file detected: ${lineCount} lines - processing may take 3-5 minutes`);
          // Show a toast for large file processing
          toast.info(`Large file detected (${lineCount} lines). Processing may take a few minutes...`, {
            duration: 5000
          });
        }
        
        // If file has content but only 1 line, it might be just headers
        if (lineCount <= 1) {
          console.warn('CSV file contains only headers or a single line');
          // Continue anyway to let PapaParse try
        }
        
        // Helper function to process the parsed data
        const processParsedData = (results: Papa.ParseResult<CSVRow>): void => {
          // --- Log Entry to processParsedData ---
          console.log('[DataUpload.tsx] Entered processParsedData. Processing rows...');
          // --- End Log ---
          try {
            clearTimeout(timeoutId); // Clear timeout since we got results
            
            const processedData = results.data
              .filter(row => {
                // Keep any row that has at least one non-empty value
                const values = Object.values(row).filter(Boolean);
                return values.length > 0;
              })
              .map((row, index): ProcessedLead => {
                // Extract standard fields using the helper or direct access after transformHeader
                const email = extractFieldValue(row, COMMON_FIELD_MAPPINGS.email);
                const title = extractFieldValue(row, COMMON_FIELD_MAPPINGS.title);
                const linkedinUrl = extractFieldValue(row, COMMON_FIELD_MAPPINGS.linkedin);

                // --- Direct access after transformHeader for name ---
                const firstName = row['firstname'] || row['first name'] || row['first'] || ''; // Check transformed keys
                const lastName = row['lastname'] || row['last name'] || row['last'] || ''; // Check transformed keys
                let name = row['name'] || row['fullname'] || ''; // Check transformed keys

                if (!name && firstName && lastName) {
                  name = `${firstName} ${lastName}`.trim();
                } else if (!name && (firstName || lastName)) {
                  name = (firstName || lastName || '').trim();
                }
                // --- End name combination ---

                // --- Direct access for company after transformHeader ---
                const company = row['companyname'] || row['company'] || row['organization'] || ''; // Check transformed keys
                
                // Try to find LinkedIn URL in any field if not explicitly labeled
                let enhancedLinkedinUrl = linkedinUrl;
                if (!enhancedLinkedinUrl) {
                  // Search through all values for anything that looks like a LinkedIn URL
                  for (const key of Object.keys(row)) {
                    const value = row[key];
                    if (!value || typeof value !== 'string') continue;
                    
                    const lowerValue = value.toLowerCase();
                    
                    // Check if this is potentially an email that's actually a LinkedIn URL
                    if (lowerValue.includes('linkedin.com') || 
                        lowerValue.includes('linked.in') || 
                        lowerValue.includes('lnkd.in') ||
                        lowerValue.includes('/li/') ||
                        /linkedin\.[a-z]+\/in\//.test(lowerValue)) {
                      
                      // Extract URL pattern
                      const urlMatches = [
                        // Standard LinkedIn URL patterns
                        value.match(/(https?:\/\/)?(www\.)?(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i),
                        value.match(/(https?:\/\/)?(www\.)?(linkedin\.com\/company\/[a-zA-Z0-9_-]+)/i),
                        value.match(/(https?:\/\/)?(www\.)?(linked\.in\/[a-zA-Z0-9_-]+)/i),
                        value.match(/(https?:\/\/)?(www\.)?(lnkd\.in\/[a-zA-Z0-9_-]+)/i),
                        // Handle profile URLs with query parameters
                        value.match(/(https?:\/\/)?(www\.)?linkedin\.com\/[a-zA-Z0-9\/-]+(\?[a-zA-Z0-9=&-]+)?/i)
                      ].filter(Boolean)[0];
                      
                      if (urlMatches) {
                        const fullUrl = urlMatches[0];
                        enhancedLinkedinUrl = fullUrl.startsWith('http') ? fullUrl : `https://${fullUrl}`;
                        break;
                      } 
                    } 
                    // Check if value is just a username that looks like "username" or "linkedin: username"
                    else if (lowerValue.startsWith('linkedin:') || lowerValue.startsWith('li:')) {
                      const username = value.split(':')[1]?.trim();
                      if (username) {
                        enhancedLinkedinUrl = `https://linkedin.com/in/${username}`;
                        break;
                      }
                    }
                    // Sometimes LinkedIn URLs are placed in the email field
                    else if (key.toLowerCase().includes('email') && !lowerValue.includes('@')) {
                      // If there's no @ symbol in an email field, it might be a LinkedIn URL
                      if (lowerValue.includes('linkedin') || lowerValue.includes('li/')) {
                        const urlMatch = value.match(/(https?:\/\/)?(www\.)?linkedin\.com\/[a-zA-Z0-9\/-]+/i);
                        if (urlMatch) {
                          enhancedLinkedinUrl = urlMatch[0];
                          if (!enhancedLinkedinUrl.startsWith('http')) {
                            enhancedLinkedinUrl = 'https://' + enhancedLinkedinUrl;
                          }
                          break;
                        }
                      }
                    }
                  }
                }

                // Analyze the row data for insights
                const insights = analyzeLeadData(row);

                // Generate better placeholder values for missing required fields
                let generatedName = name; // Start with combined/extracted name
                if (!generatedName) {
                  // Try to extract name from email if available
                  if (email && email.includes('@')) {
                    const emailParts = email.split('@')[0].split('.');
                    if (emailParts.length > 0) {
                      // Convert first part to capitalized name
                      generatedName = emailParts.map(part => 
                        part.charAt(0).toUpperCase() + part.slice(1)
                      ).join(' ');
                    }
                  }
                  
                  // If still no name, use company or a placeholder with company
                  if (!generatedName && company) {
                    generatedName = `Lead from ${company}`;
                  } else if (!generatedName) {
                    generatedName = `Unnamed Lead ${index + 1}`;
                  }
                }

                // Generate a unique ID for the email if missing
                const generatedEmail = email || `lead_${Date.now()}_${index}_${Math.random().toString(36).slice(2)}@placeholder.com`;

                // --- Add Final Pre-Return Log ---
                console.log(`[DataUpload.tsx] Final assignment for Row ${index}: Name='${generatedName || `Unnamed Lead ${index + 1}`}', Company='${company || ''}'`);
                // --- End Log ---

                return {
                  id: '', // Will be generated by Supabase
                  name: generatedName || `Unnamed Lead ${index + 1}`, // Use generatedName (which includes combined name)
                  email: generatedEmail,
                  company: company || '', // Use the directly accessed company
                  title: title || '',
                  score: insights.potentialValue || 0,
                  source: mapSourceToLeadSource(extractFieldValue(row, ['source', 'channel']) || 'other'),
                  status: 'New' as LeadStatus,
                  value: 0, // Default value
                  created_at: new Date().toISOString(),
                  last_contacted_at: undefined,
                  linkedinUrl: enhancedLinkedinUrl || undefined,
                  insights
                };
              });

            if (processedData.length === 0) {
              clearTimeout(timeoutId);
              reject(new Error('No valid data found in CSV file after processing'));
              return;
            }

            console.log(`Successfully processed ${processedData.length} leads with insights`);
            resolve(processedData);
          } catch (error) {
            clearTimeout(timeoutId);
            console.error('Error processing CSV data:', error);
            reject(new Error('Error processing CSV data: ' + (error as Error).message));
          }
        };
        
        // Now parse with PapaParse - use chunking for large files
        Papa.parse<CSVRow>(file, {
          header: true,
          skipEmptyLines: true,
          delimiter: '', // Auto-detect delimiter
          transformHeader: (header: string) => {
            return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          },
          complete: (results: Papa.ParseResult<CSVRow>) => {
            // --- Simplified Log in complete Callback ---
            console.log(`[DataUpload.tsx] PapaParse complete callback reached. Found ${results.data?.length || 0} data rows. Errors: ${results.errors?.length || 0}.`);
            // --- End Log ---
            
            // Enhanced logging with safe array handling:
            console.log('Papa Parse Detailed Results:', {
              dataPreview: Array.isArray(results.data) ? results.data.slice(0, 5) : 'Data is not an array',
              dataType: typeof results.data,
              rowCount: Array.isArray(results.data) ? results.data.length : 'N/A - not an array',
              errors: results.errors, // Log any parsing errors
              meta: results.meta      // Log metadata (delimiter, etc.)
            });
            
            // --- Log Headers and First Row Directly After Parse ---
            if (results.meta && results.data && results.data.length > 0) {
              console.log('[DataUpload.tsx] PapaParse Headers Detected:', results.meta.fields);
              console.log('[DataUpload.tsx] PapaParse First Data Row:', results.data[0]);
            } else {
              console.warn('[DataUpload.tsx] PapaParse completed but no data rows found or meta fields missing.');
            }
            // --- End Log ---

            // Check for delimiter issues first
            if (results.meta && results.meta.delimiter === '') {
              clearTimeout(timeoutId);
              console.error('CSV delimiter could not be detected');
              reject(new Error('Could not detect CSV delimiter - please check your file format'));
              return;
            }

            // Check for critical errors
            const criticalErrors = results.errors.filter(err => err.type === 'Delimiter' || err.type === 'FieldMismatch');
            if (criticalErrors.length > 0) {
              clearTimeout(timeoutId);
              console.error('Critical CSV parsing errors:', criticalErrors);
              reject(new Error('Invalid CSV format. Please check your file format and try again.'));
              return;
            }

            // Check for empty data with better error handling
            if (!Array.isArray(results.data)) {
              console.error('PapaParse returned non-array data:', typeof results.data, results.data);
              clearTimeout(timeoutId);
              reject(new Error('CSV parsing failed - invalid data format returned. Please check your file format.'));
              return;
            }
            
            if (results.data.length === 0) {
              console.warn('Rejecting: Empty data array returned by PapaParse.');
              
              // Try alternative parsing approach with explicit comma delimiter
              console.log('Attempting alternative parsing with explicit comma delimiter...');
              Papa.parse<CSVRow>(file, {
                header: true,
                skipEmptyLines: true,
                delimiter: ',', // Force comma delimiter
                transformHeader: (header: string) => {
                  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                },
                complete: (retryResults: Papa.ParseResult<CSVRow>) => {
                  if (Array.isArray(retryResults.data) && retryResults.data.length > 0) {
                    console.log('Alternative parsing succeeded with:', {
                      rowCount: retryResults.data.length
                    });
                    processParsedData(retryResults);
                  } else {
                    clearTimeout(timeoutId);
                    reject(new Error('No data found in CSV file despite multiple parsing attempts.'));
                  }
                },
                error: (error: Error) => {
                  clearTimeout(timeoutId);
                  console.error('Alternative CSV parsing error:', error);
                  reject(new Error('Failed to parse CSV file: ' + error.message));
                }
              });
              return;
            }

            processParsedData(results);
        },
        error: (error: Error) => {
          // --- Log PapaParse Error ---
          console.error('[DataUpload.tsx] PapaParse encountered an error:', error);
          // --- End Log ---
          clearTimeout(timeoutId);
          console.error('CSV parsing error:', error);
          reject(new Error('Failed to parse CSV file: ' + error.message));
          },
          step: (results, parser) => {
            try {
              if (isCancelled) {
                parser.abort();
                console.log("CSV parsing aborted due to cancellation.");
                clearTimeout(timeoutId);
                reject(new Error("Upload cancelled during parsing."));
                return;
              }
              
              // Log progress for very large files
              if (results.meta && results.meta.cursor) {
                const progress = Math.round(results.meta.cursor / file.size * 100);
                if (progress % 10 === 0 && progress > 0) { // Log every 10%
                  console.log(`CSV parsing progress: ${progress}%`);
                }
              }
            } catch (stepError) {
              console.error('Error in step function:', stepError);
              // Don't reject here, let parsing continue
            }
        }
      });
      };
      
      reader.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error('Error reading file:', error);
        reject(new Error('Could not read the file. Please try again.'));
      };
      
      // Start reading the file as text
      // --- Log Before Reading File ---
      console.log('[DataUpload.tsx] Calling reader.readAsText...');
      // --- End Log ---
      reader.readAsText(file);
    });
  };

  return (
    <div>
      <div className="max-w-xl mx-auto">
        {results ? (
          <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6 mb-6 transition-all">
            <div className="flex items-center mb-4">
              {results.success ? (
                <Check className="w-8 h-8 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="w-8 h-8 text-amber-500 mr-3" />
              )}
              <h3 className="text-xl font-semibold text-white">Upload Results</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900/70 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{results.inserted}</p>
                <p className="text-xs text-gray-400">Leads Added</p>
              </div>
              <div className="bg-gray-900/70 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-400">{results.total}</p>
                <p className="text-xs text-gray-400">Total Processed</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              {results.success && results.inserted > 0 && (
                <div className="bg-green-900/20 text-green-400 border border-green-900/30 rounded-md p-3 text-sm">
                  <p className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Upload complete! Your leads have been added to the database.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button 
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                onClick={() => {
                  setResults(null);
                  if (onUploadComplete) {
                    onUploadComplete();
                  }
                }}
              >
                Upload Another File
              </button>
              
              <button 
                className="py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                onClick={() => window.location.href = '/dashboard'}
              >
                <BarChart2 className="w-4 h-4" />
                <span>View Dashboard</span>
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${
              isProcessing ? 'border-gray-600 bg-gray-800/50' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/40'
            } transition-colors`}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isProcessing ? (
                <div className="text-center">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent mb-4" />
                  {progress && (
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm text-blue-400 font-medium">
                          Processing leads ({progress.processed}/{progress.total})
                        </p>
                        <p className="text-xs text-gray-400">
                          {progress.currentBatch && progress.totalBatches && 
                            `Batch ${progress.currentBatch}/${progress.totalBatches}`}
                        </p>
                      </div>
                      
                      {/* Show estimated time for large files */}
                      {progress.total > 4000 && (
                        <div className="text-xs text-yellow-400 mb-2">
                          ⏱️ Large file detected - estimated time: 3-5 minutes
                        </div>
                      )}
                      
                      {/* Main progress bar */}
                      <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${progress.total ? Math.round((progress.processed / progress.total) * 100) : 0}%` }}
                        />
                      </div>
                      
                      {/* Show inserted and duplicates if available */}
                      {progress.inserted !== undefined && (
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-green-400">
                            {progress.inserted} inserted
                          </span>
                          {progress.duplicates !== undefined && progress.duplicates > 0 && (
                            <span className="text-yellow-400">
                              {progress.duplicates} duplicates skipped
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-300 mb-2">
                    {progress ? (
                      <>
                        {progress.processed} of {progress.total} leads processed
                      </>
                    ) : (
                      'Processing...'
                    )}
                  </p>
                  {/* --- Cancel Button --- */}
                  <button 
                    onClick={handleCancelUpload} 
                    className="mt-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors flex items-center gap-1 mx-auto"
                  >
                     <X size={14}/> Cancel
                  </button>
                  {/* --- End Cancel Button --- */}
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mb-3 text-blue-400" />
                  <p className="mb-2 text-sm text-gray-300">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleUpload}
              disabled={isProcessing}
            />
          </label>
        )}
        {!isProcessing && !results && (
          <div className="mt-4 text-center text-gray-400 text-xs">
            <p>The CSV file should contain columns for name, email, company, title, etc.</p>
            <p className="mt-1">
              <span className="text-green-400">✓ Small files (under 1000 leads):</span> Process in seconds<br/>
              <span className="text-yellow-400">⚠ Large files (1000-8000 leads):</span> May take 3-5 minutes<br/>
              <span className="text-red-400">⚠ Very large files (8000+ leads):</span> Please split for best performance
            </p>
            <p className="mt-1">
              Need a sample? <a href="/sample-leads.csv" className="text-blue-400 hover:underline">Download template</a>
            </p>
            <p className="mt-3 text-xs text-gray-500">
              For large datasets (1000+ records), you can also visit the <a href="/debug" className="text-blue-400 hover:underline">Debug</a> page to generate test data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export { DataUpload }; 