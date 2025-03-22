'use client';

import React, { useEffect, useState } from 'react';
import Skills2025Section from '../components/Skills2025Section';

interface LandingPageProps {
  onStart?: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Add scroll animation effect
  useEffect(() => {
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animate-fade-in');
        }
      });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    // Trigger once on load
    animateOnScroll();
    
    return () => window.removeEventListener('scroll', animateOnScroll);
  }, []);

  // Helper function to get border color based on feature color
  const getBorderColor = (color: string) => {
    if (color === 'blue') return 'border-blue-500';
    if (color === 'green') return 'border-green-500';
    return 'border-purple-500';
  };

  // Helper function to get background color based on feature color
  const getBgColor = (color: string) => {
    if (color === 'blue') return 'bg-blue-100 group-hover:bg-blue-200';
    if (color === 'green') return 'bg-green-100 group-hover:bg-green-200';
    return 'bg-purple-100 group-hover:bg-purple-200';
  };

  // Helper function to get text color based on testimonial color
  const getTextColor = (color: string) => {
    if (color === 'blue') return 'bg-blue-100 text-blue-600';
    if (color === 'green') return 'bg-green-100 text-green-600';
    return 'bg-purple-100 text-purple-600';
  };

  // Features data
  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Comprehensive Assessment",
      description: "Evaluate your skills across 8 key professional areas with real-world scenarios",
      color: "blue"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "AI-Powered Insights",
      description: "Get personalized recommendations powered by advanced AI technology that adapts to your unique profile",
      color: "green"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Interactive Analytics",
      description: "Visualize your strengths and areas for improvement with beautiful, interactive charts and detailed breakdowns",
      color: "purple"
    }
  ];

  // Steps data
  const steps = [
    {
      number: "1",
      title: "Complete Your Profile",
      description: "Tell us about your current role, experience, and career goals so we can tailor the assessment to your needs."
    },
    {
      number: "2",
      title: "Take the Assessment",
      description: "Answer questions across multiple skill categories to help us understand your strengths and areas for improvement."
    },
    {
      number: "3",
      title: "Get Your Report",
      description: "Receive a detailed analysis with personalized recommendations, career path suggestions, and a 3-month action plan."
    }
  ];

  // Stats data
  const stats = [
    { number: "8", label: "Skill Categories" },
    { number: "5+", label: "Questions Per Skill" },
    { number: "100%", label: "Personalized" },
    { number: "3", label: "Month Action Plan" }
  ];

  // Categories data
  const categories = [
    'Technical Skills', 
    'Problem Solving', 
    'Communication', 
    'Leadership', 
    'Adaptability', 
    'Project Management', 
    'Teamwork', 
    'Time Management'
  ];

  // Testimonials data
  const testimonials = [
    {
      initials: "AR",
      name: "Ankit Rajput",
      college: "IET DAVV, Indore",
      quote: "Bhai, ye assessment ekdum mast hai! Mujhe pata chal gaya ki meri strengths kya hai aur kahan improvement ki zarurat hai. Totally worth it!",
      color: "blue"
    },
    {
      initials: "PS",
      name: "Priya Sharma",
      college: "SGSITS, Indore",
      quote: "Maine apne placement ke liye isko use kiya aur results bahut acche mile. Sach mein, ye mere career planning mein bahut helpful raha hai.",
      color: "green"
    },
    {
      initials: "VK",
      name: "Varun Kumar",
      college: "Acropolis Institute, Indore",
      quote: "Yaar, SkillPrep ne mujhe dikhaya ki main kis field mein best perform kar sakta hoon. Ab mujhe pata hai ki next kya karna hai. Fully recommend!",
      color: "purple"
    }
  ];

  return (
    <div className="space-y-16 overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer">
                <img src="/logo.png" alt="SkillPrep Logo" className="h-10 mr-2" />
              </div>
              <div className="hidden md:flex ml-10 space-x-6">
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  How It Works
                </a>
                <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Features
                </a>
                <a href="#skills" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Skills
                </a>
                <a href="#skills2025" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Skills 2025
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Testimonials
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={onStart}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start Assessment
              </button>
              <div className="md:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-expanded="false"
                  onClick={toggleMobileMenu}
                >
                  <span className="sr-only">Open main menu</span>
                  {/* Icon when menu is closed */}
                  <svg
                    className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  {/* Icon when menu is open */}
                  <svg
                    className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu, show/hide based on menu state */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#how-it-works"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#features"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#skills"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Skills
              </a>
              <a
                href="#skills2025"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Skills 2025
              </a>
              <a
                href="#testimonials"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-8">
        {/* Enhanced background with animated gradient and patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-6 py-16 text-center relative">
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-100 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-green-100 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6 relative">
            Discover Your Professional{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              Potential
              <svg className="absolute -bottom-2 left-0 w-full h-2 text-blue-400 opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,0 Q50,10 100,0" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Comprehensive skill assessment and personalized recommendations to accelerate your career growth
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Start Your Assessment
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          {/* Stats with enhanced styling */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="p-4 bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{stat.number}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="max-w-6xl mx-auto px-6 relative animate-on-scroll pt-16 mt-16">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full opacity-30 -z-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50 rounded-full opacity-30 -z-10 blur-3xl"></div>
        
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl font-bold text-gray-900 inline-block relative">
            How It Works
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line between steps */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-300 to-blue-200 transform -translate-y-1/2 z-0"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative z-10">
              <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {step.number}
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8 h-full border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:border-blue-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="max-w-6xl mx-auto px-6 relative animate-on-scroll pt-16 mt-16">
        {/* Background decorative elements */}
        <div className="absolute top-1/2 right-0 w-40 h-40 bg-dot-pattern opacity-20 -z-10 rounded-full"></div>
        <div className="absolute top-1/4 left-0 w-40 h-40 bg-dot-pattern opacity-20 -z-10 rounded-full"></div>
        
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl font-bold text-gray-900 inline-block relative">
            Key Features
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-t-4 ${getBorderColor(feature.color)} group`}
            >
              <div className={`w-14 h-14 ${getBgColor(feature.color)} rounded-lg flex items-center justify-center mb-6 transition-colors duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div id="skills" className="max-w-6xl mx-auto px-6 relative animate-on-scroll pt-16 mt-16">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
        
        <div className="text-center mb-6 relative">
          <h2 className="text-3xl font-bold text-gray-900 inline-block relative">
            Skills We Assess
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </h2>
        </div>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">Our comprehensive assessment covers all the critical skills needed for professional success in today's competitive workplace</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={category}
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 hover:border-blue-200 group"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{category}</h3>
              <div className="w-10 h-0.5 bg-gray-200 group-hover:bg-blue-400 mt-2 transition-colors duration-300"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills 2025 Section */}
      <div id="skills2025">
        <Skills2025Section />
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="max-w-6xl mx-auto px-6 relative animate-on-scroll pt-16 mt-16">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-50 rounded-full opacity-30 -z-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full opacity-30 -z-10 blur-3xl"></div>
        
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl font-bold text-gray-900 inline-block relative">
            What Users Say
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative">
              {/* Quote mark decoration */}
              <div className="absolute top-4 right-4 text-4xl text-gray-100 font-serif">"</div>
              
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${getTextColor(testimonial.color)} rounded-full flex items-center justify-center font-bold`}>
                  {testimonial.initials}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.college}</p>
                </div>
              </div>
              <p className="text-gray-600 italic relative z-10">{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 animate-on-scroll pt-16 mt-16">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Enhanced background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 bg-animated-gradient"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-white opacity-10"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          <div className="relative text-center p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Advance Your Career?
            </h2>
            <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
              Take the first step towards understanding and improving your professional skills with our AI-powered assessment
            </p>
            <button
              onClick={onStart}
              className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-full text-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Begin Your Assessment
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 