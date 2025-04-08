'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataUpload } from '@/components/shared/DataUpload';

export default function DataInputPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Data Input</h1>
          <div className="text-blue-300">Import your lead data</div>
        </div>

        <div className="card">
          <h2 className="text-xl font-medium mb-6">Upload CSV File</h2>
          <DataUpload />
        </div>
      </div>
    </DashboardLayout>
  );
} 