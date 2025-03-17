import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  console.log('GET /api/db-schema: Checking database schema');
  
  try {
    // Try a direct query to the students table
    console.log('Querying students table directly...');
    const { data, error } = await supabaseAdmin
      .from('students')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying students table:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Error querying students table', 
        error: error.message
      }, { status: 500 });
    }
    
    // If we got data, we can see the column names
    const columnNames = data && data.length > 0 ? Object.keys(data[0]) : [];
    console.log('Column names from students table:', columnNames);
    
    // Now try to describe the table structure using a separate try/catch
    let tableStructure = null;
    try {
      console.log('Describing table structure...');
      const { data: describeData, error: describeError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'students');
        
      if (describeError) {
        console.error('Error describing table structure:', describeError);
      } else {
        tableStructure = describeData;
      }
    } catch (describeErr) {
      console.error('Exception describing table structure:', describeErr);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database schema information retrieved',
      sample: data,
      columnNames,
      tableStructure: tableStructure || 'Not available'
    });
  } catch (error) {
    console.error('Unexpected error checking database schema:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Unexpected error checking database schema',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 