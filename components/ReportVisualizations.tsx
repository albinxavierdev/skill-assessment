'use client';

import React, { useEffect, useState } from 'react';
import { CategoryScores } from '../lib/types';
import SimpleChart from './SimpleChart';

interface ReportVisualizationsProps {
  scores: CategoryScores;
  categoryAnalysis: any;
}

export default function ReportVisualizations({ scores, categoryAnalysis }: ReportVisualizationsProps) {
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
          ChartJS.CategoryScale,
          ChartJS.LinearScale,
          ChartJS.BarElement,
          ChartJS.LineElement,
          ChartJS.PointElement,
          ChartJS.Tooltip,
          ChartJS.Legend
        );
        
        setChartComponents({
          Bar: ReactChartJS.Bar,
          Line: ReactChartJS.Line,
          Radar: ReactChartJS.Radar
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Loading Visualizations...</h3>
          <div className="h-64 flex items-center justify-center">
            {error ? (
              <div className="text-red-500">
                Failed to load charts: {error.message}
              </div>
            ) : (
              <div className="animate-pulse text-gray-400">Loading additional visualizations...</div>
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

  // Extract strengths and weaknesses from category analysis
  const strengthsAndWeaknesses = categories.map(category => {
    const analysis = categoryAnalysis[category];
    const score = analysis?.score || 0;
    
    // Determine if this is a strength or weakness
    const isStrength = score >= 70;
    const isWeakness = score < 50;
    
    return {
      category,
      score,
      isStrength,
      isWeakness
    };
  });

  const strengths = strengthsAndWeaknesses.filter(item => item.isStrength);
  const weaknesses = strengthsAndWeaknesses.filter(item => item.isWeakness);

  // Bar chart data
  const barData = {
    labels: categories,
    datasets: [
      {
        label: 'Score',
        data: scoreValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
      {
        label: 'Benchmark',
        data: categories.map(() => 70), // 70% as benchmark
        backgroundColor: 'rgba(200, 200, 200, 0.3)',
        borderColor: 'rgba(200, 200, 200, 0.8)',
        borderWidth: 1,
        borderDash: [5, 5],
        type: 'line',
      }
    ],
  };

  // Radar chart data
  const radarData = {
    labels: categories,
    datasets: [
      {
        label: 'Your Skills',
        data: scoreValues,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      }
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
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100
      },
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

  const { Bar, Radar } = ChartComponents;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">Detailed Skill Visualizations</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills Comparison</h3>
            <div className="h-80">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
          
          {/* Radar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills Radar</h3>
            <div className="h-80">
              <Radar data={radarData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Strengths */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              <span className="inline-block mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Key Strengths
            </h3>
            {strengths.length > 0 ? (
              <ul className="space-y-3">
                {strengths.map((item) => (
                  <li key={item.category} className="flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <span className="text-sm font-medium text-green-600">{item.score.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-green-500" 
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No key strengths identified yet. Keep improving!</p>
            )}
          </div>
          
          {/* Weaknesses */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-red-100">
            <h3 className="text-lg font-semibold text-red-800 mb-4">
              <span className="inline-block mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              Areas for Improvement
            </h3>
            {weaknesses.length > 0 ? (
              <ul className="space-y-3">
                {weaknesses.map((item) => (
                  <li key={item.category} className="flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <span className="text-sm font-medium text-red-600">{item.score.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-red-500" 
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Great job! No significant weaknesses identified.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 