import React, { useState } from 'react';
import { makeUserAdmin } from '../firebase/users';
import { useAuth } from '../context/AuthContext';

const MakeAdmin = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const result = await makeUserAdmin(email);
      setMessage(result.message);
      
      // If user made themselves admin, ask them to refresh
      if (user && user.email === email) {
        setMessage(prev => `${prev}. Please sign out and sign back in to refresh your permissions.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Make User Admin</h1>
        <p className="text-gray-600 mb-6">
          This page is for development purposes. Enter an email address to make that user an admin.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="user@example.com"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            {loading ? 'Processing...' : 'Make Admin'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        {message && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeAdmin; 