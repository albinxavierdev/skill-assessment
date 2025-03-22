import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabaseService';

export async function POST(request: Request) {
  try {
    const { studentId, pdfData } = await request.json();

    if (!studentId || !pdfData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert base64 to Buffer
    const pdfBuffer = Buffer.from(pdfData, 'base64');

    // Update student record with PDF data
    const result = await supabaseService.updateStudentPdf(studentId, pdfBuffer);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}