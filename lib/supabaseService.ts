import { supabase } from './supabase';
import { Student } from './studentStore';

// Define the database table name
const STUDENTS_TABLE = 'students';

// Maximum number of retries for database operations
const MAX_RETRIES = 3;

// Helper function to implement retry logic
const withRetry = async <T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Operation failed (attempt ${attempt}/${retries}):`, error);
      
      // Don't wait on the last attempt
      if (attempt < retries) {
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Service for handling student data in Supabase
export const supabaseService = {
  // Save student data to Supabase
  async saveStudent(student: Student): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      console.log('Preparing to save student data to Supabase table:', STUDENTS_TABLE);
      
      // Validate required fields
      const requiredFields = ['name', 'email', 'phone', 'collegeName', 'degree', 'passingYear', 'domainInterest'] as const;
      const missingFields = requiredFields.filter(field => !student[field]);
      
      if (missingFields.length > 0) {
        return { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        };
      }
      
      // Add a timestamp for when the record was created
      const studentWithTimestamp = {
        ...student,
        created_at: new Date().toISOString(),
      };

      console.log('Student data with timestamp:', studentWithTimestamp);

      // Insert the student data into the Supabase table with retry logic
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from(STUDENTS_TABLE)
          .insert([studentWithTimestamp])
          .select('id');
      });

      if (error) {
        console.error('Error saving student to Supabase:', error);
        console.error('Error details:', error.details, error.hint, error.message);
        
        // Check for specific error types
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, error: 'A student with this email already exists' };
        }
        
        return { success: false, error: error.message };
      }

      console.log('Successfully saved student data, response:', data);
      return { success: true, id: data?.[0]?.id };
    } catch (error) {
      console.error('Exception saving student to Supabase:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },

  // Get all students from Supabase
  async getAllStudents(): Promise<{ success: boolean; data?: Student[]; error?: string }> {
    try {
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from(STUDENTS_TABLE)
          .select('*')
          .order('created_at', { ascending: false });
      });

      if (error) {
        console.error('Error fetching students from Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Student[] };
    } catch (error) {
      console.error('Exception fetching students from Supabase:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },

  // Get a student by ID
  async getStudentById(id: string): Promise<{ success: boolean; data?: Student; error?: string }> {
    try {
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from(STUDENTS_TABLE)
          .select('*')
          .eq('id', id)
          .single();
      });

      if (error) {
        console.error('Error fetching student from Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Student };
    } catch (error) {
      console.error('Exception fetching student from Supabase:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },
  
  // Check if a student with the given email exists
  async checkStudentExists(email: string): Promise<{ exists: boolean; error?: string }> {
    try {
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from(STUDENTS_TABLE)
          .select('id')
          .eq('email', email)
          .maybeSingle();
      });

      if (error) {
        console.error('Error checking if student exists:', error);
        return { exists: false, error: error.message };
      }

      return { exists: !!data };
    } catch (error) {
      console.error('Exception checking if student exists:', error);
      return { 
        exists: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}; 