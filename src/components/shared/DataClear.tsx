'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Trash2, AlertTriangle, Loader2, BarChart3 } from 'lucide-react';

interface DataClearProps {
  onClearComplete: () => void;
}

export const DataClear = ({ onClearComplete }: DataClearProps) => {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [deletionProgress, setDeletionProgress] = useState<{
    deleted: number;
    total: number;
    currentBatch: number;
    totalBatches: number;
  } | null>(null);

  // Fetch lead count when component mounts or when showing confirmation
  useEffect(() => {
    if (showConfirm && leadCount === null) {
      fetchLeadCount();
    }
  }, [showConfirm]);

  const fetchLeadCount = async () => {
    try {
      const response = await fetch('/api/fetch-leads');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.leads) {
          setLeadCount(data.leads.length);
        }
      }
    } catch (error) {
      console.error('Error fetching lead count:', error);
      setLeadCount(0);
    }
  };

  const handleClearLeads = async () => {
    try {
      setIsClearing(true);
      setDeletionProgress(null);
      
      // Show initial progress
      if (leadCount && leadCount > 0) {
        const batchSize = 10; // Same as in clearAllLeads function
        const totalBatches = Math.ceil(leadCount / batchSize);
        setDeletionProgress({
          deleted: 0,
          total: leadCount,
          currentBatch: 0,
          totalBatches
        });
      }
      
      // Import clearAllLeads dynamically to reduce initial bundle size
      const { clearAllLeads } = await import('@/lib/supabase');
      
      // Create a custom version with progress tracking
      const result = await clearAllLeadsWithProgress();
      
      if (result.success) {
        toast.success('All leads deleted successfully!', {
          description: `${result.deletedCount || leadCount || 0} leads have been permanently removed.`,
          duration: 5000,
        });
        onClearComplete();
      } else {
        toast.error('Failed to clear leads', {
          description: result.message || 'Unknown error occurred',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error clearing leads:', error);
      toast.error('Error clearing leads', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000,
      });
    } finally {
      setIsClearing(false);
      setShowConfirm(false);
      setDeletionProgress(null);
    }
  };

  const clearAllLeadsWithProgress = async () => {
    try {
      console.log('Starting to clear all leads with progress tracking...');
      
      // Import supabase client
      const { supabase } = await import('@/lib/supabase');
      
      // Force refresh auth session first
      await supabase.auth.refreshSession();
      
      // Try the direct approach first
      const { error: directDeleteError } = await supabase
        .from('leads')
        .delete()
        .neq('id', '');
      
      if (!directDeleteError) {
        console.log('Successfully deleted all leads using direct method');
        
        // Update progress to show completion
        if (leadCount) {
          setDeletionProgress({
            deleted: leadCount,
            total: leadCount,
            currentBatch: 1,
            totalBatches: 1
          });
        }
        
        return { success: true, message: 'All leads have been deleted successfully', deletedCount: leadCount };
      }
      
      // If direct delete failed, use batch approach with progress tracking
      console.warn('Direct delete failed:', directDeleteError.message);
      console.log('Falling back to batch delete method with progress tracking...');
      
      // Get all lead IDs
      const { data: leadIds, error: fetchError } = await supabase
        .from('leads')
        .select('id');
        
      if (fetchError) {
        throw new Error(`Failed to fetch lead IDs: ${fetchError.message}`);
      }
      
      if (!leadIds || leadIds.length === 0) {
        return { success: true, message: 'No leads found to delete', deletedCount: 0 };
      }
      
      console.log(`Found ${leadIds.length} leads to delete`);
      
      // Delete in batches with progress updates
      const batchSize = 10;
      const totalBatches = Math.ceil(leadIds.length / batchSize);
      let successCount = 0;
      let errorCount = 0;
      let deletedCount = 0;
      
      for (let i = 0; i < leadIds.length; i += batchSize) {
        const batch = leadIds.slice(i, i + batchSize);
        const idsToDelete = batch.map(item => item.id);
        const currentBatch = Math.floor(i / batchSize) + 1;
        
        // Update progress
        setDeletionProgress({
          deleted: deletedCount,
          total: leadIds.length,
          currentBatch,
          totalBatches
        });
        
        try {
          const { error: deleteError } = await supabase
            .from('leads')
            .delete()
            .in('id', idsToDelete);
          
          if (deleteError) {
            console.error(`Error deleting batch ${currentBatch}:`, deleteError);
            errorCount++;
          } else {
            successCount++;
            deletedCount += idsToDelete.length;
            console.log(`Successfully deleted batch ${currentBatch} (${idsToDelete.length} leads)`);
            
            // Update progress after successful deletion
            setDeletionProgress({
              deleted: deletedCount,
              total: leadIds.length,
              currentBatch,
              totalBatches
            });
          }
          
          // Add a small delay to avoid rate limiting and allow UI updates
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (batchError) {
          console.error(`Exception in batch ${currentBatch}:`, batchError);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        return { 
          success: true, 
          message: `Successfully deleted ${deletedCount} leads in ${successCount} batches${errorCount > 0 ? ` (${errorCount} batches failed)` : ''}`,
          deletedCount,
          successCount,
          errorCount
        };
      } else {
        throw new Error('All batch deletions failed');
      }
    } catch (error) {
      console.error('Error in clearAllLeadsWithProgress:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { 
        success: false, 
        message: `Failed to clear leads: ${errorMessage}`,
        error: errorMessage
      };
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-red-400">Confirm Lead Deletion</h3>
            <p className="text-gray-400 text-sm mt-1">
              This will permanently delete all leads from your database. This action cannot be undone.
            </p>
            
            {/* Lead Count Display */}
            <div className="mt-3 p-2 bg-gray-800/50 rounded border border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">
                  {leadCount === null ? (
                    'Counting leads...'
                  ) : leadCount === 0 ? (
                    'No leads found to delete'
                  ) : (
                    <>
                      <span className="font-medium text-white">{leadCount.toLocaleString()}</span>
                      <span className="text-gray-400"> leads will be deleted</span>
                    </>
                  )}
                </span>
              </div>
            </div>
            
            {/* Progress Display */}
            {isClearing && deletionProgress && (
              <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-300">Deletion Progress</span>
                  <span className="text-blue-400 font-medium">
                    {deletionProgress.deleted} / {deletionProgress.total}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(deletionProgress.deleted / deletionProgress.total) * 100}%` 
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    Batch {deletionProgress.currentBatch} of {deletionProgress.totalBatches}
                  </span>
                  <span>
                    {Math.round((deletionProgress.deleted / deletionProgress.total) * 100)}% complete
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => {
              setShowConfirm(false);
              setLeadCount(null);
              setDeletionProgress(null);
            }}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-md transition-colors"
            disabled={isClearing}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClearLeads}
            disabled={isClearing || leadCount === 0}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {deletionProgress ? 
                    `Deleting... (${deletionProgress.deleted}/${deletionProgress.total})` : 
                    'Preparing...'
                  }
                </span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>
                  {leadCount === 0 ? 'No Leads to Delete' : 
                   leadCount === null ? 'Delete All Leads' :
                   `Delete ${leadCount.toLocaleString()} Leads`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirm(true)}
      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/20 text-sm rounded-md transition-colors flex items-center gap-2"
    >
      <Trash2 className="w-4 h-4" />
      <span>Clear All Leads</span>
    </button>
  );
}; 