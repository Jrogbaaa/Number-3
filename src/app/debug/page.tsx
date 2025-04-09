'use client';

import { useState, useEffect } from 'react';
import { checkLeadsTable, testSupabaseConnection } from '@/lib/debug';
import { supabase } from '@/lib/supabase';
import { DataClear } from '@/components/shared/DataClear';

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [tableStatus, setTableStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const runTests = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        // Test the connection
        const connStatus = await testSupabaseConnection();
        setConnectionStatus(connStatus);
        
        // Check the table
        const tableInfo = await checkLeadsTable();
        setTableStatus(tableInfo);
      } catch (error) {
        console.error('Error in debug tests:', error);
        setErrorMessage(error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    };
    
    runTests();
  }, []);

  const createLeadsTable = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/setup-database?execute=true');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create table');
      }
      
      // Verify table was created
      const tableInfo = await checkLeadsTable();
      setTableStatus(tableInfo);
      
      if (!tableInfo.exists) {
        throw new Error('Table creation failed - table still does not exist');
      }
      
      alert('Leads table created successfully!');
    } catch (error) {
      console.error('Error creating leads table:', error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearComplete = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">System Diagnostics</h1>
      
      {errorMessage && (
        <div className="p-4 mb-6 bg-red-900 border border-red-700 rounded-md">
          <h3 className="text-lg font-semibold text-red-200 mb-2">Error</h3>
          <p className="text-red-100">{errorMessage}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Connection Status */}
        <div className="p-6 bg-[#1A1F2B] rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Supabase Connection</h2>
          
          {isLoading ? (
            <p className="text-gray-400">Testing connection...</p>
          ) : connectionStatus ? (
            <div>
              <div className="flex items-center mb-4">
                <span className={`w-4 h-4 rounded-full mr-2 ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-white">{connectionStatus.connected ? 'Connected' : 'Connection Failed'}</span>
              </div>
              
              {connectionStatus.connected && (
                <>
                  <p className="text-gray-400 mb-2">
                    Response Time: {connectionStatus.responseTime}ms
                  </p>
                  <div className="flex items-center mb-4">
                    <span className={`w-4 h-4 rounded-full mr-2 ${connectionStatus.authenticated ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                    <span className="text-white">{connectionStatus.authenticated ? 'Authenticated' : 'Not Authenticated'}</span>
                  </div>
                </>
              )}
              
              {connectionStatus.error && (
                <pre className="p-3 bg-[#0D1117] text-red-400 text-sm mt-4 rounded overflow-auto max-h-40">
                  {connectionStatus.error}
                </pre>
              )}
            </div>
          ) : (
            <p className="text-red-400">Failed to test connection</p>
          )}
        </div>
        
        {/* Table Status */}
        <div className="p-6 bg-[#1A1F2B] rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Leads Table</h2>
          
          {isLoading ? (
            <p className="text-gray-400">Checking table...</p>
          ) : tableStatus ? (
            <div>
              <div className="flex items-center mb-4">
                <span className={`w-4 h-4 rounded-full mr-2 ${tableStatus.exists ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-white">{tableStatus.exists ? 'Table Exists' : 'Table Missing'}</span>
              </div>
              
              {!tableStatus.exists && (
                <div className="mt-4 space-y-4">
                  <p className="text-yellow-300">
                    The leads table doesn't exist in your Supabase database.
                  </p>
                  
                  <div className="space-y-2">
                    <h3 className="text-md font-semibold text-white">Options to create table:</h3>
                    
                    <div className="space-y-2">
                      <a
                        href="/setup-database.sql"
                        download
                        className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-center"
                      >
                        Download SQL Script
                      </a>
                      
                      <div className="p-4 bg-[#0D1117] rounded-md">
                        <p className="text-gray-300 text-sm mb-2">Manual steps:</p>
                        <ol className="text-xs text-gray-400 list-decimal list-inside space-y-1">
                          <li>Download the SQL script</li>
                          <li>Go to Supabase project dashboard</li>
                          <li>Click on "SQL Editor"</li>
                          <li>Create a new query</li>
                          <li>Paste the SQL script</li>
                          <li>Run the query</li>
                          <li>Refresh this page</li>
                        </ol>
                      </div>
                      
                      <button
                        onClick={createLeadsTable}
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-300 text-white rounded-md"
                      >
                        Try Creating Table via API (May Not Work)
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {tableStatus.exists && tableStatus.columns && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-white mb-2">Columns:</h3>
                  <div className="bg-[#0D1117] rounded-md p-4 overflow-auto max-h-60">
                    <table className="w-full text-sm text-gray-300">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2">Column</th>
                          <th className="text-left py-2">Type</th>
                          <th className="text-left py-2">Nullable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableStatus.columns.map((col: any) => (
                          <tr key={col.column_name} className="border-b border-gray-800">
                            <td className="py-2">{col.column_name}</td>
                            <td className="py-2">{col.data_type}</td>
                            <td className="py-2">{col.is_nullable === 'YES' ? '✓' : '✗'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {tableStatus.error && (
                <pre className="p-3 bg-[#0D1117] text-red-400 text-sm mt-4 rounded overflow-auto max-h-40">
                  {tableStatus.error}
                </pre>
              )}
            </div>
          ) : (
            <p className="text-red-400">Failed to check table</p>
          )}
        </div>

        {/* Additional Debug Tools */}
        <div className="p-6 bg-[#1A1F2B] rounded-lg md:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-md font-semibold text-white mb-2">Test Data</h3>
              <p className="text-gray-400 mb-4">
                Download a sample CSV file to test the upload functionality. Any CSV file with headers will work - 
                no specific fields are required.
              </p>
              <a 
                href="/sample-leads.csv"
                download
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md inline-block"
              >
                Download Sample CSV
              </a>
            </div>
            
            <div>
              <h3 className="text-md font-semibold text-white mb-2">Database Setup</h3>
              <p className="text-gray-400 mb-4">
                Get the SQL schema to create the leads table manually in Supabase. Files of any size are
                processed in batches automatically.
              </p>
              <a 
                href="/setup-database.sql"
                download
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md inline-block"
              >
                Download SQL Schema
              </a>
            </div>
          </div>
        </div>

        {/* Data Management Tools */}
        <div className="p-6 bg-[#1A1F2B] rounded-lg md:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4">Data Management</h2>
          
          <div className="border-l-4 border-yellow-500 bg-yellow-900/20 p-4 mb-6 rounded-r-md">
            <h3 className="text-lg font-semibold text-yellow-400 mb-1">Warning</h3>
            <p className="text-yellow-200">
              These actions will permanently modify your data. Use with caution.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete all leads? This cannot be undone.')) {
                  setIsLoading(true);
                  setErrorMessage(null);
                  try {
                    const { clearAllLeads } = await import('@/lib/supabase');
                    const result = await clearAllLeads();
                    
                    if (result.success) {
                      alert(`Success: ${result.message || 'All leads have been deleted successfully.'}`);
                      window.location.href = '/dashboard';
                    } else {
                      setErrorMessage(result.message || 'Failed to clear leads. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error clearing leads:', error);
                    setErrorMessage(error instanceof Error ? error.message : String(error));
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:text-gray-300 text-white rounded-md"
            >
              {isLoading ? 'Processing...' : 'Clear All Leads'}
            </button>
            
            <button
              onClick={async () => {
                if (window.confirm('This will generate 500 test leads for demonstration purposes. Continue?')) {
                  setIsLoading(true);
                  try {
                    const response = await fetch('/api/import-large-sample');
                    const result = await response.json();
                    
                    if (result.success) {
                      alert(`Successfully generated ${result.message}`);
                      window.location.href = '/dashboard';
                    } else {
                      throw new Error(result.message || 'Failed to generate test data');
                    }
                  } catch (error) {
                    console.error('Error generating test data:', error);
                    setErrorMessage(error instanceof Error ? error.message : String(error));
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:text-gray-300 text-white rounded-md"
            >
              Generate Test Data
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Add notification about the challenges with Supabase information schema */}
      <div className="p-4 mb-6 bg-blue-900/20 border-l-4 border-blue-500 rounded-r-md">
        <h3 className="text-lg font-semibold text-blue-400 mb-1">Important Note</h3>
        <p className="text-blue-200 mb-2">
          Supabase restricts access to database metadata through the client API.
        </p>
        <p className="text-blue-200">
          To properly set up your database, download the SQL script below and run it in the Supabase SQL Editor.
        </p>
      </div>
    </div>
  );
} 