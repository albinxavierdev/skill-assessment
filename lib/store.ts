import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AssessmentState, StudentInfo, CategoryQuestions, SkillCategory } from './types';
import { SKILL_CATEGORIES } from '../config/categories';

export type AssessmentPhase = 'landing' | 'student_info' | 'assessment' | 'report';

interface AssessmentStore extends AssessmentState {
  setStudentInfo: (info: StudentInfo) => void;
  setCurrentPhase: (phase: AssessmentPhase) => void;
  setQuestions: (questions: CategoryQuestions) => void;
  setCurrentCategory: (category: SkillCategory) => void;
  submitAnswer: (category: SkillCategory, questionIndex: number, answer: string) => void;
  setScores: (scores: { [key: string]: number }) => void;
  setReport: (report: any) => void;
  resetAssessment: () => void;
}

const initialState: AssessmentState = {
  currentPhase: 'landing',
  studentInfo: null,
  questions: {},
  currentCategory: null,
  answers: {},
  scores: {},
  report: null,
};

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set) => ({
      ...initialState,

      setStudentInfo: (info) => set({ studentInfo: info }),
      
      setCurrentPhase: (phase) => set({ currentPhase: phase }),
      
      setQuestions: (questions) => set({ questions }),
      
      setCurrentCategory: (category) => set({ currentCategory: category }),
      
      submitAnswer: (category, questionIndex, answer) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [`${category}_${questionIndex}`]: answer,
          },
        })),
      
      setScores: (scores) => set({ scores }),
      
      setReport: (report) => set({ report }),
      
      resetAssessment: () => set(initialState),
    }),
    {
      name: 'assessment-store',
    }
  )
); 