// Utility functions for the application
import jsPDF from 'jspdf';

// Function to generate and download the Skills 2025 report as PDF
export const downloadSkills2025Report = () => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set font styles
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(0, 0, 0);
  
  // Add title
  pdf.text('Job Skills Report 2025', 105, 20, { align: 'center' });
  
  // Add subtitle
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  pdf.text('Top skills to learn for future career success', 105, 30, { align: 'center' });
  
  // Add sections
  const addSection = (title: string, yPosition: number) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(title, 20, yPosition);
    return yPosition + 10;
  };
  
  const addSkillCategory = (title: string, yPosition: number) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(40, 40, 40);
    pdf.text(title, 25, yPosition);
    return yPosition + 7;
  };
  
  const addSkillItem = (text: string, yPosition: number) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    pdf.text(`• ${text}`, 30, yPosition);
    return yPosition + 6;
  };
  
  // Students section
  let y = addSection('Students', 50);
  
  y = addSkillCategory('AI Skills', y);
  y = addSkillItem('Supervised Learning', y);
  y = addSkillItem('Feature Engineering', y);
  y = addSkillItem('Foundational AI skills (e.g., Artificial Neural Networks, Computer Vision)', y);
  
  y = addSkillCategory('Business Skills', y);
  y = addSkillItem('Sustainability-related skills (Waste Minimization, Business Continuity Planning)', y);
  y = addSkillItem('HR Technology', y);
  y = addSkillItem('Risk Management', y);
  
  y = addSkillCategory('Data Science Skills', y);
  y = addSkillItem('Data Access', y);
  y = addSkillItem('Data Visualization', y);
  y = addSkillItem('Data Ethics', y);
  
  y = addSkillCategory('Tech Skills', y);
  y = addSkillItem('Security Information & Event Management (SIEM)', y);
  y = addSkillItem('Network Monitoring', y);
  y = addSkillItem('Software Documentation', y);
  
  // Job Seekers section
  y = addSection('Job Seekers', y + 10);
  
  y = addSkillCategory('AI Skills', y);
  y = addSkillItem('Applied Machine Learning', y);
  y = addSkillItem('Reinforcement Learning', y);
  y = addSkillItem('Hands-on AI skills (e.g., PyTorch, Machine Learning)', y);
  
  y = addSkillCategory('Business Skills', y);
  y = addSkillItem('Workplace Technologies', y);
  y = addSkillItem('Talent Recruitment & Strategies', y);
  y = addSkillItem('Project Management Institute (PMI) Methodology', y);
  
  // Add a new page for the rest of the content
  pdf.addPage();
  y = 20;
  
  y = addSkillCategory('Data Science Skills', y);
  y = addSkillItem('Extract, Transform, Load (ETL)', y);
  y = addSkillItem('Data Wrangling', y);
  y = addSkillItem('Web Scraping', y);
  
  y = addSkillCategory('Tech Skills', y);
  y = addSkillItem('Infrastructure Security', y);
  y = addSkillItem('Software Development Methodologies', y);
  y = addSkillItem('Network Planning & Design', y);
  
  // Employees section
  y = addSection('Employees', y + 10);
  
  y = addSkillCategory('AI Skills', y);
  y = addSkillItem('Advanced AI skills (e.g., Computer Vision, PyTorch)', y);
  y = addSkillItem('Reinforcement Learning', y);
  y = addSkillItem('Machine Learning Operations (MLOps)', y);
  
  y = addSkillCategory('Business Skills', y);
  y = addSkillItem('Risk Mitigation & Control', y);
  y = addSkillItem('Human Capital Development', y);
  y = addSkillItem('Workforce Development', y);
  
  y = addSkillCategory('Data Science Skills', y);
  y = addSkillItem('Data Ethics', y);
  y = addSkillItem('Business Analytics', y);
  y = addSkillItem('Information Management', y);
  
  y = addSkillCategory('Tech Skills', y);
  y = addSkillItem('Incident Management & Response', y);
  y = addSkillItem('Threat Management & Modeling', y);
  y = addSkillItem('Security Information & Event Management (SIEM)', y);
  
  // Common Skills section
  y = addSection('Common Skills Across All Groups', y + 10);
  y = addSkillItem('GenAI: Use AI to generate text, images, and more', y);
  y = addSkillItem('Cybersecurity: Skills like Incident Management & Response, Threat Management & Modeling', y);
  y = addSkillItem('Data Ethics: Responsible use and management of data across all sectors', y);
  
  // Add footer
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('© SkillPrep - Job Skills Report 2025', 105, 280, { align: 'center' });
  
  // Save the PDF
  pdf.save('SkillPrep_Job_Skills_Report_2025.pdf');
};

// Function to show a popup when user scrolls up after viewing the Skills 2025 section
export const setupScrollPopup = (sectionId: string) => {
  if (typeof window === 'undefined') return;
  
  let hasViewedSection = false;
  let hasShownPopup = false;
  
  const handleScroll = () => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const sectionRect = section.getBoundingClientRect();
    const isVisible = sectionRect.top < window.innerHeight && sectionRect.bottom >= 0;
    
    if (isVisible) {
      hasViewedSection = true;
    }
    
    // If user has viewed the section and is now scrolling up (negative scrollY change)
    if (hasViewedSection && !hasShownPopup && window.scrollY < lastScrollY) {
      showDownloadPopup();
      hasShownPopup = true;
      // Remove the scroll listener after showing the popup
      window.removeEventListener('scroll', handleScroll);
    }
    
    lastScrollY = window.scrollY;
  };
  
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', handleScroll);
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

// Function to show the download popup
export const showDownloadPopup = () => {
  const popup = document.createElement('div');
  popup.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-md animate-slide-up z-50 border border-blue-200';
  popup.innerHTML = `
    <div class="flex items-start">
      <div class="flex-shrink-0 pt-0.5">
        <svg class="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-lg font-medium text-gray-900">Download Skills Report 2025</h3>
        <p class="mt-1 text-sm text-gray-500">Get the complete Job Skills Report 2025 with detailed insights on the most in-demand skills for students, job seekers, and employees.</p>
        <div class="mt-4">
          <button id="download-report-btn" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Download PDF
          </button>
          <button id="close-popup-btn" class="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Add event listeners
  document.getElementById('download-report-btn')?.addEventListener('click', () => {
    downloadSkills2025Report();
    setTimeout(() => {
      popup.remove();
    }, 1000);
  });
  
  document.getElementById('close-popup-btn')?.addEventListener('click', () => {
    popup.remove();
  });
  
  // Auto-remove after 15 seconds
  setTimeout(() => {
    if (document.body.contains(popup)) {
      popup.remove();
    }
  }, 15000);
}; 