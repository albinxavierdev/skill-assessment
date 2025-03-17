'use client';

import React from 'react';
import Link from 'next/link';

export default function TestPage() {
  const testTools = [
    {
      title: 'Database Connection Test',
      description: 'Test the connection to the Supabase database and verify credentials.',
      href: '/test/db',
      icon: '🗄️',
    },
    {
      title: 'Form Submission Test',
      description: 'Test the student form submission flow and database integration.',
      href: '/test/form',
      icon: '📝',
    },
    {
      title: 'Database Schema',
      description: 'View and verify the database schema for the application.',
      href: '/test/db-schema',
      icon: '📊',
    },
    {
      title: 'Admin Panel',
      description: 'Access the admin panel for managing students and application data.',
      href: '/admin',
      icon: '👤',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Test Tools</h1>
      <p className="text-gray-600 mb-8">
        These tools are for testing and debugging purposes. They should not be accessible to end users in production.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testTools.map((tool) => (
          <Link 
            href={tool.href} 
            key={tool.href}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start">
              <div className="text-4xl mr-4">{tool.icon}</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{tool.title}</h2>
                <p className="text-gray-600 mt-2">{tool.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 