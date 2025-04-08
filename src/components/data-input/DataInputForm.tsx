import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

const DataInputForm = () => {
  const [activeTab, setActiveTab] = useState<'csv' | 'json' | 'demo'>('csv');
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/json': activeTab === 'json' ? ['.json'] : [],
    },
    maxSize: 10485760, // 10MB
    onDrop: (acceptedFiles) => {
      // Handle file upload logic here
      console.log(acceptedFiles);
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">Data Input</h2>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-gray-400">Select Input Method</h3>
        <div className="flex gap-4 mb-6">
          <button
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'csv' 
                ? 'bg-accent-blue text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('csv')}
            aria-pressed={activeTab === 'csv'}
            tabIndex={0}
          >
            CSV File
          </button>
          <button
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'json' 
                ? 'bg-accent-blue text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('json')}
            aria-pressed={activeTab === 'json'}
            tabIndex={0}
          >
            JSON File
          </button>
          <button
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'demo' 
                ? 'bg-accent-blue text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('demo')}
            aria-pressed={activeTab === 'demo'}
            tabIndex={0}
          >
            Generate Demo Data
          </button>
        </div>
      </div>
      
      {(activeTab === 'csv' || activeTab === 'json') && (
        <div>
          <h3 className="text-sm font-medium mb-4">
            Upload {activeTab === 'csv' ? 'CSV' : 'JSON'} File
          </h3>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-accent-blue ${
              isDragActive ? 'border-accent-blue bg-accent-blue/5' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-3 rounded-full bg-gray-800">
                <Upload className="w-6 h-6 text-accent-blue" />
              </div>
              <div>
                <p className="text-accent-blue mb-1">Upload a file</p>
                <p className="text-sm text-gray-400">or drag and drop</p>
                <p className="text-xs text-gray-500 mt-2">
                  {activeTab === 'csv' ? 'CSV' : 'JSON'} file up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'demo' && (
        <div className="text-center py-8">
          <p className="mb-4 text-gray-300">
            Generate a set of demo leads to test the platform's functionality.
          </p>
          <button 
            className="btn-primary"
            aria-label="Generate demo data"
            tabIndex={0}
          >
            Generate 20 Demo Leads
          </button>
        </div>
      )}
    </div>
  );
};

export default DataInputForm; 