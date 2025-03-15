'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../lib/store';
import { useStudentStore, Student } from '../lib/studentStore';
import { StudentInfo } from '../lib/types';
import { SKILL_CATEGORIES } from '../config/categories';

type FormData = {
  name: string;
  email: string;
  phone: string;
  collegeName: string;
  degree: string;
  passingYear: number | string;
  domainInterest: string;
};

interface StudentFormProps {
  onBack?: () => void;
}

export default function StudentForm({ onBack }: StudentFormProps) {
  const router = useRouter();
  const { setStudentInfo, setCurrentPhase, setCurrentCategory } = useAssessmentStore();
  const { setStudent } = useStudentStore();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    collegeName: '',
    degree: '',
    passingYear: new Date().getFullYear(),
    domainInterest: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required';
    }
    
    if (!formData.degree.trim()) {
      newErrors.degree = 'Degree/Stream is required';
    }
    
    if (!formData.passingYear) {
      newErrors.passingYear = 'Passing year is required';
    } else {
      const year = Number(formData.passingYear);
      if (isNaN(year) || year < 2000 || year > 2030) {
        newErrors.passingYear = 'Please enter a valid passing year (2000-2030)';
      }
    }
    
    if (!formData.domainInterest.trim()) {
      newErrors.domainInterest = 'Domain of interest is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Show loading state
      setIsSubmitting(true);
      setSubmissionError(null);
      
      try {
        console.log('Form validated, preparing to submit data');
        
        // Store complete student data in the student store
        const studentData: Student = {
          ...formData,
          passingYear: Number(formData.passingYear)
        };
        setStudent(studentData);
        
        console.log('Saving student data to API:', studentData);
        
        // Save student data to API with retry logic
        let apiSuccess = false;
        let apiError = null;
        let studentId = null;
        
        // Retry up to 3 times with exponential backoff
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const response = await fetch('/api/students', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(studentData),
              // Add a longer timeout for the request
              signal: AbortSignal.timeout(10000 * attempt), // Increase timeout with each attempt
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
              console.log('Successfully saved student data with ID:', result.id);
              apiSuccess = true;
              studentId = result.id;
              break; // Exit the retry loop on success
            } else {
              // Handle specific error cases
              if (response.status === 409) {
                // Conflict - student already exists
                apiError = 'A student with this email already exists. Please use a different email.';
                break; // No need to retry for conflict errors
              } else {
                // Other errors
                apiError = result.error || `Server error (${response.status})`;
                console.error(`API call attempt ${attempt} failed:`, apiError);
                
                if (attempt < 3) {
                  // Wait before retrying (exponential backoff)
                  const delay = 1000 * Math.pow(2, attempt);
                  console.log(`Retrying in ${delay}ms...`);
                  await new Promise(r => setTimeout(r, delay));
                }
              }
            }
          } catch (error) {
            // Network or other errors
            apiError = error instanceof Error ? error.message : 'Network error';
            console.error(`API call attempt ${attempt} failed with exception:`, error);
            
            if (attempt < 3) {
              // Wait before retrying (exponential backoff)
              const delay = 1000 * Math.pow(2, attempt);
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(r => setTimeout(r, delay));
            }
          }
        }
        
        // Update student data with ID if available
        if (studentId) {
          const updatedStudentData = { ...studentData, id: studentId };
          setStudent(updatedStudentData);
        }
        
        // Show error but continue with assessment if API call failed
        if (!apiSuccess) {
          console.error('Failed to save student data to API after retries:', apiError);
          setSubmissionError(`Note: Your data could not be saved to our database (${apiError}), but you can still continue with the assessment.`);
        }
        
        // Map form data to StudentInfo type for assessment store
        const studentInfo: StudentInfo = {
          name: formData.name,
          email: formData.email,
          currentRole: `${formData.degree} Student at ${formData.collegeName}`,
          yearsOfExperience: calculateYearsOfExperience(Number(formData.passingYear)),
          targetRole: formData.domainInterest
        };
        
        console.log('Setting student info in assessment store:', studentInfo);
        
        // Update the assessment store with student info
        setStudentInfo(studentInfo);
        
        // Set the first category as the current category
        setCurrentCategory(SKILL_CATEGORIES[0]);
        
        // Transition to assessment phase
        setCurrentPhase('assessment');
        
        console.log('Navigating to assessment page');
        
        // Navigate to the assessment page
        router.push('/assessment');
      } catch (error) {
        console.error('Error during form submission:', error);
        setSubmissionError('An unexpected error occurred. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      console.log('Form validation failed');
    }
  };

  // Calculate years of experience based on passing year
  const calculateYearsOfExperience = (passingYear: number): number => {
    const currentYear = new Date().getFullYear();
    
    // If student is still studying (future passing year)
    if (passingYear > currentYear) {
      return 0;
    }
    
    // If student has graduated
    return currentYear - passingYear;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle each field type appropriately
    if (name === 'passingYear') {
      const numValue = Number(value) || new Date().getFullYear();
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value) || new Date().getFullYear();
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  // List of domains for the dropdown
  const domains = [
    'Web Development',
    'Mobile App Development',
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Cloud Computing',
    'DevOps',
    'Cybersecurity',
    'UI/UX Design',
    'Blockchain',
    'IoT (Internet of Things)',
    'Game Development',
    'AR/VR Development',
    'Digital Marketing',
    'Business Analytics',
    'Other'
  ];

  return (
    <div className="max-w-3xl mx-auto py-12 relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full opacity-20 -z-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full opacity-20 -z-10 blur-3xl"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
      
      {/* Header */}
      <div className="text-center mb-10 relative">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full opacity-70"></div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Profile</h1>
        <p className="text-gray-600">Tell us about yourself so we can personalize your assessment</p>
      </div>
      
      {/* Form Card */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-bl-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-50 to-indigo-100 rounded-tr-3xl opacity-50"></div>
        
        {/* Progress indicator */}
        <div className="w-full h-2 bg-gray-100">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-1/3"></div>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleTextChange}
                    className={`pl-10 w-full rounded-lg shadow-sm transition-all duration-200 ${
                      errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleTextChange}
                    className={`pl-10 w-full rounded-lg shadow-sm transition-all duration-200 ${
                      errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300'
                    }`}
                    placeholder="john.doe@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone and College Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleTextChange}
                    className={`pl-10 w-full rounded-lg shadow-sm ${
                      errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="1234567890"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700 mb-1">
                  College Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="collegeName"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleTextChange}
                    className={`pl-10 w-full rounded-lg shadow-sm ${
                      errors.collegeName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="University of Example"
                  />
                </div>
                {errors.collegeName && (
                  <p className="mt-1 text-sm text-red-600">{errors.collegeName}</p>
                )}
              </div>
            </div>

            {/* Degree and Passing Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
                  Degree/Stream
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleTextChange}
                    className={`pl-10 w-full rounded-lg shadow-sm ${
                      errors.degree ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="B.Tech Computer Science"
                  />
                </div>
                {errors.degree && (
                  <p className="mt-1 text-sm text-red-600">{errors.degree}</p>
                )}
              </div>

              <div>
                <label htmlFor="passingYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    id="passingYear"
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleNumberChange}
                    min="2000"
                    max="2030"
                    className={`pl-10 w-full rounded-lg shadow-sm ${
                      errors.passingYear ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="2024"
                  />
                </div>
                {errors.passingYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.passingYear}</p>
                )}
              </div>
            </div>

            {/* Domain of Interest */}
            <div>
              <label htmlFor="domainInterest" className="block text-sm font-medium text-gray-700 mb-1">
                Domain of Interest
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <select
                  id="domainInterest"
                  name="domainInterest"
                  value={formData.domainInterest}
                  onChange={handleTextChange}
                  className={`pl-10 w-full rounded-lg shadow-sm ${
                    errors.domainInterest ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select a domain</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
              {errors.domainInterest && (
                <p className="mt-1 text-sm text-red-600">{errors.domainInterest}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Start Assessment
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {submissionError && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{submissionError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 