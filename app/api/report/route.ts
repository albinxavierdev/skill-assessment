import { NextResponse } from 'next/server';
import { generateReport } from '../../../lib/deepseek';
import { CategoryScores, StudentInfo } from '../../../lib/types';

export async function POST(request: Request) {
  try {
    const { scores, studentInfo } = await request.json();

    if (!scores || !studentInfo) {
      return NextResponse.json(
        { error: 'Scores and student info are required' },
        { status: 400 }
      );
    }

    const report = await generateReport(
      scores as CategoryScores,
      studentInfo as StudentInfo
    );
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 