'use client';

import React, { useEffect, useState } from 'react';
import { useAssessmentStore } from '../lib/store';
import { useStudentStore } from '../lib/studentStore';
import { calculateScores } from '../lib/gemini';
import { SKILL_CATEGORIES } from '../config/categories';
import { Question } from '../lib/types';

// Mock questions as fallback if API fails
const mockQuestions: Question[] = [
  {
    question: "In a team project, a colleague consistently misses deadlines. What's the most effective approach?",
    focusArea: "Problem Solving",
    options: {
      a: "Report them to management immediately",
      b: "Have a private conversation to understand their challenges",
      c: "Take over their work without discussing it",
      d: "Exclude them from future project planning"
    },
    correct: "b",
    explanation: "Having a private conversation shows empathy and problem-solving skills. It allows you to understand underlying issues and find solutions collaboratively."
  },
  {
    question: "You have multiple urgent tasks due today. What's the best approach?",
    focusArea: "Time Management",
    options: {
      a: "Work on the easiest tasks first",
      b: "Multitask between all projects simultaneously",
      c: "Prioritize based on importance and deadline",
      d: "Ask for extensions on all deadlines"
    },
    correct: "c",
    explanation: "Prioritizing tasks based on importance and deadlines is the most effective time management strategy. It ensures critical work is completed first."
  }
];

export default function Assessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const store = useAssessmentStore();
  const studentStore = useStudentStore();
  const currentCategory = store.currentCategory || SKILL_CATEGORIES[0];
  
  const setStoreQuestions = (newQuestions: { [category: string]: Question[] }) => {
    store.setQuestions(newQuestions);
  };

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const loadQuestions = async () => {
      // Check if we already have questions in the store for this category
      if (store.questions[currentCategory]?.length > 0) {
        setQuestions(store.questions[currentCategory]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get student info from the store
        const studentInfo = studentStore.student;
        
        // Create personalization prompt based on student info
        let personalizationPrompt = '';
        if (studentInfo) {
          personalizationPrompt = `Personalize questions for a ${studentInfo.degree} student named ${studentInfo.name} from ${studentInfo.collegeName}, graduating in ${studentInfo.passingYear}, with interest in ${studentInfo.domainInterest}.`;
        }

        console.log('Fetching questions for category:', currentCategory);
        console.log('Personalization prompt:', personalizationPrompt);

        // Call our API route directly
        const response = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: currentCategory,
            personalizationPrompt
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API response error:', errorData);
          throw new Error(errorData.error || `Failed to fetch questions: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.success && data.questions && data.questions.length > 0) {
          console.log('Successfully loaded questions:', data.questions.length);
          // Update local state and store
          setQuestions(data.questions);
          setStoreQuestions({
            ...store.questions,
            [currentCategory]: data.questions
          });
        } else {
          console.error('No questions in API response:', data);
          throw new Error('No questions returned from API');
        }
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        
        // Fallback to mock questions if API fails
        if (mockQuestions.length > 0) {
          console.log('Using fallback mock questions');
          setQuestions(mockQuestions);
          setStoreQuestions({
            ...store.questions,
            [currentCategory]: mockQuestions
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [currentCategory, store.questions, setStoreQuestions, studentStore.student]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    
    // Submit answer to store without showing if it's correct
    store.submitAnswer(currentCategory, currentQuestionIndex, answer);
    
    // Don't show explanation immediately
    setShowExplanation(false);
    
    // Don't set isAnswerCorrect
    setIsAnswerCorrect(null);
    
    // Automatically proceed to next question after a short delay
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsAnswerCorrect(null);
    
    if (currentQuestionIndex < questions.length - 1) {
      // Go to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // If this is the last category, calculate scores and go to report
      const isLastCategory = SKILL_CATEGORIES.indexOf(currentCategory) === SKILL_CATEGORIES.length - 1;
      
      if (isLastCategory) {
        // Calculate scores
        const scores = calculateScores(store.answers, store.questions);
        store.setScores(scores);
        
        // Go to report page
        store.setCurrentPhase('report');
        window.location.href = '/report';
      } else {
        // Go to next category
        const nextCategoryIndex = SKILL_CATEGORIES.indexOf(currentCategory) + 1;
        const nextCategory = SKILL_CATEGORIES[nextCategoryIndex];
        store.setCurrentCategory(nextCategory);
        
        // Reset question index
        setCurrentQuestionIndex(0);
      }
    }
  };

  // Calculate progress
  const progress = ((SKILL_CATEGORIES.indexOf(currentCategory) * 5 + currentQuestionIndex + 1) / (SKILL_CATEGORIES.length * 5)) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1 && SKILL_CATEGORIES.indexOf(currentCategory) === SKILL_CATEGORIES.length - 1;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your personalized assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-900 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700">No questions available for this category.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full opacity-20 -z-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full opacity-20 -z-10 blur-3xl"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
      
      {/* Student Info Banner */}
      {store.studentInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-8 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Personalized assessment for:</span> {store.studentInfo.name} | {store.studentInfo.currentRole} | Target: {store.studentInfo.targetRole}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Skill Assessment</h1>
          <span className="text-sm font-medium text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-full shadow-sm border border-blue-100">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Category and question navigation */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <span className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-2 shadow-sm border border-blue-200">
            {currentCategory.replace('_', ' ')}
          </span>
          <h2 className="text-lg font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: questions.length }).map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full shadow-sm ${
                index === currentQuestionIndex 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                  : index < currentQuestionIndex 
                    ? 'bg-blue-300' 
                    : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6 border border-gray-100 relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-bl-3xl opacity-50"></div>
        
        <div className="p-8 relative">
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full p-3 mr-4 shadow-sm">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="space-y-3 mb-6">
            {Object.entries(currentQuestion.options).map(([key, text]) => (
              <button
                key={key}
                onClick={() => !selectedAnswer && handleAnswer(key)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left p-4 rounded-lg border ${
                  selectedAnswer === key
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
                } transition-all duration-200 focus:outline-none`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                    selectedAnswer === key
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-200 text-blue-700 border-2 border-blue-500 shadow-sm'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                  }`}>
                    {key.toUpperCase()}
                  </div>
                  <span className={`${
                    selectedAnswer === key
                      ? 'text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}>
                    {text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-indigo-50 px-8 py-4 flex justify-between items-center border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {/* Remove the correct/incorrect text */}
          </div>
          {selectedAnswer && (
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              {isLastQuestion ? 'View Results' : 'Next Question'}
              <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 