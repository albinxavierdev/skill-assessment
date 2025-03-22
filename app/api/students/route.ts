import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '../../../lib/supabaseService';
import { Student } from '../../../lib/studentStore';
import { supabaseAdmin } from '../../../lib/supabase';

// Helper function to validate student data
const validateStudentData = (data: any): { valid: boolean; errors?: string[] } => {
  const errors: string[] = [];
  const requiredFields = ['name', 'email', 'phone', 'collegeName', 'degree', 'passingYear', 'domainInterest'];
  
  // Check for missing fields
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  }
  
  // Validate email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate phone format
  if (data.phone && !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone number must be 10 digits');
  }
  
  // Validate passing year
  if (data.passingYear) {
    const year = Number(data.passingYear);
    if (isNaN(year) || year < 2000 || year > 2030) {
      errors.push('Passing year must be between 2000 and 2030');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

// GET handler to fetch all students
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/students: Fetching all students');
    
    const result = await supabaseService.getAllStudents();
    
    if (!result.success) {
      console.error('GET /api/students: Failed to fetch students:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch students' },
        { status: 500 }
      );
    }
    
    console.log(`GET /api/students: Successfully fetched ${result.data?.length || 0} students`);
    return NextResponse.json({ 
      success: true, 
      students: result.data,
      count: result.data?.length || 0
    });
  } catch (error) {
    console.error('Unhandled error in GET /api/students:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST handler to create a new student
export async function POST(request: NextRequest) {
  try {
    const studentData = await request.json();
    console.log('POST /api/students: Creating new student:', studentData);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Basic validation
    if (!studentData.name || !studentData.email) {
      console.error('POST /api/students: Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Check if student with this email already exists
    const existsCheck = await supabaseService.checkStudentExists(studentData.email);
    if (existsCheck.exists) {
      console.error('POST /api/students: Student with this email already exists');
      return NextResponse.json(
        { success: false, error: 'A student with this email already exists' },
        { status: 409 }
      );
    }
    
    console.log('POST /api/students: Validation passed, calling supabaseService.saveStudent');
    
    // Try direct insertion using admin client if service role key is available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Map camelCase properties to database column names
        const mappedStudent = {
          name: studentData.name,
          email: studentData.email,
          phone: studentData.phone,
          collegename: studentData.collegeName,
          degree: studentData.degree,
          passingyear: studentData.passingYear,
          domaininterest: studentData.domainInterest,
          created_at: new Date().toISOString(),
        };
        
        console.log('Using admin client to bypass RLS, data:', mappedStudent);
        
        const { data, error } = await supabaseAdmin
          .from('students')
          .insert([mappedStudent])
          .select('id')
          .single();
          
        if (error) {
          console.error('Error using admin client:', error);
          // Fall back to regular service
        } else {
          console.log('Successfully created student with admin client, ID:', data.id);
          return NextResponse.json({ 
            success: true, 
            id: data.id,
            student: studentData
          });
        }
      } catch (adminError) {
        console.error('Exception using admin client:', adminError);
        // Fall back to regular service
      }
    }
    
    // Create student in database using regular service
    const result = await supabaseService.saveStudent(studentData as Student);
    
    console.log('POST /api/students: supabaseService.saveStudent returned:', result);
    
    if (!result.success) {
      console.error('POST /api/students: Failed to create student:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create student' },
        { status: 500 }
      );
    }
    
    console.log('POST /api/students: Successfully created student with ID:', result.id);
    return NextResponse.json({ 
      success: true, 
      id: result.id,
      student: studentData
    });
  } catch (error) {
    console.error('Unhandled error in POST /api/students:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET handler to fetch a specific student by ID
export async function GET_BY_ID(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log(`GET /api/students/${id}: Fetching student by ID`);
    
    const result = await supabaseService.getStudentById(id);
    
    if (!result.success) {
      console.error(`GET /api/students/${id}: Failed to fetch student:`, result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch student' },
        { status: 500 }
      );
    }
    
    if (!result.data) {
      console.error(`GET /api/students/${id}: Student not found`);
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    
    console.log(`GET /api/students/${id}: Successfully fetched student`);
    return NextResponse.json({ 
      success: true, 
      student: result.data
    });
  } catch (error) {
    console.error('Unhandled error in GET_BY_ID /api/students:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 