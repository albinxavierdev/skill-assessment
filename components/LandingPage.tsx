'use client';

import React from 'react';
import { useAssessmentStore } from '../lib/store';
import { SKILL_CATEGORIES } from '../config/categories';

export default function LandingPage() {
  const setCurrentPhase = useAssessmentStore((state) => state.setCurrentPhase);

  return (
    <div className="space-y-24 py-10">
      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl -z-10"></div>
        
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
            Discover Your Professional{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Potential</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Comprehensive skill assessment and personalized recommendations to accelerate your career growth
          </p>
          <button
            onClick={() => setCurrentPhase('student_info')}
            className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Your Assessment
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-600">{SKILL_CATEGORIES.length}</p>
              <p className="text-gray-600">Skill Categories</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-600">5+</p>
              <p className="text-gray-600">Questions Per Skill</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-600">100%</p>
              <p className="text-gray-600">Personalized</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-600">3</p>
              <p className="text-gray-600">Month Action Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="relative">
            <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">1</div>
            <div className="bg-white rounded-xl shadow-lg p-8 h-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Profile</h3>
              <p className="text-gray-600">Tell us about your current role, experience, and career goals so we can tailor the assessment to your needs.</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">2</div>
            <div className="bg-white rounded-xl shadow-lg p-8 h-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Take the Assessment</h3>
              <p className="text-gray-600">Answer questions across multiple skill categories to help us understand your strengths and areas for improvement.</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">3</div>
            <div className="bg-white rounded-xl shadow-lg p-8 h-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Your Report</h3>
              <p className="text-gray-600">Receive a detailed analysis with personalized recommendations, career path suggestions, and a 3-month action plan.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-blue-500">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Comprehensive Assessment</h3>
            <p className="text-gray-600">Evaluate your skills across {SKILL_CATEGORIES.length} key professional areas with real-world scenarios</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-green-500">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Insights</h3>
            <p className="text-gray-600">Get personalized recommendations powered by advanced AI technology that adapts to your unique profile</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-purple-500">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Interactive Analytics</h3>
            <p className="text-gray-600">Visualize your strengths and areas for improvement with beautiful, interactive charts and detailed breakdowns</p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Skills We Assess</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">Our comprehensive assessment covers all the critical skills needed for professional success in today's competitive workplace</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {SKILL_CATEGORIES.map((category) => (
            <div
              key={category}
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-100"
            >
              <h3 className="font-medium text-gray-900">{category.replace('_', ' ')}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">JD</div>
              <div className="ml-4">
                <h4 className="font-semibold">John Doe</h4>
                <p className="text-sm text-gray-500">Software Engineer</p>
              </div>
            </div>
            <p className="text-gray-600 italic">"The assessment provided me with valuable insights about my technical skills and leadership abilities. The action plan was incredibly helpful for my career growth."</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">JS</div>
              <div className="ml-4">
                <h4 className="font-semibold">Jane Smith</h4>
                <p className="text-sm text-gray-500">Product Manager</p>
              </div>
            </div>
            <p className="text-gray-600 italic">"I was surprised by how accurate the assessment was. It identified areas I knew I needed to work on and suggested practical steps for improvement."</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">RJ</div>
              <div className="ml-4">
                <h4 className="font-semibold">Robert Johnson</h4>
                <p className="text-sm text-gray-500">Marketing Director</p>
              </div>
            </div>
            <p className="text-gray-600 italic">"The career path suggestions were eye-opening. I discovered options I hadn't considered before that aligned perfectly with my strengths."</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-white opacity-10"></div>
          
          <div className="relative text-center p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Advance Your Career?
            </h2>
            <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
              Take the first step towards understanding and improving your professional skills with our AI-powered assessment
            </p>
            <button
              onClick={() => setCurrentPhase('student_info')}
              className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-full text-white hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Begin Your Assessment
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 