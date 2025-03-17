'use client';

import React, { useEffect } from 'react';
import { downloadSkills2025Report, setupScrollPopup } from '../lib/utils';

export default function Skills2025Section() {
  useEffect(() => {
    // Setup the scroll popup when the component mounts
    const cleanup = setupScrollPopup('skills2025-section');
    
    // Clean up the event listener when the component unmounts
    return cleanup;
  }, []);

  const handleDownload = async () => {
    try {
      await downloadSkills2025Report();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div id="skills2025-section" className="max-w-6xl mx-auto px-6 py-16">
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl -z-10"></div>
        
        <div className="py-12 px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            Top Skills to Learn in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">2025</span>
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Based on our comprehensive Job Skills Report 2025, here are the most in-demand skills that students, job seekers, and employees should focus on to stay competitive in the evolving job market.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Students Column */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-2">S</span>
                Students
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-600">AI Skills</h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Supervised Learning
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Feature Engineering
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Foundational AI skills
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-600">Business Skills</h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Sustainability-related skills
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      HR Technology
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Risk Management
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Job Seekers Column */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm mr-2">J</span>
                Job Seekers
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600">AI Skills</h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Applied Machine Learning
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Reinforcement Learning
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Hands-on AI skills
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-green-600">Tech Skills</h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Infrastructure Security
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Software Development Methodologies
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Network Planning & Design
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Employees Column */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm mr-2">E</span>
                Employees
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-purple-600">Data Science Skills</h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Data Ethics
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Business Analytics
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Information Management
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-purple-600">Tech Skills</h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Incident Management & Response
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Threat Management & Modeling
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Security Information & Event Management
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Common Skills Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Common Skills Across All Groups</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-2">GenAI</h4>
                <p className="text-sm text-gray-700">Use AI to generate text, images, and more</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <h4 className="font-medium text-green-700 mb-2">Cybersecurity</h4>
                <p className="text-sm text-gray-700">Skills like Incident Management & Response, Threat Management & Modeling</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <h4 className="font-medium text-purple-700 mb-2">Data Ethics</h4>
                <p className="text-sm text-gray-700">Responsible use and management of data across all sectors</p>
              </div>
            </div>
          </div>
          
          {/* Download Button */}
          <div className="text-center">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Full Skills Report 2025
            </button>
            <p className="mt-2 text-sm text-gray-500">Get the complete report with detailed insights on in-demand skills</p>
          </div>
        </div>
      </div>
    </div>
  );
} 