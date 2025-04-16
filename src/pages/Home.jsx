import React from 'react';
import SearchForm from '../components/SearchForm';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Your Perfect Ride
            </h1>
            <p className="text-xl text-blue-100">
              Rent cars and bikes at the best prices
            </p>
          </div>
          
          {/* Search Form */}
          <SearchForm />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Wide Selection</h3>
              <p className="text-gray-600">Choose from a variety of cars and bikes to suit your needs</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Best Prices</h3>
              <p className="text-gray-600">Competitive rates with no hidden charges</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support for your convenience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 