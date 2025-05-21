'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataUpload } from '@/components/shared/DataUpload';
import { DataClear } from '@/components/shared/DataClear';
import { Upload, Database, Info, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function DataInputPage() {
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const handleClearComplete = () => {
    // Force a router refresh to update the UI
    router.refresh();
    // Show success message
    toast.success('All leads cleared successfully');
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-semibold">Upload Leads</h1>
          </div>
          <div className="text-gray-400 px-3 py-1.5 bg-gray-800/70 rounded-md border border-gray-700/50 text-sm flex items-center gap-1.5">
            <Upload className="h-4 w-4" />
            <span>Import your lead data</span>
          </div>
        </div>

        <div className="bg-gray-900/70 rounded-xl p-6 border border-gray-800/50 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">Upload CSV File</h2>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 bg-gray-800/70 px-2 py-1 rounded">Lead Import</div>
              <button
                onClick={() => router.refresh()}
                className="p-1.5 text-blue-400 hover:bg-blue-900/20 rounded-md"
                aria-label="Refresh page"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-blue-900/10 p-4 rounded-lg mb-6 border border-blue-800/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-400">
              <p>Upload your leads in CSV format. The file should include the following columns:</p>
              <ul className="list-disc list-inside mt-2 ml-1 space-y-1">
                <li><span className="text-blue-400">name</span> - Full name of the lead</li>
                <li><span className="text-blue-400">email</span> - Contact email address</li>
                <li><span className="text-blue-400">company</span> - Company name (optional)</li>
                <li><span className="text-blue-400">position</span> - Job title (optional)</li>
              </ul>
            </div>
          </div>
          
          <DataUpload onUploadComplete={() => router.refresh()} />
          
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex flex-col">
              <h3 className="text-lg font-medium mb-3">Data Management</h3>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400 max-w-lg">
                  If you're experiencing issues with data not clearing properly, use this button to clear all leads from the database. This action cannot be undone.
                </p>
                <DataClear onClearComplete={handleClearComplete} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 