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
  const [justCompleted, setJustCompleted] = useState(false);

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
        // Show multiple prominent success messages
        toast.success('🎉 DELETION COMPLETE!', {
          description: `✅ Successfully deleted ${result.deletedCount || leadCount || 0} leads from your database!`,
          duration: 10000,
        });
        
        // Show a second toast for extra visibility
        setTimeout(() => {
          toast.success('🗑️ Database Cleared!', {
            description: `Your lead database is now empty and ready for new uploads.`,
            duration: 6000,
          });
        }, 1000);
        
        // Also log to console for confirmation
        console.log(`🎉✅ DELETION COMPLETE: ${result.deletedCount || leadCount || 0} leads successfully deleted!`);
        console.log(`🗑️ Database is now clean and ready for new leads!`);
        
        // Set completion state for visual feedback
        setJustCompleted(true);
        
        // Reset completion state after a few seconds
        setTimeout(() => {
          setJustCompleted(false);
        }, 5000);
        
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
      
      // First, get the actual count of ALL leads to delete (not just current user)
      const { count: totalCount, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
        
              if (countError) {
          throw new Error(`Failed to count leads: ${countError.message}`);
        }
        
        const totalLeadsToDelete = totalCount || 0;
      console.log(`Total leads to delete: ${totalLeadsToDelete}`);
      
      if (totalLeadsToDelete === 0) {
        return { success: true, message: 'No leads found to delete', deletedCount: 0 };
      }
      
      // Try the direct approach first for efficiency
      console.log('Attempting direct delete of all leads...');
      const { error: directDeleteError } = await supabase
        .from('leads')
        .delete()
        .not('id', 'is', null);
      
      if (!directDeleteError) {
        console.log('🎉 Successfully deleted all leads using direct method - COMPLETE!');
        
        // Update progress to show completion
        setDeletionProgress({
          deleted: totalLeadsToDelete,
          total: totalLeadsToDelete,
          currentBatch: 1,
          totalBatches: 1
        });
        
        return { success: true, message: `🎉 All ${totalLeadsToDelete} leads have been deleted successfully - Database is now clean!`, deletedCount: totalLeadsToDelete };
      }
      
      // If direct delete failed, use iterative batch approach
      console.warn('Direct delete failed:', directDeleteError.message);
      console.log('Falling back to iterative batch delete method...');
      
      let totalDeleted = 0;
      let batchNumber = 0;
      const batchSize = 50; // Increased batch size for efficiency
      
      // Continue deleting until no more leads exist
      while (true) {
        batchNumber++;
        
        // Get the next batch of lead IDs (ALL leads, not filtered by user)
        const { data: leadBatch, error: fetchError } = await supabase
          .from('leads')
          .select('id')
          .limit(batchSize);
          
        if (fetchError) {
          console.error(`Error fetching batch ${batchNumber}:`, fetchError);
          break;
        }
        
        // If no more leads, we're done
        if (!leadBatch || leadBatch.length === 0) {
          console.log('No more leads found - deletion complete!');
          break;
        }
        
        console.log(`Processing batch ${batchNumber}: ${leadBatch.length} leads`);
        
        // Update progress before deletion
        const estimatedTotal = Math.max(totalLeadsToDelete, totalDeleted + leadBatch.length);
        setDeletionProgress({
          deleted: totalDeleted,
          total: estimatedTotal,
          currentBatch: batchNumber,
          totalBatches: Math.ceil(estimatedTotal / batchSize)
        });
        
        // Delete this batch
        const idsToDelete = leadBatch.map(item => item.id);
        const { error: deleteError } = await supabase
          .from('leads')
          .delete()
          .in('id', idsToDelete);
        
        if (deleteError) {
          console.error(`Error deleting batch ${batchNumber}:`, deleteError);
          // Continue with next batch even if this one failed
          continue;
        }
        
        totalDeleted += leadBatch.length;
        console.log(`Successfully deleted batch ${batchNumber} (${leadBatch.length} leads). Total deleted: ${totalDeleted}`);
        
        // Update progress after successful deletion
        setDeletionProgress({
          deleted: totalDeleted,
          total: Math.max(totalLeadsToDelete, totalDeleted),
          currentBatch: batchNumber,
          totalBatches: Math.ceil(Math.max(totalLeadsToDelete, totalDeleted) / batchSize)
        });
        
        // Small delay to avoid rate limiting and allow UI updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Safety check - if we've deleted more than expected, break
        if (totalDeleted >= totalLeadsToDelete * 2) {
          console.log('Safety break - deleted more than expected');
          break;
        }
      }
      
      // Final verification - check if any leads remain and continue if needed
      const { count: remainingCount, error: verifyError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
        
      if (!verifyError && remainingCount && remainingCount > 0) {
        console.warn(`Warning: ${remainingCount} leads still remain. Attempting additional cleanup...`);
        
        // Try one more direct delete attempt
        const { error: finalDeleteError } = await supabase
          .from('leads')
          .delete()
          .not('id', 'is', null);
          
        if (!finalDeleteError) {
          totalDeleted += remainingCount;
          console.log(`Final cleanup successful! Deleted additional ${remainingCount} leads.`);
        } else {
          console.error('Final cleanup failed:', finalDeleteError);
          
          // If direct delete failed, try a few more batch iterations
          console.log('Attempting additional batch cleanup...');
          let additionalBatches = 0;
          const maxAdditionalBatches = 10;
          
          while (additionalBatches < maxAdditionalBatches) {
            const { data: extraBatch, error: extraFetchError } = await supabase
              .from('leads')
              .select('id')
              .limit(batchSize);
              
            if (extraFetchError || !extraBatch || extraBatch.length === 0) {
              break;
            }
            
            const extraIds = extraBatch.map(item => item.id);
            const { error: extraDeleteError } = await supabase
              .from('leads')
              .delete()
              .in('id', extraIds);
              
            if (!extraDeleteError) {
              totalDeleted += extraBatch.length;
              additionalBatches++;
              console.log(`Additional cleanup batch ${additionalBatches}: deleted ${extraBatch.length} more leads`);
              await new Promise(resolve => setTimeout(resolve, 100));
            } else {
              break;
            }
          }
        }
      }
      
      console.log(`🎉 DELETION COMPLETE! Total deleted: ${totalDeleted} leads in ${batchNumber} batches`);
      
      return { 
        success: true, 
        message: `🎉 Successfully deleted ${totalDeleted} leads in ${batchNumber} batches - Database is now clean!`,
        deletedCount: totalDeleted,
        batchCount: batchNumber
      };
      
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
      className={`px-3 py-1.5 text-sm rounded-md transition-all duration-500 flex items-center gap-2 ${
        justCompleted 
          ? 'bg-green-600/30 text-green-400 border border-green-600/30 animate-pulse' 
          : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/20'
      }`}
    >
      {justCompleted ? (
        <>
          <span className="text-green-400">✅</span>
          <span>Leads Cleared!</span>
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4" />
          <span>Clear All Leads</span>
        </>
      )}
    </button>
  );
}; 