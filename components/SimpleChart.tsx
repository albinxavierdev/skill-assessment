'use client';

import React from 'react';
import { CategoryScores } from '../lib/types';

interface SimpleChartProps {
  scores: CategoryScores;
}

export default function SimpleChart({ scores }: SimpleChartProps) {
  const categories = Object.keys(scores);
  const scoreValues = Object.values(scores);
  
  // Generate colors for chart segments
  const backgroundColors = categories.map((_, index) => {
    const hue = (index * 137) % 360; // Golden angle approximation for good distribution
    return `hsla(${hue}, 70%, 60%, 0.7)`;
  });

  const maxScore = Math.max(...scoreValues, 100); // Cap at 100 or the highest score

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills Overview</h3>
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={category} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{category}</span>
              <span className="font-medium">{scoreValues[index].toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full" 
                style={{
                  width: `${(scoreValues[index] / maxScore) * 100}%`,
                  backgroundColor: backgroundColors[index]
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 