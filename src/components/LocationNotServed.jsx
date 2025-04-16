import React from 'react';
import { Link } from 'react-router-dom';

const LocationNotServed = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Location Not Served
            </h2>
            <p className="text-gray-600 mb-8">
              We currently serve only in Andhra Pradesh and Telangana. Please select a city from these states to continue.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go Back Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationNotServed; 