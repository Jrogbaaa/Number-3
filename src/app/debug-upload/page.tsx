'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugUploadPage() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkUserIdConsistency = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-user-id');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error checking user ID:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testSmallUpload = async () => {
    setLoading(true);
    try {
      const testLeads = [
        {
          name: 'Debug Test Lead 1',
          email: `debug-test-${Date.now()}@example.com`,
          company: 'Debug Company 1',
          title: 'Test Manager',
          source: 'Website',
          status: 'New',
          score: 75,
          value: 1000,
          insights: { testData: true }
        },
        {
          name: 'Debug Test Lead 2',
          email: `debug-test-${Date.now() + 1}@example.com`,
          company: 'Debug Company 2',
          title: 'Test Director',
          source: 'LinkedIn',
          status: 'New',
          score: 85,
          value: 2000,
          insights: { testData: true }
        }
      ];

      // Test upload
      const uploadResponse = await fetch('/api/upload-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leads: testLeads }),
      });

      const uploadResult = await uploadResponse.json();
      
      // Test fetch
      const fetchResponse = await fetch('/api/fetch-leads');
      const fetchResult = await fetchResponse.json();

      setTestResults({
        upload: {
          status: uploadResponse.status,
          result: uploadResult
        },
        fetch: {
          status: fetchResponse.status,
          result: fetchResult,
          leadsCount: fetchResult.leads?.length || 0
        }
      });
    } catch (error) {
      console.error('Error testing upload:', error);
      setTestResults({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Debug Upload - Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to use the debug tools.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Upload & Fetch Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current Session</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(session?.user, null, 2)}
            </pre>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={checkUserIdConsistency} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Checking...' : 'Check User ID Consistency'}
            </Button>
            
            <Button 
              onClick={testSmallUpload} 
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Small Upload & Fetch'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>User ID Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Upload & Fetch Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 