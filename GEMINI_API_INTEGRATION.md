# Gemini API Integration

This document provides an overview of how the Google Gemini API is integrated into the SkillPrep Assessment application.

## Overview

The application uses Google's Gemini AI to generate personalized assessment questions and detailed reports based on user responses. The integration follows a client-server architecture where frontend components make requests to Next.js API routes, which then communicate with the Gemini API.

## Configuration

### Environment Variables

The Gemini API integration relies on the following environment variables:

```
# Google Gemini API Configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent
```

These should be defined in your `.env.local` file.

## Key Components

### Core Integration

- **`lib/gemini.ts`**: Core integration with the Gemini API
  - Initializes the Google Generative AI client
  - Provides functions for generating questions and reports
  - Includes fallback mechanisms with mock data
  - Implements rate limiting to prevent API quota exhaustion

### API Routes

- **`app/api/generate-questions/route.ts`**: Generates assessment questions
  - Accepts category and personalization parameters
  - Formats prompts for the Gemini API
  - Processes and returns structured question data

- **`app/api/generate-report/route.ts`**: Creates assessment reports
  - Takes student information and assessment scores
  - Constructs detailed prompts for comprehensive reports
  - Parses JSON responses from Gemini

- **`app/api/test-gemini/route.ts`**: Tests API connectivity
  - Simple endpoint to verify Gemini API is working
  - Used for diagnostics and troubleshooting

## Error Handling and Fallbacks

The application includes robust error handling:

1. **API Connectivity Issues**: If the Gemini API is unavailable, the application falls back to pre-defined mock data.
2. **Response Parsing Errors**: If the API response cannot be parsed as JSON, the application uses fallback data.
3. **Rate Limiting**: The application implements rate limiting to prevent API quota exhaustion.

## Prompt Engineering

The application uses sophisticated prompt engineering:

- **Question Generation**: Structured prompts that specify format, difficulty, and personalization
- **Report Generation**: Detailed prompts with student info, scores, and required report sections
- **JSON Parsing**: Extraction of structured data from potentially markdown-wrapped responses

## Usage Examples

### Generating Questions

```typescript
// In a component
const response = await fetch('/api/generate-questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    category: 'ProblemSolving',
    personalizationPrompt: 'Personalize for a Computer Science student'
  }),
});

const data = await response.json();
if (data.success) {
  const questions = data.questions;
  // Use the questions in your UI
}
```

### Generating Reports

```typescript
// In a component
const response = await fetch('/api/generate-report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    scores: {
      ProblemSolving: 85,
      Communication: 75,
      // Other categories...
    },
    studentInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      // Other student info...
    }
  }),
});

const data = await response.json();
if (data.success) {
  const report = data.report;
  // Use the report in your UI
}
```

## Troubleshooting

If you encounter issues with the Gemini API integration:

1. **Check API Key**: Ensure your Gemini API key is valid and has sufficient quota.
2. **Verify Environment Variables**: Make sure the environment variables are correctly set.
3. **Test API Connection**: Use the `/api/test-gemini` endpoint to verify connectivity.
4. **Check Console Logs**: Look for error messages in the server console.
5. **Inspect Network Requests**: Use browser developer tools to inspect the API requests and responses.

## Best Practices

1. **Limit API Calls**: Minimize the number of API calls to avoid quota issues.
2. **Cache Results**: Cache API responses when possible to reduce API usage.
3. **Handle Errors Gracefully**: Always provide fallback options when the API fails.
4. **Monitor Usage**: Keep track of API usage to avoid unexpected quota exhaustion.
5. **Secure API Keys**: Never expose API keys in client-side code. 