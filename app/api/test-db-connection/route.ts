import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  console.log('GET /api/test-db-connection: Testing database connection');
  
  try {
    // Test a simple query - using proper Supabase count syntax
    const { count, error } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection test failed:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Database connection test failed', 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log('Database connection test successful, count:', count);
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection test successful',
      count
    });
  } catch (error) {
    console.error('Unexpected error in database connection test:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Unexpected error in database connection test',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 