'use client';

import { useState } from 'react';

interface DebugPanelProps {
  apiKey: string;
}

export default function DebugPanel({ apiKey }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg hover:bg-gray-700"
      >
        {isOpen ? 'Hide Debug' : 'Debug Info'}
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-300 w-96 max-h-96 overflow-auto">
          <h3 className="text-lg font-semibold mb-2">API Configuration</h3>
          <div className="mb-4">
            <p className="text-sm mb-1"><span className="font-medium">API Key:</span> {apiKey ? `${apiKey.substring(0, 8)}...` : 'Not set'}</p>
            <p className="text-sm mb-1"><span className="font-medium">API Status:</span> {apiKey ? 'Configured' : 'Not configured'}</p>
          </div>

          <h3 className="text-lg font-semibold mb-2">Test API</h3>
          <button
            onClick={async () => {
              try {
                const response = await fetch(`/api/test-gemini`);
                const data = await response.json();
                alert(JSON.stringify(data, null, 2));
              } catch (error) {
                alert(`Error testing API: ${error}`);
              }
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
          >
            Test Gemini API
          </button>
        </div>
      )}
    </div>
  );
} 