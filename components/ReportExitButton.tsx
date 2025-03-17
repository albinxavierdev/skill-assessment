'use client';

import React, { useState } from 'react';
import { useAssessmentStore } from '../lib/store';

export default function ReportExitButton() {
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const store = useAssessmentStore();

  const handleExitClick = () => {
    setShowExitConfirmation(true);
  };

  const handleConfirmExit = () => {
    // Reset the current phase to landing
    store.setCurrentPhase('landing');
    // Redirect to home page
    window.location.href = '/';
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  return (
    <>
      {/* Exit Button */}
      <button
        onClick={handleExitClick}
        className="text-sm font-medium text-red-600 hover:text-red-800 border border-red-200 hover:border-red-300 px-3 py-1 rounded-full shadow-sm bg-white transition-colors"
      >
        Exit Report
      </button>

      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Exit Report?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit? You can always come back to view your report later.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelExit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Exit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 