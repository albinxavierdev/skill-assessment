import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabaseService } from './supabaseService';

export type Student = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  collegeName: string;
  degree: string;
  passingYear: number | string;
  domainInterest: string;
  created_at?: string;
};

interface StudentStore {
  student: Student | null;
  isLoading: boolean;
  error: string | null;
  setStudent: (student: Student) => void;
  clearStudent: () => void;
  syncWithServer: () => Promise<void>;
  validateState: () => boolean;
}

export const useStudentStore = create<StudentStore>()(
  persist(
    (set, get) => ({
      student: null,
      isLoading: false,
      error: null,
      
      setStudent: (student) => set({ student, error: null }),
      
      clearStudent: () => set({ student: null, error: null }),
      
      // Sync with server
      syncWithServer: async () => {
        const currentStudent = get().student;
        if (!currentStudent?.id) return;
        
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseService.getStudentById(currentStudent.id);
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to sync with server');
          }
          
          if (result.data) {
            set({ student: result.data, isLoading: false });
          } else {
            // Student not found on server
            console.warn('Student not found on server, keeping local data');
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error syncing with server:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            isLoading: false 
          });
        }
      },
      
      // Validate state
      validateState: () => {
        const student = get().student;
        if (!student) return true;
        
        const requiredFields = ['name', 'email', 'phone', 'collegeName', 'degree', 'passingYear', 'domainInterest'] as const;
        return requiredFields.every(field => !!student[field]);
      }
    }),
    {
      name: 'student-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validate state after rehydration
          if (!state.validateState()) {
            console.warn('Invalid state detected after rehydration, clearing student data');
            state.clearStudent();
          }
        }
      }
    }
  )
); 