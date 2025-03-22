import { Question, SkillCategory, CategoryScores, Report } from './types';
import { CATEGORY_DETAILS, SCORE_THRESHOLDS, QUESTION_WEIGHTS } from '../config/categories';
import { Together } from 'together';
import { Student } from './studentStore';

// Initialize the Together AI client with your API key
const together = new Together(process.env.TOGETHER_API_KEY || '');

// Model configuration
const MODEL = 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free';

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

// Extract JSON from Together AI response
export function extractJsonFromResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\[\s\S]*\]|\{\s\S]*\}/);
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

// Generate questions using Together AI
export async function generateQuestions(category: SkillCategory, personalizationPrompt?: string): Promise<Question[]> {
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const categoryInfo = CATEGORY_DETAILS[category];
  if (!categoryInfo) {
    throw new Error(`Invalid category: ${category}`);
  }

  let prompt = `Generate 5 challenging multiple-choice questions for assessing ${category}.
    Category Description: ${categoryInfo.description}
    Focus Areas: ${categoryInfo.focusAreas.join(', ')}`;
    
  // Add personalization if provided
  if (personalizationPrompt) {
    prompt += `\n\nPersonalization Context: ${personalizationPrompt}`;
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
    const response = await together.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 8192,
    });

    const responseText = response.choices[0].message.content;
    const questions = extractJsonFromResponse(responseText) as Question[];
    
    // Shuffle options for each question
    return questions.map(shuffleOptions);
  } catch (error) {
    console.error('Error generating questions with Together AI:', error);
    throw error;
  }
}

// Generate report using Together AI
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

  const prompt = `Generate a comprehensive professional skills assessment report for ${studentInfo.name}.

Student Information:
- Name: ${studentInfo.name}
- Email: ${studentInfo.email}
- Current Role: ${studentInfo.currentRole}
- Years of Experience: ${studentInfo.yearsOfExperience}
- Target Role: ${studentInfo.targetRole}

Assessment Results:
- Overall Score: ${avgScore.toFixed(1)}% (${performanceLevel})

Category Scores:
${categoryDetails}

Please generate a detailed report with the following sections:
1. Executive Summary: A brief overview of the assessment results
2. Category Analysis: Detailed analysis for each skill category with specific recommendations
3. General Recommendations: Overall recommendations for skill improvement
4. Learning Resources: Specific resources (courses, books, etc.) for improvement
5. Career Path Suggestions: Based on strengths and target role
6. Action Plan: Immediate (1-3 months), Short-term (3-6 months), and Long-term (6-12 months) actions

Return the response in the following JSON format:
{
  "executiveSummary": "Brief overview of assessment results...",
  "categoryAnalysis": {
    "category_name": {
      "score": 85.5,
      "weight": 1.2,
      "analysis": "Detailed analysis of performance in this category...",
      "recommendations": ["Specific recommendation 1", "Specific recommendation 2"]
    }
  },
  "recommendations": ["General recommendation 1", "General recommendation 2"],
  "learningResources": ["Resource 1", "Resource 2"],
  "careerPathSuggestions": ["Career path 1", "Career path 2"],
  "actionPlan": {
    "Immediate (1-3 months)": ["Action 1", "Action 2"],
    "Short-term (3-6 months)": ["Action 1", "Action 2"],
    "Long-term (6-12 months)": ["Action 1", "Action 2"]
  }
}`;

  try {
    const response = await together.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 8192,
    });

    const responseText = response.choices[0].message.content;
    return extractJsonFromResponse(responseText) as Report;
  } catch (error) {
    console.error('Error generating report with Together AI:', error);
    throw error;
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

export default {
  extractJsonFromResponse,
  generateQuestions,
  generateReport,
  shuffleOptions,
  getPerformanceLevel,
};