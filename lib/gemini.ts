import { Question, SkillCategory, CategoryScores, Report } from './types';
import { CATEGORY_DETAILS, SCORE_THRESHOLDS, QUESTION_WEIGHTS } from '../config/categories';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Student } from './studentStore';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Get the generative model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Calculate scores based on answers
export function calculateScores(
  answers: { [key: string]: string },
  questions: { [category: string]: Question[] }
): CategoryScores {
  const scores: CategoryScores = {};
  
  Object.entries(questions).forEach(([category, categoryQuestions]) => {
    let correctCount = 0;
    let totalQuestions = categoryQuestions.length;
    
    categoryQuestions.forEach((question, index) => {
      const answerKey = `${category}_${index}`;
      if (answers[answerKey] === question.correct) {
        correctCount++;
      }
    });
    
    // Apply category weight if available
    const weight = QUESTION_WEIGHTS[category as SkillCategory] || 1.0;
    const weightedScore = (correctCount / totalQuestions) * 100 * weight;
    
    // Cap at 100%
    scores[category] = Math.min(weightedScore, 100);
  });
  
  return scores;
}

// Get performance level based on score
export function getPerformanceLevel(score: number): string {
  if (score >= SCORE_THRESHOLDS.Excellent) {
    return 'Excellent';
  } else if (score >= SCORE_THRESHOLDS.Good) {
    return 'Good';
  } else if (score >= SCORE_THRESHOLDS.Average) {
    return 'Average';
  } else {
    return 'Needs Improvement';
  }
}

// Helper function to shuffle options for a question
export function shuffleOptions(question: Question): Question {
  const options = Object.entries(question.options);
  const correctLetter = question.correct;
  const correctAnswer = question.options[correctLetter];

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Create new options dictionary
  const newOptions: { [key: string]: string } = {};
  let newCorrect = '';

  options.forEach(([_, answer], index) => {
    const letter = String.fromCharCode(97 + index); // 'a', 'b', 'c', 'd'
    newOptions[letter] = answer;
    if (answer === correctAnswer) {
      newCorrect = letter;
    }
  });

  return {
    ...question,
    options: newOptions,
    correct: newCorrect,
  };
}

// Generate default questions for fallback
export function generateDefaultQuestions(category: SkillCategory): Question[] {
  const focusAreas = CATEGORY_DETAILS[category].focusAreas;
  return Array(5)
    .fill(null)
    .map((_, i) => ({
      question: `Sample question ${i + 1} for ${category}: How would you handle a situation involving ${focusAreas[i % focusAreas.length]}?`,
      focusArea: focusAreas[i % focusAreas.length],
      options: {
        a: `Best practice approach for ${focusAreas[i % focusAreas.length]}`,
        b: 'Common but suboptimal approach',
        c: 'Incorrect approach',
        d: 'Completely wrong approach',
      },
      correct: 'a',
      explanation: `The best practice for ${focusAreas[i % focusAreas.length]} is to follow established guidelines and methodologies.`,
    }))
    .map(shuffleOptions);
}

// Generate default report for fallback
export function generateDefaultReport(scores: CategoryScores, studentInfo: Student): Report {
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  const performanceLevel = getPerformanceLevel(avgScore);
  
  const executiveSummary = `${studentInfo.name} has demonstrated ${performanceLevel.toLowerCase()} proficiency across the assessed skill categories, with an average score of ${avgScore.toFixed(1)}. Based on their interest in ${studentInfo.domainInterest}, we recommend focusing on the areas highlighted below to enhance employability.`;
  
  const categoryAnalysis: Report['categoryAnalysis'] = {};
  
  // Generate analysis for each category
  Object.entries(scores).forEach(([category, score]) => {
    const level = getPerformanceLevel(score);
    const details = CATEGORY_DETAILS[category as SkillCategory];
    
    categoryAnalysis[category] = {
      score,
      analysis: `${level} proficiency (${score.toFixed(1)}%). ${details?.description || ''}`,
      recommendations: details?.focusAreas?.map(area => `Improve ${area} skills`) || []
    };
  });
  
  // Generate career suggestions based on domain interest
  const careerPathSuggestions = [
    `${studentInfo.domainInterest} Developer`,
    `${studentInfo.domainInterest} Specialist`,
    `${studentInfo.domainInterest} Consultant`,
    'Technical Project Manager',
    'Product Manager'
  ];
  
  return {
    executiveSummary,
    categoryAnalysis,
    recommendations: [
      `Focus on improving skills in categories where you scored below 70%`,
      `Consider pursuing certifications in ${studentInfo.domainInterest}`,
      `Build a portfolio showcasing your ${studentInfo.domainInterest} projects`,
      `Join communities and forums related to ${studentInfo.domainInterest}`
    ],
    learningResources: [
      'Coursera and Udemy courses',
      'FreeCodeCamp tutorials',
      'YouTube educational channels',
      'Industry documentation and blogs'
    ],
    careerPathSuggestions,
    actionPlan: {
      'Immediate (1-3 months)': [
        'Complete online courses in weak areas',
        'Start building a portfolio project'
      ],
      'Short-term (3-6 months)': [
        'Obtain relevant certifications',
        'Contribute to open-source projects'
      ],
      'Long-term (6-12 months)': [
        'Apply for internships or entry-level positions',
        'Network with professionals in the industry'
      ]
    }
  };
}

/**
 * Generate questions for a specific skill category
 */
export async function generateQuestions(category: SkillCategory): Promise<string> {
  try {
    const prompt = `Generate 5 multiple-choice questions to assess a candidate's skills in ${category}. 
    Each question should have 4 options (A, B, C, D) with one correct answer. 
    Format the response as a JSON array of question objects, each with properties: 
    question, options (array of 4 strings), and correctAnswer (index of correct option).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    throw new Error('Failed to generate questions');
  }
}

/**
 * Generate a report based on assessment scores and student information
 */
export async function generateReport(scores: CategoryScores, studentInfo: Student): Promise<string> {
  try {
    const prompt = `Generate a detailed skills assessment report for a student with the following information:
    
    Student Information:
    Name: ${studentInfo.name}
    Email: ${studentInfo.email}
    College: ${studentInfo.collegeName}
    Degree: ${studentInfo.degree}
    Passing Year: ${studentInfo.passingYear}
    Domain Interest: ${studentInfo.domainInterest}
    
    Assessment Scores (out of 100):
    ${Object.entries(scores)
      .map(([category, score]) => `${category}: ${score}`)
      .join('\n')}
    
    Please include:
    1. An overall assessment of their skills
    2. Strengths and areas for improvement
    3. Recommended learning paths based on their domain interest
    4. Career opportunities that match their skill profile
    
    Format the response as a detailed report with sections.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating report with Gemini:', error);
    throw new Error('Failed to generate report');
  }
}

export default {
  generateQuestions,
  generateReport
}; 