'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataUpload } from '@/components/shared/DataUpload';
import { Upload, Database, Info } from 'lucide-react';

export default function DataInputPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-semibold">Data Input</h1>
          </div>
          <div className="text-gray-400 px-3 py-1.5 bg-gray-800/70 rounded-md border border-gray-700/50 text-sm flex items-center gap-1.5">
            <Upload className="h-4 w-4" />
            <span>Import your lead data</span>
          </div>
        </div>

        <div className="bg-gray-900/70 rounded-xl p-6 border border-gray-800/50 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">Upload CSV File</h2>
            <div className="text-xs text-gray-500 bg-gray-800/70 px-2 py-1 rounded">Lead Import</div>
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
          
          <DataUpload />
        </div>
      </div>
    </DashboardLayout>
  );
} 