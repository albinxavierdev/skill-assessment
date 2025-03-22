import { NextRequest, NextResponse } from 'next/server';
import { CATEGORY_DETAILS, SKILL_CATEGORIES } from '../../../config/categories';
import { CategoryScores, Report } from '../../../lib/types';
import { generateReport, generateDefaultReport } from '../../../lib/gemini';
import { Student } from '../../../lib/studentStore';

export async function POST(request: NextRequest) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables' }, { status: 500 });
  }

  try {
    const { scores, studentInfo } = await request.json() as { scores: CategoryScores; studentInfo: Student };
    
    console.log('Received request to generate report using Gemini AI');
    console.log('Student info:', studentInfo.name);
    console.log('Categories:', Object.keys(scores).join(', '));
    
    if (!scores || Object.keys(scores).length === 0) {
      console.error('Scores are required but were not provided');
      return NextResponse.json({ error: 'Scores are required' }, { status: 400 });
    }

    if (!studentInfo) {
      console.error('Student info is required but was not provided');
      return NextResponse.json({ error: 'Student info is required' }, { status: 400 });
    }

    try {
      // Use the Gemini AI client to generate report
      const report = await generateReport(scores, studentInfo);
      console.log('Successfully generated report using Gemini AI');
      
      return NextResponse.json({ 
        success: true, 
        report,
        source: 'gemini'
      });
    } catch (apiError) {
      console.error('Error calling Gemini AI API:', apiError);
      
      // Fall back to default report
      console.log('Falling back to default report generation');
      const defaultReport = generateDefaultReport(scores, studentInfo);
      
      return NextResponse.json({ 
        success: true, 
        report: defaultReport,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}