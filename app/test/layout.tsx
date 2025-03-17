'use client';

import React from 'react';
import TestNavigation from '../../components/TestNavigation';

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TestNavigation />
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
} 