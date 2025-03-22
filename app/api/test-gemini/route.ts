import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables' }, { status: 500 });
  }

  try {
    // Initialize the Google Generative AI with the API key
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Generate a simple test response
    const result = await model.generateContent('Hello, please respond with a simple "Gemini API is working correctly!" if you receive this message.');
    const response = result.response;
    const text = response.text();
    
    console.log('Successfully tested Gemini API connection');
    
    return NextResponse.json({ 
      success: true, 
      message: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing Gemini API connection:', error);
    return NextResponse.json({ 
      error: `Error testing Gemini API connection: ${error}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}