import { Question, SkillCategory, CategoryScores, Report } from './types';
import { CATEGORY_DETAILS, SCORE_THRESHOLDS, QUESTION_WEIGHTS } from '../config/categories';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Student } from './studentStore';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the generative model - using gemini-2.0-flash for better performance
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: 10,
  requestTimestamps: [] as number[],
};

// Helper function to implement rate limiting
const checkRateLimit = (): boolean => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Remove timestamps older than 1 minute
  RATE_LIMIT.requestTimestamps = RATE_LIMIT.requestTimestamps.filter(
    timestamp => timestamp > oneMinuteAgo
  );

  // Check if we've exceeded the rate limit
  if (RATE_LIMIT.requestTimestamps.length >= RATE_LIMIT.maxRequestsPerMinute) {
    return false;
  }

  // Add current timestamp and allow the request
  RATE_LIMIT.requestTimestamps.push(now);
  return true;
};

// Calculate scores based on answers
export function calculateScores(
  answers: { [key: string]: string },
  questions: { [category: string]: Question[] }
): CategoryScores {
  const scores: CategoryScores = {};

  Object.entries(questions).forEach(([category, categoryQuestions]) => {
    let correctCount = 0;
    let totalQuestions = categoryQuestions.length;

    if (totalQuestions === 0) {
      scores[category] = 0;
      return;
    }

    categoryQuestions.forEach((question, index) => {
      const answerKey = `${category}_${index}`;
      if (answers[answerKey] === question.correct) {
        correctCount++;
      }
    });

    // Calculate base score as percentage
    const baseScore = (correctCount / totalQuestions) * 100;

    // Apply category weight if available
    const weight = QUESTION_WEIGHTS[category as SkillCategory] || 1.0;
    const weightedScore = baseScore * weight;

    // Round to one decimal place and cap at 100%
    scores[category] = Math.min(Math.round(weightedScore * 10) / 10, 100);
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
  const totalWeight = Object.keys(scores).reduce((sum, category) =>
    sum + (QUESTION_WEIGHTS[category as SkillCategory] || 1.0), 0);
    
  const weightedSum = Object.entries(scores).reduce((sum, [category, score]) =>
    sum + score * (QUESTION_WEIGHTS[category as SkillCategory] || 1.0), 0);

  const avgScore = Math.min(Math.round((weightedSum / totalWeight) * 10) / 10, 100);
  const performanceLevel = getPerformanceLevel(avgScore);

  const executiveSummary = `${studentInfo.name} has demonstrated ${performanceLevel.toLowerCase()} proficiency across the assessed skill categories, with a weighted average score of ${avgScore.toFixed(1)}%.`;

  const categoryAnalysis: Report['categoryAnalysis'] = {};

  Object.entries(scores).forEach(([category, score]) => {
    const level = getPerformanceLevel(score);
    const details = CATEGORY_DETAILS[category as SkillCategory];
    const weight = QUESTION_WEIGHTS[category as SkillCategory] || 1.0;

    categoryAnalysis[category] = {
      score: Math.round(score * 10) / 10,
      weight,
      analysis: `${level} proficiency (${score.toFixed(1)}%). ${details?.description || ''} (Weight: ${weight.toFixed(1)}x)`,
      recommendations: details?.focusAreas?.map(area => `Improve ${area} skills`) || [],
    };
  });

  return {
    executiveSummary,
    categoryAnalysis,
    recommendations: ['Focus on improving weak areas', 'Pursue relevant certifications'],
    learningResources: ['Coursera', 'Udemy', 'FreeCodeCamp'],
    careerPathSuggestions: ['Software Developer', 'Technical Consultant'],
    actionPlan: {
      'Immediate (1-3 months)': ['Complete online courses', 'Start a portfolio project'],
      'Short-term (3-6 months)': ['Obtain certifications', 'Contribute to open-source'],
      'Long-term (6-12 months)': ['Apply for jobs', 'Network with professionals'],
    },
  };
}

// Extract JSON from Gemini API response
export function extractJsonFromResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        throw new Error('Failed to parse JSON from response');
      }
    } else {
      throw new Error('No JSON found in response');
    }
  }
}

