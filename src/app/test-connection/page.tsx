'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestConnectionPage() {
  const [connectionResults, setConnectionResults] = useState<any>(null);
  const [leadsResults, setLeadsResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-supabase');
      const data = await response.json();
      setConnectionResults(data);
    } catch (error) {
      setConnectionResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-leads');
      const data = await response.json();
      setLeadsResults(data);
    } catch (error) {
      setLeadsResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="flex gap-4 mb-8">
        <Button 
          onClick={testConnection} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Test Supabase Connection
        </Button>
        
        <Button 
          onClick={testLeads} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          Test Leads Table
        </Button>
      </div>
      
      {loading && (
        <div className="text-gray-500 mb-4">Loading...</div>
      )}
      
      {connectionResults && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Connection Test Results:</h2>
          <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-[400px]">
            {JSON.stringify(connectionResults, null, 2)}
          </pre>
        </div>
      )}
      
      {leadsResults && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Leads Test Results:</h2>
          <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-[400px]">
            {JSON.stringify(leadsResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 