import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set correctly. Please check your .env.local file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Add a connection test function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('students').select('id').limit(1);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, error };
  }
}; 