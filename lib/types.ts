import { SKILL_CATEGORIES, CATEGORY_DETAILS } from '../config/categories';
import { AssessmentPhase } from './store';

export type SkillCategory = typeof SKILL_CATEGORIES[number];

export type StudentInfo = {
  name: string;
  email: string;
  currentRole: string;
  yearsOfExperience: number;
  targetRole: string;
};

export type Question = {
  question: string;
  focusArea: string;
  options: {
    [key: string]: string;
  };
  correct: string;
  explanation: string;
};

export type CategoryQuestions = {
  [key: string]: Question[];
};

export type CategoryScores = {
  [key: string]: number;
};

export type Report = {
  executiveSummary: string;
  categoryAnalysis: {
    [key: string]: {
      score: number;
      analysis: string;
      recommendations: string[];
    };
  };
  recommendations: string[];
  learningResources: string[];
  careerPathSuggestions: string[];
  actionPlan: {
    [key: string]: string[];
  };
};

export type AssessmentState = {
  currentPhase: AssessmentPhase;
  studentInfo: StudentInfo | null;
  questions: CategoryQuestions;
  currentCategory: SkillCategory | null;
  answers: { [key: string]: string };
  scores: CategoryScores;
  report: Report | null;
};

export type ChartData = {
  labels: string[];
  values: number[];
}; 