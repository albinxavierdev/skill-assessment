require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Log the environment variables (with partial redaction for security)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'undefined');
console.log('Supabase Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : 'undefined');

// Test with regular client
async function testRegularClient() {
  try {
    console.log('\nTesting regular client...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.from('students').select('id').limit(1);
    
    if (error) {
      console.error('Regular client error:', error);
    } else {
      console.log('Regular client success:', data);
    }
  } catch (error) {
    console.error('Regular client exception:', error);
  }
}

// Test with admin client
async function testAdminClient() {
  try {
    console.log('\nTesting admin client...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin.from('students').select('id').limit(1);
    
    if (error) {
      console.error('Admin client error:', error);
    } else {
      console.log('Admin client success:', data);
    }
  } catch (error) {
    console.error('Admin client exception:', error);
  }
}

// Run tests
async function runTests() {
  await testRegularClient();
  await testAdminClient();
}

runTests(); 