export const SKILL_CATEGORIES = [
  "Core Employability Skills",
  "Soft Skills",
  "Professional Skills",
  "AI Literacy",
  "Domain-Specific Skills",
  "Job Application Skills",
  "Entrepreneurial Skills",
  "Project Management Skills"
] as const;

export const CATEGORY_DETAILS = {
  "Core Employability Skills": {
    description: "Basic skills required for employment",
    focusAreas: ["Problem Solving", "Time Management", "Critical Thinking", "Adaptability"]
  },
  "Soft Skills": {
    description: "Interpersonal and communication abilities",
    focusAreas: ["Communication", "Teamwork", "Leadership", "Emotional Intelligence"]
  },
  "Professional Skills": {
    description: "Skills specific to professional workplace",
    focusAreas: ["Business Ethics", "Professional Communication", "Work Ethics", "Industry Knowledge"]
  },
  "AI Literacy": {
    description: "Understanding and working with AI technologies",
    focusAreas: ["AI Basics", "AI Tools", "Data Understanding", "AI Ethics"]
  },
  "Domain-Specific Skills": {
    description: "Technical skills for specific field",
    focusAreas: ["Technical Knowledge", "Industry Tools", "Best Practices", "Technical Problem Solving"]
  },
  "Job Application Skills": {
    description: "Skills for job search and application",
    focusAreas: ["Resume Writing", "Interview Skills", "Personal Branding", "Job Search Strategies"]
  },
  "Entrepreneurial Skills": {
    description: "Skills for business and innovation",
    focusAreas: ["Innovation", "Risk Management", "Business Planning", "Market Analysis"]
  },
  "Project Management Skills": {
    description: "Skills for managing projects and teams",
    focusAreas: ["Project Planning", "Team Management", "Risk Assessment", "Resource Allocation"]
  }
} as const;

export const SCORE_THRESHOLDS = {
  Excellent: 80,
  Good: 70,
  Average: 60,
  "Needs Improvement": 0
} as const;

export const QUESTION_WEIGHTS = {
  "Core Employability Skills": 1.2,
  "Domain-Specific Skills": 1.2,
  "Professional Skills": 1.1,
  "AI Literacy": 1.0,
  "Soft Skills": 1.0,
  "Job Application Skills": 1.0,
  "Entrepreneurial Skills": 0.9,
  "Project Management Skills": 1.0
} as const; 