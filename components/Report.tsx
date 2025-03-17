'use client';

import React, { useEffect, useState } from 'react';
import { useAssessmentStore } from '../lib/store';
import { useStudentStore } from '../lib/studentStore';
import { getPerformanceLevel } from '../lib/gemini';
import { SCORE_THRESHOLDS } from '../config/categories';
import { CategoryScores } from '../lib/types';
import SimpleChart from './SimpleChart';
import ErrorBoundary from './ErrorBoundary';
import DynamicCharts from './DynamicCharts';
import ReportVisualizations from './ReportVisualizations';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Define the extended Report type to match what's actually in the API response
interface ExtendedReport {
  overallScore: number;
  summary: string;
  categoryAnalysis: {
    [key: string]: {
      score: number;
      analysis: string;
      recommendations: string[];
    };
  };
  actionPlan: {
    [key: string]: string[];
  };
}

export default function Report() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  
  const store = useAssessmentStore();
  const studentStore = useStudentStore();
  const { studentInfo, scores } = store;
  const studentDetails = studentStore.student;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const generateReportData = async () => {
      if (!studentInfo || Object.keys(scores).length === 0) {
        setError('Missing student information or assessment scores');
        setLoading(false);
        return;
      }

      try {
        // Call our API route directly
        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scores,
            studentInfo: studentDetails || studentInfo
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Log the source of the report (gemini or fallback)
        if (data.source === 'fallback') {
          console.log('Using fallback report generation due to API issues');
        }
        
        // The API returns a report with the ExtendedReport structure
        store.setReport(data.report);
        setLoading(false);
      } catch (err) {
        console.error('Error generating report:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate report');
        setLoading(false);
      }
    };

    if (mounted && !store.report) {
      generateReportData();
    } else if (mounted && store.report) {
      setLoading(false);
    }
  }, [mounted, store, studentInfo, scores, studentDetails]);

  // Function to download the report as PDF
  const downloadReportAsPDF = async () => {
    setDownloadingPdf(true);
    const reportElement = document.getElementById('report-container');
    
    if (!reportElement) {
      console.error('Report container not found');
      setDownloadingPdf(false);
      return;
    }
    
    try {
      const canvas = await html2canvas(reportElement, {
        scale: 1,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add new pages if the content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const studentName = (studentDetails?.name || studentInfo?.name || 'Student').replace(/\s+/g, '_');
      pdf.save(`SkillPrep_Assessment_${studentName}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Generating your personalized report...</h2>
          <p className="text-gray-500 mt-2">This may take a moment as we analyze your assessment results.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => store.resetAssessment()}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start New Assessment
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Use a type assertion to treat the report as ExtendedReport
  const report = store.report as unknown as ExtendedReport;
  const overallScore = report?.overallScore || 0;
  const performanceLevel = getPerformanceLevel(overallScore);

  return (
    <div id="report-container" className="container mx-auto px-4 py-8 max-w-5xl relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full opacity-20 -z-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full opacity-20 -z-10 blur-3xl"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
      
      {/* Header with Logo */}
      <div className="flex justify-between items-center mb-8">
        <img src="/logo.png" alt="SkillPrep Logo" className="h-12" />
        <div className="text-right">
          <p className="text-sm text-gray-500">Assessment Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      {/* Student Info and Overall Score */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-100 relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-bl-3xl opacity-50"></div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Assessment Report</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Student Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{studentDetails?.name || studentInfo?.name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{studentDetails?.email || studentInfo?.email || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500">Education</p>
                  <p className="font-medium">{studentDetails?.degree || studentInfo?.currentRole || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500">Passing Year</p>
                  <p className="font-medium">{studentDetails?.passingYear || studentInfo?.yearsOfExperience || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-blue-100 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Performance</h3>
              <div className="text-4xl font-bold mb-2 flex items-center">
                <span className={getScoreColor(overallScore)}>{overallScore.toFixed(1)}%</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceBadgeColor(performanceLevel)} shadow-sm`}>
                {performanceLevel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-100 relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-bl-3xl opacity-50"></div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Executive Summary</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 whitespace-pre-line">{report?.summary || ''}</p>
        </div>
      </div>

      {/* Score Overview */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-100 relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-bl-3xl opacity-50"></div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Score Overview</h2>
        </div>
        <div className="p-6">
          <ErrorBoundary fallback={
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-700">There was an error loading the chart. Please try refreshing the page.</p>
            </div>
          }>
            <DynamicCharts scores={scores as CategoryScores} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Detailed Visualizations */}
      <ErrorBoundary fallback={
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-700">There was an error loading the visualizations. Please try refreshing the page.</p>
        </div>
      }>
        {Object.keys(scores).length > 0 && (
          <ReportVisualizations scores={scores as CategoryScores} categoryAnalysis={report.categoryAnalysis} />
        )}
      </ErrorBoundary>

      {/* Category Analysis */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-100 relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-bl-3xl opacity-50"></div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Detailed Category Analysis</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(report.categoryAnalysis).map(([category, analysis]) => (
              <div key={category} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{category}</h3>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceBadgeColor(getPerformanceLevel(analysis.score))} shadow-sm`}>
                      {analysis.score.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-gray-700 mb-3">{analysis.analysis}</p>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Analysis */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-100 relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-bl-3xl opacity-50"></div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Question Analysis</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {Object.entries(store.questions).map(([category, questions]) => (
              <div key={category} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 border-b">
                  <h3 className="font-medium text-gray-900">{category.replace('_', ' ')}</h3>
                </div>
                <div className="p-4 bg-white">
                  {questions.map((question, index) => {
                    const answerKey = `${category}_${index}`;
                    const userAnswer = store.answers[answerKey];
                    const isCorrect = userAnswer === question.correct;
                    
                    return (
                      <div key={index} className="mb-6 last:mb-0 border-b pb-6 last:border-b-0 last:pb-0">
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-2">Question {index + 1}: {question.question}</h4>
                          <p className="text-sm text-gray-500 mb-2">Focus Area: {question.focusArea}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {Object.entries(question.options).map(([key, text]) => (
                              <div 
                                key={key}
                                className={`p-3 rounded-lg border ${
                                  key === question.correct
                                    ? 'bg-green-50 border-green-200'
                                    : key === userAnswer && key !== question.correct
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                } relative`}
                              >
                                {key === question.correct && (
                                  <div className="absolute top-2 right-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                                {key === userAnswer && key !== question.correct && (
                                  <div className="absolute top-2 right-2">
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </div>
                                )}
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs font-medium">
                                    {key.toUpperCase()}
                                  </div>
                                  <span className="text-gray-700">{text}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 shadow-sm">
                            <h5 className="text-sm font-medium text-blue-800 mb-1">Explanation:</h5>
                            <p className="text-sm text-blue-700">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-100 relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-bl-3xl opacity-50"></div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">3-Month Action Plan</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {Object.entries(report.actionPlan).map(([month, actions]) => (
              <div key={month} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-2">{formatMonth(month)}</h3>
                <ul className="space-y-2">
                  {actions.map((action, index) => (
                    <li key={index} className="flex bg-white p-2 rounded-lg border border-gray-100">
                      <div className="flex-shrink-0 h-5 w-5 text-blue-600">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <span className="ml-2 text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <button
          onClick={() => store.resetAssessment()}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          Start New Assessment
          <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={downloadReportAsPDF}
          disabled={downloadingPdf}
          className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-md text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
        >
          {downloadingPdf ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-gray-700 rounded-full"></span>
              Generating PDF...
            </>
          ) : (
            <>
              Download Report
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Helper functions for styling
function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.Excellent) {
    return 'text-green-600';
  } else if (score >= SCORE_THRESHOLDS.Good) {
    return 'text-blue-600';
  } else if (score >= SCORE_THRESHOLDS.Average) {
    return 'text-yellow-600';
  } else {
    return 'text-red-600';
  }
}

function getPerformanceBadgeColor(level: string): string {
  switch (level) {
    case 'Excellent':
      return 'bg-green-100 text-green-800';
    case 'Good':
      return 'bg-blue-100 text-blue-800';
    case 'Average':
      return 'bg-yellow-100 text-yellow-800';
    case 'Needs Improvement':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatMonth(month: string): string {
  switch (month) {
    case 'month1':
      return 'Month 1: Getting Started';
    case 'month2':
      return 'Month 2: Building Momentum';
    case 'month3':
      return 'Month 3: Advanced Development';
    default:
      return month;
  }
} 