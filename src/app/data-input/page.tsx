'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataInputForm from '@/components/data-input/DataInputForm';
import DataFormatGuidelines from '@/components/data-input/DataFormatGuidelines';

export default function DataInputPage() {
  const [selectedMethod, setSelectedMethod] = useState<'csv' | 'json' | 'demo'>('csv');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    // Handle file upload logic here
    console.log('Files to process:', files);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Data Input</h1>
          <div className="text-blue-300">Current dataset: 10 leads</div>
        </div>

        <div className="card">
          <DataInputForm />
        </div>

        <div className="card">
          <h2 className="text-xl font-medium mb-4">Data Format Guidelines</h2>
          <DataFormatGuidelines />
        </div>

        <div>
          <h2 className="text-lg mb-4">
            Upload {selectedMethod.toUpperCase()} File
          </h2>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="text-gray-300">
                Upload a file or drag and drop
                <br />
                <span className="text-sm text-gray-500">
                  {selectedMethod.toUpperCase()} file up to 10MB
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Data Format Guidelines</h2>
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">
              {selectedMethod.toUpperCase()} Format
            </h3>
            <p className="text-gray-300">
              Your {selectedMethod.toUpperCase()} file should have the following
              headers:
            </p>
            {/* Add format guidelines based on selectedMethod */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 