'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function DbSchemaPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('students');
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchema() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch tables in the public schema
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .order('table_name');
        
        if (tablesError) throw tablesError;
        
        if (tablesData) {
          setTables(tablesData);
          
          // If students table exists, select it by default
          const studentsTable = tablesData.find(t => t.table_name === 'students');
          if (studentsTable) {
            setSelectedTable('students');
          } else if (tablesData.length > 0) {
            setSelectedTable(tablesData[0].table_name);
          }
        }
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError('Failed to fetch database tables');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSchema();
  }, []);
  
  useEffect(() => {
    async function fetchColumns() {
      if (!selectedTable) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch columns for the selected table
        const { data: columnsData, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_name', selectedTable)
          .eq('table_schema', 'public')
          .order('ordinal_position');
        
        if (columnsError) throw columnsError;
        
        if (columnsData) {
          setColumns(columnsData);
        }
      } catch (err) {
        console.error(`Error fetching columns for table ${selectedTable}:`, err);
        setError(`Failed to fetch columns for table ${selectedTable}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchColumns();
  }, [selectedTable]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Database Schema</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Tables</h2>
        
        {loading && tables.length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading tables...</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tables.map((table) => (
              <button
                key={table.table_name}
                onClick={() => setSelectedTable(table.table_name)}
                className={`px-3 py-1 rounded ${
                  selectedTable === table.table_name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {table.table_name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {selectedTable && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Columns for <span className="text-blue-600">{selectedTable}</span>
          </h2>
          
          {loading && columns.length === 0 ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading columns...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Column Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nullable
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Default Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {columns.map((column) => (
                    <tr key={column.column_name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {column.column_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {column.data_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {column.is_nullable === 'YES' ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {column.column_default || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 