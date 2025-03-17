import { NextRequest, NextResponse } from 'next/server';
import { CATEGORY_DETAILS, SKILL_CATEGORIES } from '../../../config/categories';
import { CategoryScores, Report } from '../../../lib/types';
import { extractJsonFromResponse, generateDefaultReport } from '../../../lib/gemini';
import { Student } from '../../../lib/studentStore';

export async function POST(request: NextRequest) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = process.env.GEMINI_API_URL;

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables' }, { status: 500 });
  }

  try {
    const { scores, studentInfo } = await request.json();
    
    if (!scores) {
      return NextResponse.json({ error: 'Scores are required' }, { status: 400 });
    }

    // Format scores for the prompt
    const formattedScores = Object.entries(scores)
      .map(([category, score]) => `${category}: ${score}%`)
      .join('\n');

    // Create personalization context
    let personalizationContext = '';
    if (studentInfo) {
      personalizationContext = `
        Student Name: ${studentInfo.name}
        College: ${studentInfo.collegeName}
        Degree: ${studentInfo.degree}
        Passing Year: ${studentInfo.passingYear}
        Domain of Interest: ${studentInfo.domainInterest}
        Email: ${studentInfo.email}
        Phone: ${studentInfo.phone}
      `;
    }

    // Create the prompt
    const prompt = `
      Generate a comprehensive skill assessment report based on the following scores:
      
      ${formattedScores}
      
      ${personalizationContext ? `Student Information:\n${personalizationContext}` : ''}
      
      For each skill category, provide:
      1. A detailed analysis of the student's performance
      2. Specific strengths identified
      3. Areas for improvement
      4. Actionable recommendations
      
      Also include:
      1. An executive summary of overall performance
      2. Career path suggestions based on strengths and interests
      3. A 3-month action plan with specific milestones
      4. Recommended learning resources (courses, books, websites)
      
      Format the response as a JSON object with the following structure:
      {
        "executiveSummary": "Overall analysis of performance across all categories",
        "categoryAnalysis": {
          "Category1": {
            "score": 85,
            "analysis": "Detailed analysis of performance in this category",
            "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
          },
          // Repeat for each category
        },
        "recommendations": ["Overall recommendation 1", "Overall recommendation 2", "Overall recommendation 3"],
        "learningResources": ["Resource 1 with link", "Resource 2 with link", "Resource 3 with link"],
        "careerPathSuggestions": ["Career path 1", "Career path 2", "Career path 3"],
        "actionPlan": {
          "Month 1": ["Action item 1", "Action item 2"],
          "Month 2": ["Action item 1", "Action item 2"],
          "Month 3": ["Action item 1", "Action item 2"]
        }
      }
    `;

    console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');
    
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
        
        // Fall back to default report
        console.log('Falling back to default report generation');
        const defaultReport = generateDefaultReport(scores, studentInfo as Student);
        
        return NextResponse.json({ 
          success: true, 
          report: defaultReport,
          source: 'fallback'
        });
      }

      const data = await response.json();
      const geminiResponse = data.candidates[0].content.parts[0].text;
      
      try {
        // Use the helper function to extract JSON from the response
        const report = extractJsonFromResponse(geminiResponse) as Report;
        console.log('Successfully generated report');
        
        return NextResponse.json({ 
          success: true, 
          report,
          source: 'gemini'
        });
      } catch (parseError) {
        console.error('Error parsing JSON from Gemini response:', parseError);
        console.error('Raw response:', geminiResponse);
        
        // Fall back to default report
        console.log('Falling back to default report generation due to parsing error');
        const defaultReport = generateDefaultReport(scores, studentInfo as Student);
        
        return NextResponse.json({ 
          success: true, 
          report: defaultReport,
          source: 'fallback'
        });
      }
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      
      // Fall back to default report
      console.log('Falling back to default report generation due to API error');
      const defaultReport = generateDefaultReport(scores, studentInfo as Student);
      
      return NextResponse.json({ 
        success: true, 
        report: defaultReport,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: `Error generating report: ${error}` }, { status: 500 });
  }
} 