'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Check, AlertCircle, CheckCircle, Info, BarChart2 } from 'lucide-react';
import Papa from 'papaparse';
import { uploadLeads } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Lead, LeadSource, LeadStatus } from '@/types/lead';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

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
}

type ProcessedLead = Omit<Lead, 'last_contacted_at'> & {
  last_contacted_at: undefined;
  insights?: LeadInsights;
};

const COMMON_FIELD_MAPPINGS = {
  name: ['name', 'full name', 'contact', 'person', 'first name', 'last name'],
  email: ['email', 'e-mail', 'mail', 'email address', 'contact email'],
  company: ['company', 'organization', 'employer', 'business'],
  title: ['title', 'position', 'role', 'job title'],
  phone: ['phone', 'mobile', 'cell', 'contact number'],
  linkedin: ['linkedin', 'linkedin url', 'linkedin profile', 'profile url', 'social media', 'linkedin link'],
  industry: ['industry', 'sector', 'market'],
  interests: ['interests', 'focus', 'specialties', 'expertise'],
  background: ['background', 'experience', 'about'],
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

  return insights;
};

const mapSourceToLeadSource = (source: string): LeadSource => {
  const lowerSource = source.toLowerCase();
  if (lowerSource.includes('linkedin')) return 'LinkedIn';
  if (lowerSource.includes('website')) return 'Website';
  if (lowerSource.includes('referral')) return 'Referral';
  return 'Other';
};

interface Props {
  onUploadComplete?: () => void;
}

