'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../lib/store';
import LandingPage from './landing';
import StudentForm from './form';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { currentPhase, setCurrentPhase, resetAssessment } = useAssessmentStore();

  useEffect(() => {
    // Handle navigation based on current phase
    if (currentPhase === 'assessment') {
      router.push('/assessment');
    } else if (currentPhase === 'report') {
      router.push('/report');
    }
  }, [currentPhase, router]);

  const handleStartAssessment = () => {
    setCurrentPhase('student_info');
  };

  const handleBackToHome = () => {
    setCurrentPhase('landing');
  };

  const handleStartNew = () => {
    resetAssessment();
    setCurrentPhase('landing');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-0 py-0">
        {currentPhase === 'landing' && <LandingPage onStart={handleStartAssessment} />}
        {currentPhase === 'student_info' && <StudentForm />}
      </div>

      <footer className="bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/logo.png" alt="SkillPrep Logo" className="h-10 mb-4" />
              <p className="text-gray-600">
                Comprehensive skill assessment and personalized recommendations to accelerate your career growth.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Skill Assessment</li>
                <li>AI-Powered Analysis</li>
                <li>Career Recommendations</li>
                <li>Action Plans</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Blog</li>
                <li>Career Guides</li>
                <li>Skill Development</li>
                <li>Success Stories</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-600">
                <li>hello@skillprep.in</li>
                <li>Indore, India</li>
                <li>
                  <a 
                    href="/admin" 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Admin Portal
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} SkillPrep. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
} 