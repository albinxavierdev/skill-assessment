require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Log the environment variables (with partial redaction for security)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'undefined');
console.log('Supabase Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : 'undefined');

// Test database schema
async function testDatabaseSchema() {
  try {
    console.log('\nTesting database schema...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
    
    // Simple query to get one row from students table
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching students:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Students table exists with columns:', Object.keys(data[0]));
      console.log('Sample data:', data[0]);
    } else {
      console.log('Students table exists but is empty');
    }
  } catch (error) {
    console.error('Error testing database schema:', error);
  }
}

// Test inserting a student
async function testInsertStudent() {
  try {
    console.log('\nTesting student insertion...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
    
    const testStudent = {
      name: 'Test Student',
      email: `test${Date.now()}@example.com`,
      phone: '1234567890',
      collegename: 'Test College',
      degree: 'Test Degree',
      passingyear: '2025',
      domaininterest: 'Web Development',
      created_at: new Date().toISOString()
    };
    
    console.log('Inserting test student:', testStudent);
    
    const { data, error } = await supabase
      .from('students')
      .insert([testStudent])
      .select();
    
    if (error) {
      console.error('Error inserting student:', error);
      return;
    }
    
    console.log('Successfully inserted student:', data);
  } catch (error) {
    console.error('Error testing student insertion:', error);
  }
}

// Test admin client specifically
async function testAdminClient() {
  try {
    console.log('\nTesting admin client specifically...');
    
    if (!supabaseServiceKey) {
      console.log('No service role key found, skipping admin client test');
      return;
    }
    
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Try to bypass RLS with admin client
    const { data, error } = await adminClient
      .from('students')
      .select('count')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error using admin client:', error);
      return;
    }
    
    console.log('Admin client successfully bypassed RLS:', data);
  } catch (error) {
    console.error('Error testing admin client:', error);
  }
}

// Run tests
async function runTests() {
  await testDatabaseSchema();
  await testInsertStudent();
  await testAdminClient();
}

runTests(); 