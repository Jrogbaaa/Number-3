'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface DataClearProps {
  onClearComplete: () => void;
}

export const DataClear = ({ onClearComplete }: DataClearProps) => {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearLeads = async () => {
    try {
      setIsClearing(true);
      
      // Import clearAllLeads dynamically to reduce initial bundle size
      const { clearAllLeads } = await import('@/lib/supabase');
      const result = await clearAllLeads();
      
      if (result.success) {
        toast.success('Leads cleared successfully', {
          description: result.message,
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
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-400">Confirm Lead Deletion</h3>
            <p className="text-gray-400 text-sm mt-1">
              This will permanently delete all leads from your database. This action cannot be undone.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-md transition-colors"
            disabled={isClearing}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClearLeads}
            disabled={isClearing}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Clearing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete All Leads</span>
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