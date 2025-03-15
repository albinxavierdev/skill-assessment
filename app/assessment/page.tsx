'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../../lib/store';
import Assessment from '../../components/Assessment';

export default function AssessmentPage() {
  const router = useRouter();
  const { currentPhase, studentInfo } = useAssessmentStore();

  useEffect(() => {
    // If the user hasn't completed the form, redirect to the form page
    if (!studentInfo) {
      router.push('/form');
    }
    
    // If the user is not in the assessment phase, redirect to the appropriate page
    if (currentPhase !== 'assessment') {
      switch (currentPhase) {
        case 'landing':
          router.push('/');
          break;
        case 'student_info':
          router.push('/form');
          break;
        case 'report':
          router.push('/report');
          break;
      }
    }
  }, [currentPhase, studentInfo, router]);

  // If the user hasn't completed the form, show a loading state
  if (!studentInfo) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <Assessment />;
} 