import { NextResponse } from 'next/server';
import { generateQuestions } from '../../../lib/gemini';
import { SkillCategory } from '../../../lib/types';

export async function POST(request: Request) {
  try {
    const { category } = await request.json();
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }
    
    const questions = await generateQuestions(category as SkillCategory);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
} 