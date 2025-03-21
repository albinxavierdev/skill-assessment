# SkillPrep Assessment Platform

A modern skill assessment platform built with Next.js, Tailwind CSS, and Google Gemini AI.

## Features

- **Personalized Assessments**: Generate tailored questions based on student profiles
- **Multiple Skill Categories**: Assess various professional skills
- **Interactive UI**: Modern, responsive design with intuitive navigation
- **Real-time Feedback**: Immediate feedback on answers with explanations
- **Comprehensive Reports**: Detailed analysis of strengths and areas for improvement
- **AI-Powered**: Leverages Google Gemini AI for question generation and report analysis

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/skillprep.git
cd skillprep
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Google Gemini API key:
```
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
GEMINI_API_KEY=your_api_key_here
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Google Gemini API Integration

This application uses the Google Gemini AI API for:

1. **Personalized Question Generation**: Creates tailored assessment questions based on the student's profile, including their education, experience, and interests.

2. **Comprehensive Report Analysis**: Analyzes assessment results to provide detailed feedback, recommendations, and personalized learning paths.

In development mode, the application uses mock data if no API key is provided. For production use, a valid Google Gemini API key is required.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **State Management**: Zustand
- **Visualization**: Chart.js with react-chartjs-2
- **AI Integration**: Google Gemini API

## License

This project is licensed under the MIT License - see the LICENSE file for details. #   a i - e m p l o y a b i l i t y - a s s e s s m e n t 
 
 