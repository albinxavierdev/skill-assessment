'use client';

import { useState, useEffect } from 'react';
import { supabase, testConnection } from '../../../lib/supabase';

export default function TestDbPage() {
  const [testResult, setTestResult] = useState<{ success: boolean; error?: any } | null>(null);
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseInfo, setSupabaseInfo] = useState({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  useEffect(() => {
    async function runTests() {
      setLoading(true);
      try {
        // Test connection
        const result = await testConnection();
        setTestResult(result);

        // Get student count if connection successful
        if (result.success) {
          const { count, error } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            setStudentCount(count);
          }
        }
      } catch (error) {
        console.error('Error running tests:', error);
        setTestResult({ success: false, error });
      } finally {
        setLoading(false);
      }
    }

    runTests();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Supabase Configuration</h2>
        <div className="space-y-2">
          <p><span className="font-medium">URL:</span> {supabaseInfo.url}</p>
          <p><span className="font-medium">Anon Key:</span> {supabaseInfo.hasAnonKey ? '✅ Set' : '❌ Not set'}</p>
          <p><span className="font-medium">Service Role Key:</span> {supabaseInfo.hasServiceKey ? '✅ Set' : '❌ Not set'}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Connection Test Results</h2>
        
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Testing connection...</span>
          </div>
        ) : testResult ? (
          <div>
            <div className={`p-4 mb-4 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-medium">
                {testResult.success 
                  ? '✅ Connection successful!' 
                  : '❌ Connection failed'}
              </p>
              {testResult.error && (
                <pre className="mt-2 text-sm overflow-x-auto">
                  {JSON.stringify(testResult.error, null, 2)}
                </pre>
              )}
            </div>
            
            {testResult.success && (
              <div className="mt-4">
                <p className="font-medium">Students in database: {studentCount !== null ? studentCount : 'Unknown'}</p>
              </div>
            )}
          </div>
        ) : (
          <p>No test results available.</p>
        )}
      </div>
    </div>
  );
} 