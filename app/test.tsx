'use client';

import React from 'react';

export default function TestComponent() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Tailwind Test</h1>
      <p className="text-gray-700 mb-4">This is a test component to verify that Tailwind CSS is working properly.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg shadow">Card 1</div>
        <div className="bg-green-100 p-4 rounded-lg shadow">Card 2</div>
        <div className="bg-purple-100 p-4 rounded-lg shadow">Card 3</div>
      </div>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Test Button
      </button>
    </div>
  );
} 