// Generate questions using Gemini AI
export async function generateQuestions(category: SkillCategory, studentInfo: Student): Promise<Question[]> {
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const categoryInfo = CATEGORY_DETAILS[category];
  if (!categoryInfo) {
    throw new Error(`Invalid category: ${category}`);
  }

  // Get current student info from the store to ensure fresh data
  const { studentInfo: currentStudentInfo } = useAssessmentStore.getState();

  let prompt = `Generate 5 challenging multiple-choice questions for assessing ${category}.
    Category Description: ${categoryInfo.description}
    Focus Areas: ${categoryInfo.focusAreas.join(', ')}

    Student Context:
    - Current Role: ${currentStudentInfo?.currentRole || 'Student'}
    - Years of Experience: ${currentStudentInfo?.yearsOfExperience || 0}
    - Target Role: ${currentStudentInfo?.targetRole || 'Entry-level position'}

    Important Guidelines:
    1. Address the student directly using "you" in all scenarios
    2. NEVER use any placeholder names, fictional characters, or third-person scenarios
    3. Make scenarios highly relevant to: ${studentInfo?.currentRole || 'student'}
    4. Focus on ${studentInfo?.yearsOfExperience === 0 ? 'academic and early-career' : 'professional'} contexts
    5. Ensure questions reflect situations a ${studentInfo?.targetRole || 'entry-level professional'} would encounter
    6. Start each question with "In your role as..." or "During your academic project..."
    7. Tailor difficulty and complexity to match the student's ${studentInfo?.yearsOfExperience || 0} years of experience
    8. Use first-person perspective consistently ("you", "your") throughout all questions
    9. Make scenarios authentic to the student's current academic stage and career goals
    10. Frame questions around real-world scenarios relevant to the category being assessed
    11. Include technical concepts and best practices specific to the category
    12. Reference industry-standard tools and frameworks commonly used in the field`;
    
  // Add personalization if provided
  if (personalizationPrompt) {
    prompt += `\n\nAdditional Context: ${personalizationPrompt}`;
  }

  
  prompt += `\n
    Each question should:
    1. Test one of the focus areas mentioned above
    2. Present a complex, realistic workplace scenario that requires critical thinking
    3. Have exactly 4 options labeled a, b, c, d
    4. Have exactly one correct answer
    5. Make the options nuanced and not obviously right or wrong
    6. Include a detailed explanation for the correct answer
    7. Target a high difficulty level (suitable for professionals)

    Return the response in the following JSON format:
    [
      {
        "question": "What would you do in this complex workplace scenario...?",
        "focusArea": "one of the focus areas",
        "options": {
          "a": "First option description - make this nuanced and plausible",
          "b": "Second option description - make this nuanced and plausible",
          "c": "Third option description - make this nuanced and plausible",
          "d": "Fourth option description - make this nuanced and plausible"
        },
        "correct": "a",
        "explanation": "Detailed explanation why this is the correct answer, including the reasoning and principles behind it"
      }
    ]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const questions = extractJsonFromResponse(text) as Question[];
    
    // Shuffle options for each question
    return questions.map(shuffleOptions);
  } catch (error) {
    console.error('Error generating questions with Gemini AI:', error);
    throw error;
  }
}

// Generate report using Gemini AI
export async function generateReport(scores: CategoryScores, studentInfo: Student): Promise<Report> {
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Calculate overall score
  const totalWeight = Object.keys(scores).reduce((sum, category) =>
    sum + (QUESTION_WEIGHTS[category as SkillCategory] || 1.0), 0);
    
  const weightedSum = Object.entries(scores).reduce((sum, [category, score]) =>
    sum + score * (QUESTION_WEIGHTS[category as SkillCategory] || 1.0), 0);

  const avgScore = Math.min(Math.round((weightedSum / totalWeight) * 10) / 10, 100);
  const performanceLevel = getPerformanceLevel(avgScore);

  // Prepare category details for the prompt
  const categoryDetails = Object.entries(scores)
    .map(([category, score]) => {
      const level = getPerformanceLevel(score);
      const details = CATEGORY_DETAILS[category as SkillCategory];
      const weight = QUESTION_WEIGHTS[category as SkillCategory] || 1.0;
      return `${category}: ${score.toFixed(1)}% (${level}, Weight: ${weight.toFixed(1)}x)\nDescription: ${details?.description || 'N/A'}\nFocus Areas: ${details?.focusAreas.join(', ') || 'N/A'}`;
    })
    .join('\n\n');

  const prompt = `Generate a comprehensive professional skills assessment report for ${studentInfo.name}.\n\nStudent Information:\n- Name: ${studentInfo.name}\n- Email: ${studentInfo.email}\n- Current Role: ${studentInfo.currentRole}\n- Years of Experience: ${studentInfo.yearsOfExperience}\n- Target Role: ${studentInfo.targetRole}\n\nAssessment Results:\n- Overall Score: ${avgScore.toFixed(1)}% (${performanceLevel})\n\nCategory Scores:\n${categoryDetails}\n\nPlease generate a detailed report with the following sections:\n1. Executive Summary: A brief overview of the assessment results\n2. Category Analysis: Detailed analysis for each skill category with specific recommendations\n3. General Recommendations: Overall recommendations for skill improvement\n4. Learning Resources: Specific resources (courses, books, etc.) for improvement\n5. Career Path Suggestions: Based on strengths and target role\n6. Action Plan: Immediate (1-3 months), Short-term (3-6 months), and Long-term (6-12 months) actions\n\nReturn the response in the following JSON format:\n{\n  "executiveSummary": "Brief overview of assessment results...",\n  "categoryAnalysis": {\n    "category_name": {\n      "score": 85.5,\n      "weight": 1.2,\n      "analysis": "Detailed analysis of performance in this category...",\n      "recommendations": ["Specific recommendation 1", "Specific recommendation 2"]\n    }\n  },\n  "recommendations": ["General recommendation 1", "General recommendation 2"],\n  "learningResources": ["Resource 1", "Resource 2"],\n  "careerPathSuggestions": ["Career path 1", "Career path 2"],\n  "actionPlan": {\n    "Immediate (1-3 months)": ["Action 1", "Action 2"],\n    "Short-term (3-6 months)": ["Action 1", "Action 2"],\n    "Long-term (6-12 months)": ["Action 1", "Action 2"]\n  }\n}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return extractJsonFromResponse(text) as Report;
  } catch (error) {
    console.error('Error generating report with Gemini AI:', error);
    throw error;
  }
}

export default {
  extractJsonFromResponse,
  generateQuestions,
  generateReport,
  shuffleOptions,
  getPerformanceLevel,
  generateDefaultQuestions,
  generateDefaultReport,
};