const DataUpload: FC<Props> = ({ onUploadComplete }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    success: boolean;
    inserted: number;
    duplicates: number;
    total: number;
  } | null>(null);

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

    setIsProcessing(true);
    setResults(null);
    const loadingToast = toast.loading('Processing CSV file...');
    setProgress({ processed: 0, total: 0 });

    try {
      // Process the CSV file
      const processedLeads = await processCSV(file);
      
      toast.dismiss(loadingToast);
      
      if (!processedLeads.length) {
        toast.error('No valid leads found in the CSV file');
        setProgress(null);
        setIsProcessing(false);
        return;
      }

      // Show a debug message with the first lead data
      if (processedLeads.length > 0) {
        console.log('First processed lead:', processedLeads[0]);
        
        // Show sample in UI via toast
        const sampleLead = processedLeads[0];
        toast.info(
          <div className="max-w-md">
            <p className="font-semibold mb-2">Sample processed lead:</p>
            <ul className="text-xs">
              <li>Name: {sampleLead.name}</li>
              <li>Email: {sampleLead.email}</li>
              <li>Company: {sampleLead.company}</li>
              <li>Title: {sampleLead.title}</li>
              <li>Source: {sampleLead.source}</li>
            </ul>
          </div>,
          { duration: 5000 }
        );
      }
      
      // Start uploading to Supabase
      const uploadingToast = toast.loading(`Uploading ${processedLeads.length} leads to database...`);
      setProgress({ 
        processed: 0, 
        total: processedLeads.length,
        inserted: 0,
        duplicates: 0
      });

      // Setup a listener for batch progress updates
      const batchSize = 25; // Match the batch size in uploadLeads function
      const totalBatches = Math.ceil(processedLeads.length / batchSize);
      
      // Create a listener for console messages to update progress
      const originalConsoleLog = console.log;
      console.log = function(...args) {
        originalConsoleLog.apply(console, args);
        
        // Check for batch processing messages
        const message = args[0];
        if (typeof message === 'string') {
          // Process batch message
          if (message.includes('Processing batch')) {
            const batchMatch = message.match(/Processing batch (\d+)\/(\d+) \((\d+)\/(\d+)\)/);
            if (batchMatch) {
              const [_, currentBatch, totalBatches, processed, total] = batchMatch;
              setProgress(prev => ({
                ...prev!,
                currentBatch: parseInt(currentBatch),
                totalBatches: parseInt(totalBatches),
                processed: parseInt(processed),
                total: parseInt(total)
              }));
            }
          }
          
          // Process batch results message
          if (message.includes('Batch results:')) {
            const resultsMatch = message.match(/Batch results: (\d+) inserted, (\d+) duplicates skipped/);
            if (resultsMatch) {
              const [_, inserted, duplicates] = resultsMatch;
              setProgress(prev => {
                const updatedInserted = (prev?.inserted || 0) + parseInt(inserted);
                const updatedDuplicates = (prev?.duplicates || 0) + parseInt(duplicates);
                
                return {
                  ...prev!,
                  inserted: updatedInserted,
                  duplicates: updatedDuplicates
                };
              });
            }
          }
        }
      };

      try {
        const result = await uploadLeads(processedLeads);
        toast.dismiss(uploadingToast);
        
        // Restore original console.log
        console.log = originalConsoleLog;
        
        // Check if we're in mock mode (fallback)
        if (result.mockMode) {
          toast.info(
            'Demo Mode Active', 
            { 
              description: result.message || 'Using sample data instead of actual database', 
              duration: 5000
            }
          );
          
          // Show a more detailed message in the console
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
          
          // Still consider this a success for UX purposes
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          if (onUploadComplete) {
            onUploadComplete();
          }
          
          router.refresh();
          return;
        }
        
        if (result.success) {
          // Save the final results
          setResults({
            success: true,
            inserted: result.successCount || 0,
            duplicates: result.duplicateCount || 0,
            total: result.count
          });
          
          // Show success notification with detailed stats
          toast.success(
            `Upload Complete: ${result.successCount || 0} leads added`, 
            {
              description: `${result.duplicateCount || 0} duplicates were skipped.`,
              duration: 5000
            }
          );
        } else if (result.successCount && result.successCount > 0) {
          // Some leads were uploaded successfully
          setResults({
            success: true,
            inserted: result.successCount,
            duplicates: result.duplicateCount || 0,
            total: result.count
          });
          
          toast.success(
            `Partially successful: ${result.successCount} of ${result.count} leads uploaded`,
            {
              description: `${result.duplicateCount || 0} duplicates skipped. Some batches encountered errors.`
            }
          );
        } else {
          // No leads were uploaded successfully
          setResults({
            success: false,
            inserted: 0,
            duplicates: result.duplicateCount || 0,
            total: result.count
          });
          
          toast.error(`Failed to upload leads: ${result.errors?.length || 0} batch errors`);
        }
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        if (onUploadComplete) {
          onUploadComplete();
        }
        
        router.refresh();
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.dismiss(uploadingToast);
        
        // Restore original console.log
        console.log = originalConsoleLog;
        
        // Get error message
        let errorMessage = 'Upload failed: Unknown error occurred';
        
        if (error.message) {
          errorMessage = `Upload failed: ${error.message}`;
        }
        
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Processing error:', error);
      toast.dismiss();
      toast.error(error.message || 'Error processing CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const processCSV = async (file: File): Promise<ProcessedLead[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse<CSVRow>(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: '', // Auto-detect delimiter
        transformHeader: (header: string) => {
          return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        },
        complete: (results: Papa.ParseResult<CSVRow>) => {
          console.log('Papa Parse results:', {
            data: results.data.slice(0, 2),
            errors: results.errors,
            meta: results.meta
          });

          // Check for critical errors
          const criticalErrors = results.errors.filter(err => err.type === 'Delimiter' || err.type === 'FieldMismatch');
          if (criticalErrors.length > 0) {
            console.error('Critical CSV parsing errors:', criticalErrors);
            reject(new Error('Invalid CSV format. Please check your file format and try again.'));
            return;
          }

          if (!Array.isArray(results.data) || results.data.length === 0) {
            reject(new Error('No data found in CSV file'));
            return;
          }

          try {
            const processedData = results.data
              .filter(row => {
                // Keep any row that has at least one non-empty value
                const values = Object.values(row).filter(Boolean);
                return values.length > 0;
              })
              .map((row, index): ProcessedLead => {
                // Extract all possible fields
                const name = extractFieldValue(row, COMMON_FIELD_MAPPINGS.name);
                const email = extractFieldValue(row, COMMON_FIELD_MAPPINGS.email);
                const company = extractFieldValue(row, COMMON_FIELD_MAPPINGS.company);
                const title = extractFieldValue(row, COMMON_FIELD_MAPPINGS.title);
                const linkedinUrl = extractFieldValue(row, COMMON_FIELD_MAPPINGS.linkedin);
                
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
                let generatedName = name;
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

                return {
                  id: '', // Will be generated by Supabase
                  name: generatedName,
                  email: generatedEmail,
                  company: company || '',
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
              reject(new Error('No valid data found in CSV file after processing'));
              return;
            }

            console.log(`Successfully processed ${processedData.length} leads with insights`);
            resolve(processedData);
          } catch (error) {
            console.error('Error processing CSV data:', error);
            reject(new Error('Error processing CSV data: ' + (error as Error).message));
          }
        },
        error: (error: Error) => {
          console.error('CSV parsing error:', error);
          reject(new Error('Failed to parse CSV file: ' + error.message));
        }
      });
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
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900/70 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{results.inserted}</p>
                <p className="text-xs text-gray-400">Leads Added</p>
              </div>
              <div className="bg-gray-900/70 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-400">{results.duplicates}</p>
                <p className="text-xs text-gray-400">Duplicates Skipped</p>
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
              
              {results.duplicates > 0 && (
                <div className="bg-amber-900/20 text-amber-400 border border-amber-900/30 rounded-md p-3 text-sm">
                  <p className="flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    {results.duplicates} {results.duplicates === 1 ? 'lead' : 'leads'} {results.duplicates === 1 ? 'was' : 'were'} skipped because {results.duplicates === 1 ? 'it has' : 'they have'} duplicate email addresses.
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
                  {progress && progress.currentBatch && (
                    <div className="mb-4">
                      <p className="mb-1 text-sm text-blue-400 font-medium">
                        Processing batch {progress.currentBatch}/{progress.totalBatches || '?'}
                      </p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${progress.totalBatches 
                              ? Math.round((progress.currentBatch / progress.totalBatches) * 100) 
                              : 0}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        {Math.round(progress.totalBatches 
                          ? (progress.currentBatch / progress.totalBatches) * 100 
                          : 0)}% complete
                      </p>
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
                  {progress?.inserted !== undefined && (
                    <div className="flex justify-center gap-3 text-xs mt-1">
                      <span className="text-green-400">
                        {progress.inserted} added
                      </span>
                      {progress.duplicates ? (
                        <span className="text-amber-400">
                          {progress.duplicates} duplicates skipped
                        </span>
                      ) : null}
                    </div>
                  )}
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
            <p className="mt-1">Files of any size can be processed - large files will be handled in batches automatically.</p>
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