'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../../lib/store';
import Report from '../../components/Report';
import ReportExitButton from '../../components/ReportExitButton';

export default function ReportPage() {
  const router = useRouter();
  const { currentPhase, studentInfo, scores } = useAssessmentStore();

  useEffect(() => {
    // If the user hasn't completed the assessment, redirect to the form page
    if (!studentInfo || Object.keys(scores).length === 0) {
      router.push('/form');
    }
    
    // If the user is not in the report phase, redirect to the appropriate page
    if (currentPhase !== 'report') {
      switch (currentPhase) {
        case 'landing':
          router.push('/');
          break;
        case 'student_info':
          router.push('/form');
          break;
x          router.push('/assessment');
          break;
      }
    }
  }, [currentPhase, studentInfo, scores, router]);

  // If the user hasn't completed the assessment, show a loading state
  if (!studentInfo || Object.keys(scores).length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <ReportExitButton />
      </div>
      <Report />
    </div>
  );
} 