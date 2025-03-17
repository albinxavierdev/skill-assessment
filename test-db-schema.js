require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Log the environment variables (with partial redaction for security)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'undefined');
console.log('Supabase Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : 'undefined');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// Test database schema
async function checkStudentsTable() {
  try {
    console.log('\nChecking students table...');
    
    // Simple query to get one row from students table
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying students table:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Students table exists with columns:', Object.keys(data[0]));
      console.log('Sample data:', data[0]);
    } else {
      console.log('Students table exists but is empty');
    }
  } catch (error) {
    console.error('Error checking students table:', error);
  }
}

// Run the check
checkStudentsTable(); 