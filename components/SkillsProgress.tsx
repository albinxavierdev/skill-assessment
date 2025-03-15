'use client';

import React, { useEffect, useState } from 'react';
import { CategoryScores } from '../lib/types';

interface SkillsProgressProps {
  scores: CategoryScores;
}

export default function SkillsProgress({ scores }: SkillsProgressProps) {
  const [ChartComponents, setChartComponents] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Dynamically import Chart.js components
    const loadCharts = async () => {
      try {
        const ChartJS = await import('chart.js');
        const ReactChartJS = await import('react-chartjs-2');
        
        // Register required components
        ChartJS.Chart.register(
          ChartJS.CategoryScale,
          ChartJS.LinearScale,
          ChartJS.PointElement,
          ChartJS.LineElement,
          ChartJS.Tooltip,
          ChartJS.Legend
        );
        
        setChartComponents({
          Line: ReactChartJS.Line
        });
      } catch (err) {
        console.error('Error loading Chart.js:', err);
        setError(err instanceof Error ? err : new Error('Failed to load chart components'));
      }
    };
    
    loadCharts();
  }, []);

  // If not mounted or error loading charts, show a placeholder
  if (!mounted || error || !ChartComponents) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills Progress</h3>
        <div className="h-64 flex items-center justify-center">
          {error ? (
            <div className="text-red-500">
              Failed to load chart: {error.message}
            </div>
          ) : (
            <div className="animate-pulse text-gray-400">Loading progress chart...</div>
          )}
        </div>
      </div>
    );
  }

  // Generate simulated historical data (3 months ago)
  const generateHistoricalData = (currentScores: CategoryScores) => {
    const categories = Object.keys(currentScores);
    const currentValues = Object.values(currentScores);
    
    // Simulate data from 3 months ago (lower scores)
    const threeMonthsAgo = currentValues.map(score => {
      // Random reduction between 10-25%
      const reduction = 10 + Math.random() * 15;
      return Math.max(0, score - reduction);
    });
    
    // Simulate data from 2 months ago (some improvement)
    const twoMonthsAgo = currentValues.map((score, index) => {
      const startValue = threeMonthsAgo[index];
      const endValue = score;
      // Progress about 40% of the way
      return startValue + (endValue - startValue) * 0.4;
    });
    
    // Simulate data from 1 month ago (more improvement)
    const oneMonthAgo = currentValues.map((score, index) => {
      const startValue = threeMonthsAgo[index];
      const endValue = score;
      // Progress about 70% of the way
      return startValue + (endValue - startValue) * 0.7;
    });
    
    return {
      categories,
      datasets: [
        {
          label: '3 Months Ago',
          data: threeMonthsAgo
        },
        {
          label: '2 Months Ago',
          data: twoMonthsAgo
        },
        {
          label: '1 Month Ago',
          data: oneMonthAgo
        },
        {
          label: 'Current',
          data: currentValues
        }
      ]
    };
  };

  const historicalData = generateHistoricalData(scores);
  
  // Select a few key categories to show progress for
  const keyCategories = Object.keys(scores).slice(0, 3);
  
  // Prepare line chart data for progress over time
  const lineData = {
    labels: ['3 Months Ago', '2 Months Ago', '1 Month Ago', 'Current'],
    datasets: keyCategories.map((category, index) => {
      const hue = (index * 137) % 360;
      const color = `hsla(${hue}, 70%, 60%, 1)`;
      
      return {
        label: category,
        data: historicalData.datasets.map(dataset => {
          const categoryIndex = historicalData.categories.indexOf(category);
          return dataset.data[categoryIndex];
        }),
        borderColor: color,
        backgroundColor: `hsla(${hue}, 70%, 60%, 0.2)`,
        tension: 0.3,
        fill: false
      };
    })
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)'
        }
      }
    }
  };

  const { Line } = ChartComponents;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">Skills Progress Over Time</h2>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-6">
          This chart shows your simulated progress over the last 3 months for key skill categories. 
          Continue practicing to see your skills improve over time.
        </p>
        <div className="h-80">
          <Line data={lineData} options={chartOptions} />
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-md font-medium text-blue-800 mb-2">
            <span className="inline-block mr-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Note
          </h3>
          <p className="text-sm text-blue-700">
            This is a simulated view of your progress. As you continue to take assessments, 
            we'll track your actual progress over time and update this chart with real data.
          </p>
        </div>
      </div>
    </div>
  );
} 