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
        const batchSize = 50; // Larger batch size for user-specific deletion
        const totalBatches = Math.ceil(leadCount / batchSize);
        setDeletionProgress({
          deleted: 0,
          total: leadCount,
          currentBatch: 0,
          totalBatches
        });
      }
      
      // Use our custom deletion logic that only deletes current user's leads
      const result = await clearCurrentUserLeads();
      
      if (result.success) {
        // Show multiple prominent success messages
        toast.success('🎉 DELETION COMPLETE!', {
          description: `✅ Successfully deleted ${result.deletedCount || leadCount || 0} leads from your account!`,
          duration: 10000,
        });
        
        // Show a second toast for extra visibility
        setTimeout(() => {
          toast.success('🗑️ Your Leads Cleared!', {
            description: `Your lead database is now empty and ready for new uploads.`,
            duration: 6000,
          });
        }, 1000);
        
        // Also log to console for confirmation
        console.log(`🎉✅ DELETION COMPLETE: ${result.deletedCount || leadCount || 0} leads successfully deleted!`);
        console.log(`🗑️ Your lead database is now clean and ready for new leads!`);
        
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

  const clearCurrentUserLeads = async () => {
    try {
      console.log('[DataClear] Starting to clear current user leads...');
      
      // Use the fetch-leads API to get current user's leads
      const response = await fetch('/api/fetch-leads');
      if (!response.ok) {
        throw new Error(`Failed to fetch user leads: ${response.statusText}`);
      }
      
      const leadData = await response.json();
      if (!leadData.success) {
        throw new Error(leadData.error || 'Failed to fetch user leads');
      }
      
      const userLeads = leadData.leads || [];
      const totalLeadsToDelete = userLeads.length;
      
      console.log(`[DataClear] Found ${totalLeadsToDelete} leads for current user to delete`);
      
      if (totalLeadsToDelete === 0) {
        return { success: true, message: 'No leads found to delete', deletedCount: 0 };
      }
      
      // Delete leads using the clear-user-leads API endpoint
      const deleteResponse = await fetch('/api/clear-user-leads', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmDelete: true })
      });
      
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || `Delete request failed: ${deleteResponse.statusText}`);
      }
      
      const deleteResult = await deleteResponse.json();
      
      if (deleteResult.success) {
        console.log(`[DataClear] Successfully deleted ${deleteResult.deletedCount} leads`);
        
        // Update progress to show completion
        setDeletionProgress({
          deleted: deleteResult.deletedCount,
          total: deleteResult.deletedCount,
          currentBatch: 1,
          totalBatches: 1
        });
        
        return { 
          success: true, 
          message: `Successfully deleted ${deleteResult.deletedCount} leads`, 
          deletedCount: deleteResult.deletedCount 
        };
      } else {
        throw new Error(deleteResult.error || 'Delete operation failed');
      }
      
    } catch (error) {
      console.error('[DataClear] Error in clearCurrentUserLeads:', error);
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
              This will permanently delete all leads from your account. This action cannot be undone.
            </p>
            
            {/* Lead Count Display */}
            <div className="mt-3 p-2 bg-gray-800/50 rounded border border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">
                  {leadCount === null ? (
                    'Counting your leads...'
                  ) : leadCount === 0 ? (
                    'No leads found in your account'
                  ) : (
                    <>
                      <span className="font-medium text-white">{leadCount.toLocaleString()}</span>
                      <span className="text-gray-400"> of your leads will be deleted</span>
                    </>
                  )}
                </span>
              </div>
            </div>
            
            {/* Progress Display */}
            {deletionProgress && (
              <div className="mt-3 p-2 bg-blue-900/20 rounded border border-blue-700/30">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-blue-300">
                    Deleting leads: {deletionProgress.deleted} / {deletionProgress.total}
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(deletionProgress.deleted / deletionProgress.total) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Batch {deletionProgress.currentBatch} of {deletionProgress.totalBatches}
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
                   leadCount === null ? 'Delete My Leads' :
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