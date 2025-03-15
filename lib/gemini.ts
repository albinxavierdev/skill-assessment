import { Question, SkillCategory, CategoryScores, StudentInfo, Report } from './types';
import { CATEGORY_DETAILS, SCORE_THRESHOLDS, QUESTION_WEIGHTS } from '../config/categories';

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
export function generateDefaultReport(scores: CategoryScores, studentInfo: StudentInfo): Report {
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  const performanceLevel = getPerformanceLevel(avgScore);
  
  return {
    executiveSummary: `${studentInfo.name} has achieved an overall score of ${avgScore.toFixed(1)}%, which is rated as "${performanceLevel}". This assessment provides insights into strengths and areas for improvement across various skill categories.`,
    categoryAnalysis: Object.fromEntries(
      Object.entries(scores).map(([category, score]) => [
        category,
        {
          score,
          analysis: `Your performance in ${category} is ${getPerformanceLevel(score)}.`,
          recommendations: [
            `Focus on improving your ${CATEGORY_DETAILS[category as SkillCategory].focusAreas[0]} skills.`,
            `Consider taking courses related to ${category}.`
          ]
        }
      ])
    ),
    recommendations: [
      "Develop a structured learning plan",
      "Focus on your weakest areas first",
      "Seek mentorship in your field"
    ],
    learningResources: [
      "Online courses on platforms like Coursera and Udemy",
      "Industry-specific certifications",
      "Books and articles on professional development"
    ],
    careerPathSuggestions: [
      studentInfo.targetRole,
      "Related roles based on your strengths"
    ],
    actionPlan: {
      month1: ["Assess current skills in detail", "Set specific learning goals", "Begin foundational courses"],
      month2: ["Complete intermediate training", "Apply skills in practical projects", "Seek feedback from peers"],
      month3: ["Specialize in advanced topics", "Network with industry professionals", "Update resume with new skills"]
    }
  };
} 