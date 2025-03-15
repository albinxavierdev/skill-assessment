'use client';

import React, { useEffect, useState } from 'react';
import { CategoryScores } from '../lib/types';

// Lazy load Chart.js components to avoid SSR issues
export default function DynamicCharts({ scores }: { scores: CategoryScores }) {
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
          ChartJS.ArcElement,
          ChartJS.RadialLinearScale,
          ChartJS.Tooltip,
          ChartJS.Legend
        );
        
        setChartComponents({
          Doughnut: ReactChartJS.Doughnut,
          PolarArea: ReactChartJS.PolarArea
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
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills Overview</h3>
          <div className="h-64 flex items-center justify-center">
            {error ? (
              <div className="text-red-500">
                Failed to load charts: {error.message}
              </div>
            ) : (
              <div className="animate-pulse text-gray-400">Loading charts...</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const categories = Object.keys(scores);
  const scoreValues = Object.values(scores);
  
  // Generate colors for chart segments
  const backgroundColors = categories.map((_, index) => {
    const hue = (index * 137) % 360; // Golden angle approximation for good distribution
    return `hsla(${hue}, 70%, 60%, 0.7)`;
  });
  
  const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));

  // Doughnut chart data
  const doughnutData = {
    labels: categories,
    datasets: [
      {
        data: scoreValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
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
            return `${context.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
  };

  const { Doughnut } = ChartComponents;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills Distribution</h3>
      <div className="h-64">
        <Doughnut data={doughnutData} options={chartOptions} />
      </div>
    </div>
  );
} 