const fetch = require('node-fetch');

async function testStudentAPI() {
  try {
    console.log('Testing student API...');
    
    const response = await fetch('http://localhost:3000/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Student',
        email: `test${Date.now()}@example.com`, // Use timestamp to ensure unique email
        phone: '1234567890',
        collegeName: 'Test College',
        degree: 'Test Degree',
        passingYear: '2025',
        domainInterest: 'Web Development'
      }),
    });
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testStudentAPI(); 