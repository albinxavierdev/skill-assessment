import { NextRequest, NextResponse } from 'next/server';
import { CATEGORY_DETAILS, SKILL_CATEGORIES } from '../../../config/categories';
import { extractJsonFromResponse, generateQuestions, generateDefaultQuestions } from '../../../lib/gemini';

type CategoryKey = typeof SKILL_CATEGORIES[number];

interface QuestionOption {
  [key: string]: string;
}

interface Question {
  question: string;
  focusArea: string;
  options: QuestionOption;
  correct: string;
  explanation: string;
}

export async function POST(request: NextRequest) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables' }, { status: 500 });
  }

  try {
    const { category, personalizationPrompt } = await request.json() as { category: CategoryKey; personalizationPrompt?: string };
    
    console.log('Received request for category:', category);
    console.log('Personalization prompt:', personalizationPrompt ? personalizationPrompt.substring(0, 50) + '...' : 'None');
    
    if (!category) {
      console.error('Category is required but was not provided');
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const categoryInfo = CATEGORY_DETAILS[category as keyof typeof CATEGORY_DETAILS];
    if (!categoryInfo) {
      console.error('Invalid category provided:', category);
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    try {
      // Use the Gemini AI client to generate questions
      console.log('Calling Gemini AI to generate questions for category:', category);
      const questions = await generateQuestions(category, personalizationPrompt);
      console.log(`Successfully generated ${questions.length} questions for ${category} using Gemini AI`);
      
      return NextResponse.json({ 
        success: true, 
        questions,
        category,
        source: 'gemini'
      });
    } catch (apiError) {
      console.error('Error calling Gemini AI API:', apiError);
      
      // Fall back to default questions
      console.log('Falling back to default questions for category:', category);
      const defaultQuestions = generateDefaultQuestions(category);
      
      return NextResponse.json({ 
        success: true, 
        questions: defaultQuestions,
        category,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: `Error generating questions: ${error}` }, { status: 500 });
  }
}