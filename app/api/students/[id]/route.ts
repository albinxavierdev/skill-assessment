import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '../../../../lib/supabaseService';

// GET handler to fetch a specific student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    console.error('Unhandled error in GET /api/students/[id]:', error);
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