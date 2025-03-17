import { NextRequest, NextResponse } from 'next/server';
import { CATEGORY_DETAILS, SKILL_CATEGORIES } from '../../../config/categories';
import { extractJsonFromResponse, generateDefaultQuestions } from '../../../lib/gemini';

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
  const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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

    let prompt = `Generate 5 challenging multiple-choice questions for assessing ${category}.
      Category Description: ${categoryInfo.description}
      Focus Areas: ${categoryInfo.focusAreas.join(', ')}`;
      
    // Add personalization if provided
    if (personalizationPrompt) {
      prompt += `\n\nPersonalization Context: ${personalizationPrompt}`;
    }
    
    prompt += `\n
      Each question should:
      1. Test one of the focus areas mentioned above
      2. Present a complex, realistic workplace scenario that requires critical thinking
      3. Have exactly 4 options labeled a, b, c, d
      4. Have exactly one correct answer
      5. Make the options nuanced and not obviously right or wrong
      6. Include a detailed explanation for the correct answer
      7. Target a high difficulty level (suitable for professionals)

      Return the response in the following JSON format:
      [
        {
          "question": "What would you do in this complex workplace scenario...?",
          "focusArea": "one of the focus areas",
          "options": {
            "a": "First option description - make this nuanced and plausible",
            "b": "Second option description - make this nuanced and plausible",
            "c": "Third option description - make this nuanced and plausible",
            "d": "Fourth option description - make this nuanced and plausible"
          },
          "correct": "a",
          "explanation": "Detailed explanation why this is the correct answer, including the reasoning and principles behind it"
        }
      ]`;

    // Update the API URL to use v1beta instead of v1
    const apiUrl = GEMINI_API_URL.replace('v1/models', 'v1beta/models');
    console.log('Using Gemini API URL:', apiUrl);
    console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');
    
    try {
      const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generation_config: {
            temperature: 0.7,
            top_k: 40,
            top_p: 0.95,
            max_output_tokens: 8192,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        console.error('Response status:', response.status, response.statusText);
        
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

      const data = await response.json();
      console.log('Gemini API response received');
      
      const geminiResponse = data.candidates[0].content.parts[0].text;
      
      try {
        // Use the helper function to extract JSON from the response
        const questions = extractJsonFromResponse(geminiResponse) as Question[];
        console.log(`Successfully generated ${questions.length} questions for ${category}`);
        
        // Shuffle options for each question
        const shuffledQuestions = questions.map((question: Question) => {
          const options = Object.entries(question.options);
          const correctLetter = question.correct;
          const correctAnswer = question.options[correctLetter];
        
          // Shuffle options
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
        
          // Create new options dictionary
          const newOptions: { [key: string]: string } = {};
          let newCorrect = '';
        
          options.forEach(([_, answer], index) => {
            const letter = String.fromCharCode(97 + index); // 'a', 'b', 'c', 'd'
            newOptions[letter] = answer;
            if (answer === correctAnswer) {
              newCorrect = letter;
            }
          });
        
          return {
            ...question,
            options: newOptions,
            correct: newCorrect,
          };
        });
        
        return NextResponse.json({ 
          success: true, 
          questions: shuffledQuestions,
          category,
          source: 'gemini'
        });
      } catch (parseError) {
        console.error('Error parsing JSON from Gemini response:', parseError);
        console.error('Raw response:', geminiResponse);
        
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
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      
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