'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Student } from '../../lib/studentStore';

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string | null>(null);
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);
  
  // Use a ref to store the abort controller for fetch requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize the fetchStudents function to avoid recreating it on every render
  const fetchStudents = useCallback(async (isBackgroundRefresh = false) => {
    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    if (!isBackgroundRefresh) {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      console.log(`Fetching students data (background: ${isBackgroundRefresh})`);
      
      const response = await fetch('/api/students', {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Only update state if the component is still mounted
      if (isMounted.current) {
        setStudents(data.students || []);
        setLastRefreshTime(new Date().toLocaleTimeString());
        setError(null);
      }
    } catch (err) {
      // Only update error state if it's not an abort error and component is mounted
      if (err instanceof Error && err.name !== 'AbortError' && isMounted.current) {
        console.error('Error fetching students:', err);
        setError('Failed to load student data. Please try again later.');
        
        // Schedule an automatic retry after 5 seconds on error
        if (!isBackgroundRefresh) {
          setTimeout(() => {
            if (isMounted.current) {
              fetchStudents(true);
            }
          }, 5000);
        }
      }
    } finally {
      // Only update loading state if the component is still mounted
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Set up initial data fetch and polling
  useEffect(() => {
    fetchStudents();
    
    // Set up polling for fresh data every 30 seconds
    const pollingInterval = setInterval(() => {
      if (isMounted.current) {
        fetchStudents(true);
      }
    }, 30000);
    
    // Clean up on unmount
    return () => {
      isMounted.current = false;
      clearInterval(pollingInterval);
      
      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStudents]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  if (loading && !refreshing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading student data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Submissions</h1>
        <div className="flex items-center space-x-4">
          {lastRefreshTime && (
            <span className="text-sm text-gray-500">
              Last updated: {lastRefreshTime}
            </span>
          )}
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={() => fetchStudents()}
                className="mt-2 text-sm text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {students.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">No student submissions found.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degree</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passing Year</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain Interest</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr key={student.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.collegeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.degree}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.passingYear}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.domainInterest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 