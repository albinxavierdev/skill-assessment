import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = process.env.GEMINI_API_URL;

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables' }, { status: 500 });
  }

  try {
    console.log('Testing Gemini API connection...');
    console.log('API URL:', GEMINI_API_URL);
    
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Hello, please respond with a simple 'Hello, I am Gemini!' to test the connection." }
              ]
            }
          ],
          generation_config: {
            temperature: 0.7,
            top_k: 40,
            top_p: 0.95,
            max_output_tokens: 256,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        return NextResponse.json({ 
          success: false, 
          error: `Gemini API error: ${response.statusText}`, 
          details: errorText,
          url: GEMINI_API_URL
        }, { status: 500 });
      }

      const data = await response.json();
      console.log('Gemini API response received');
      
      return NextResponse.json({ 
        success: true, 
        message: data.candidates[0].content.parts[0].text,
        apiUrl: GEMINI_API_URL
      });
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      return NextResponse.json({ 
        success: false, 
        error: `Error calling Gemini API: ${apiError}`,
        apiUrl: GEMINI_API_URL
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Error testing Gemini API: ${error}`,
      apiUrl: GEMINI_API_URL
    }, { status: 500 });
  }
} 