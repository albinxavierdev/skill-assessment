'use client';

import { useState } from 'react';

export default function TestFormPage() {
  const [formData, setFormData] = useState({
    name: 'Test Student',
    email: `test${Date.now()}@example.com`,
    phone: '1234567890',
    collegeName: 'Test College',
    degree: 'Test Degree',
    passingYear: '2025',
    domainInterest: 'Web Development'
  });
  
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [requestDetails, setRequestDetails] = useState<{
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    status?: number;
    responseTime?: number;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage(null);
    setRequestDetails({});
    
    const startTime = Date.now();
    
    try {
      // Prepare request details for logging
      const requestUrl = '/api/students';
      const requestHeaders = {
        'Content-Type': 'application/json',
      };
      
      setRequestDetails({
        url: requestUrl,
        method: 'POST',
        headers: requestHeaders,
        body: formData
      });
      
      setToastMessage({
        type: 'info',
        message: 'Sending request to API...'
      });
      
      const res = await fetch(requestUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(formData),
      });
      
      const responseTime = Date.now() - startTime;
      setRequestDetails(prev => ({
        ...prev,
        status: res.status,
        responseTime
      }));
      
      const data = await res.json();
      setResponse(data);
      
      if (data.success) {
        setToastMessage({
          type: 'success',
          message: `Student created successfully with ID: ${data.id}`
        });
      } else {
        setToastMessage({
          type: 'error',
          message: data.error || 'Failed to create student'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      
      setToastMessage({
        type: 'error',
        message: `Failed to submit form: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      setRequestDetails(prev => ({
        ...prev,
        responseTime: Date.now() - startTime
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-6">Test Form Submission</h1>
      
      {toastMessage && (
        <div className={`p-4 mb-4 rounded ${
          toastMessage.type === 'success' ? 'bg-green-100 text-green-800' : 
          toastMessage.type === 'error' ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {toastMessage.message}
        </div>
      )}
      
      <div className="p-6 bg-white rounded-md shadow mb-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Name</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Phone</label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">College Name</label>
              <input 
                name="collegeName" 
                value={formData.collegeName} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Degree</label>
              <input 
                name="degree" 
                value={formData.degree} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Passing Year</label>
              <input 
                name="passingYear" 
                value={formData.passingYear} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Domain Interest</label>
              <input 
                name="domainInterest" 
                value={formData.domainInterest} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <button 
              type="submit" 
              className={`w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
      
      {Object.keys(requestDetails).length > 0 && (
        <div className="p-6 bg-white rounded-md shadow mb-6">
          <h2 className="text-lg font-bold mb-4">Request Details</h2>
          <div className="p-4 bg-gray-50 rounded-md overflow-x-auto">
            <pre>{JSON.stringify(requestDetails, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {response && (
        <div className="p-6 bg-white rounded-md shadow">
          <h2 className="text-lg font-bold mb-4">API Response</h2>
          <div className="p-4 bg-gray-50 rounded-md overflow-x-auto">
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 