'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DbSchemaRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/test/db-schema');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to new location...</p>
      </div>
    </div>
  );
} 