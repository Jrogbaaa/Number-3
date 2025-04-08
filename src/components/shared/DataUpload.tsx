'use client';

import { useState } from 'react';
import { uploadLeads } from '@/lib/supabase';
import type { Lead, LeadSource, LeadStatus } from '@/types/leads';

const DataUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const text = await file.text();
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(header => header.trim());

      const leads: Lead[] = rows.slice(1)
        .filter(row => row.trim())
        .map(row => {
          const values = row.split(',').map(value => value.trim());
          const lead: Partial<Lead> = {};

          headers.forEach((header, index) => {
            const value = values[index];
            switch (header.toLowerCase()) {
              case 'name':
                lead.name = value;
                break;
              case 'email':
                lead.email = value;
                break;
              case 'score':
                lead.score = parseInt(value, 10);
                break;
              case 'source':
                lead.source = value as LeadSource;
                break;
              case 'status':
                lead.status = value as LeadStatus;
                break;
              case 'value':
                lead.value = parseFloat(value);
                break;
              case 'company':
                lead.company = value;
                break;
              case 'phone':
                lead.phone = value;
                break;
              case 'notes':
                lead.notes = value;
                break;
            }
          });

          if (!lead.name || !lead.email || !lead.score || !lead.source || !lead.status || !lead.value) {
            throw new Error('Missing required fields in CSV');
          }

          return lead as Lead;
        });

      await uploadLeads(leads);
      setSuccess(true);
      event.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-[#1A1F2B] rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Upload Lead Data</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-gray-500 bg-[#0D1117] hover:bg-[#1A1F2B] transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">CSV file with lead data</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {isUploading && (
          <div className="text-blue-400 text-sm">Uploading...</div>
        )}

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        {success && (
          <div className="text-green-400 text-sm">Data uploaded successfully!</div>
        )}

        <div className="text-gray-400 text-xs">
          <p className="font-semibold mb-1">Required CSV columns:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>name</li>
            <li>email</li>
            <li>score (0-100)</li>
            <li>source (Referral, Website, LinkedIn, etc.)</li>
            <li>status (New, Contacted, Qualified, etc.)</li>
            <li>value (numeric)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataUpload; 