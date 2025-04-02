import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestDbConnection = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/test-db-connection');
        setStatus(response.data.message);
        setError(null);
      } catch (error) {
        console.error('Error connecting to the database:', error);
        setError(error.message);
        setStatus('Database connection failed');
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Database Connection Status</h1>
        
        {loading ? (
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Testing database connection...</p>
          </div>
        ) : (
          <div className={`p-4 rounded-lg ${
            status === 'Database connection failed' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            <p className="font-medium">{status}</p>
            {error && (
              <p className="text-sm mt-2 text-red-600">
                Error details: {error}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          <p>Connecting to: http://localhost:5000</p>
        </div>
      </div>
    </div>
  );
};

export default TestDbConnection;
