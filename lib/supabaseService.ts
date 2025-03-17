import { supabase, supabaseAdmin } from './supabase';
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

// Get the appropriate client (admin if available, otherwise regular)
const getClient = () => {
  const useAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY !== undefined;
  console.log(`Using ${useAdmin ? 'admin' : 'regular'} Supabase client`);
  return useAdmin ? supabaseAdmin : supabase;
};

// Service for handling student data in Supabase
export const supabaseService = {
  // Save student data to Supabase
  async saveStudent(student: Student): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      console.log('Preparing to save student data to Supabase table:', STUDENTS_TABLE);
      console.log('Student data received:', JSON.stringify(student, null, 2));
      
      // Validate required fields
      const requiredFields = ['name', 'email', 'phone', 'collegeName', 'degree', 'passingYear', 'domainInterest'] as const;
      const missingFields = requiredFields.filter(field => !student[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        return { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        };
      }
      
      // Map camelCase properties to database column names
      // Using the exact column names from the database
      const mappedStudent = {
        name: student.name,
        email: student.email,
        phone: student.phone,
        collegename: student.collegeName, // Using camelCase for database columns
        degree: student.degree,
        passingyear: student.passingYear, // Using camelCase for database columns
        domaininterest: student.domainInterest, // Using camelCase for database columns
        created_at: new Date().toISOString(),
      };

      console.log('Student data mapped to database columns:', mappedStudent);

      // Get the appropriate client
      const client = getClient();

      // Insert the student data into the Supabase table with retry logic
      const { data, error } = await withRetry(async () => {
        console.log('Inserting student data into Supabase...');
        return await client
          .from(STUDENTS_TABLE)
          .insert([mappedStudent])
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

  /**
   * Get all students from the database
   */
  async getAllStudents() {
    try {
      console.log('Fetching all students from Supabase table:', STUDENTS_TABLE);
      
      // Get the appropriate client
      const client = getClient();
      
      const { data, error } = await client
        .from(STUDENTS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        return { success: false, error: error.message };
      }

      console.log(`Successfully fetched ${data?.length || 0} students`);
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error fetching students:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Get a student by ID
   */
  async getStudentById(id: string) {
    try {
      console.log(`Fetching student with ID ${id} from Supabase table:`, STUDENTS_TABLE);
      
      // Get the appropriate client
      const client = getClient();
      
      const { data, error } = await client
        .from(STUDENTS_TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching student with ID ${id}:`, error);
        return { success: false, error: error.message };
      }

      console.log(`Successfully fetched student with ID ${id}:`, data);
      return { success: true, data };
    } catch (error) {
      console.error(`Unexpected error fetching student with ID ${id}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Create a new student in the database
   */
  async createStudent(student: Omit<Student, 'id'>) {
    try {
      console.log('Supabase createStudent called with data:', student);
      console.log('Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      // Map camelCase properties to database column names
      // Using the exact column names from the database
      const mappedStudent = {
        name: student.name,
        email: student.email,
        phone: student.phone,
        collegename: student.collegeName, // Using camelCase for database columns
        degree: student.degree,
        passingyear: student.passingYear, // Using camelCase for database columns
        domaininterest: student.domainInterest, // Using camelCase for database columns
        created_at: new Date().toISOString(),
      };
      
      console.log('Student data mapped to database columns:', mappedStudent);
      
      // Get the appropriate client
      const client = getClient();
      
      const { data, error } = await client
        .from(STUDENTS_TABLE)
        .insert([mappedStudent])
        .select()
        .single();

      if (error) {
        console.error('Error creating student:', error);
        console.error('Error details:', JSON.stringify(error));
        
        // Check for specific error types
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, error: 'A student with this email already exists' };
        }
        
        return { success: false, error: error.message };
      }

      console.log('Supabase createStudent success, returned data:', data);
      return { success: true, data, id: data.id };
    } catch (error) {
      console.error('Unexpected error creating student:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Update an existing student in the database
   */
  async updateStudent(id: string, student: Partial<Student>) {
    try {
      console.log(`Updating student with ID ${id} in Supabase table:`, STUDENTS_TABLE);
      
      // Map camelCase properties to database column names
      const mappedUpdate: Record<string, any> = {};
      
      if (student.name) mappedUpdate.name = student.name;
      if (student.email) mappedUpdate.email = student.email;
      if (student.phone) mappedUpdate.phone = student.phone;
      if (student.collegeName) mappedUpdate.collegename = student.collegeName;
      if (student.degree) mappedUpdate.degree = student.degree;
      if (student.passingYear) mappedUpdate.passingyear = student.passingYear;
      if (student.domainInterest) mappedUpdate.domaininterest = student.domainInterest;
      
      console.log('Mapped update data:', mappedUpdate);
      
      // Get the appropriate client
      const client = getClient();
      
      const { data, error } = await client
        .from(STUDENTS_TABLE)
        .update(mappedUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating student with ID ${id}:`, error);
        return { success: false, error: error.message };
      }

      console.log(`Successfully updated student with ID ${id}:`, data);
      return { success: true, data };
    } catch (error) {
      console.error(`Unexpected error updating student with ID ${id}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
  
  /**
   * Check if a student with the given email exists
   */
  async checkStudentExists(email: string) {
    try {
      console.log(`Checking if student with email ${email} exists in Supabase table:`, STUDENTS_TABLE);
      
      // Get the appropriate client
      const client = getClient();
      
      const { data, error } = await client
        .from(STUDENTS_TABLE)
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error checking if student exists:', error);
        return { exists: false, error: error.message };
      }

      console.log(`Student with email ${email} exists:`, !!data);
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