import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCar } from 'react-icons/fa';

const SearchForm = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: '',
    vehicleType: 'all'
  });

  // List of valid cities in AP and Telangana
  const validCities = [
    // Andhra Pradesh
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 
    'Kakinada', 'Tirupati', 'Rajahmundry', 'Kadapa', 'Anantapur',
    // Telangana
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
    'Secunderabad', 'Suryapet', 'Nalgonda', 'Adilabad'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if the entered location is in the valid cities list
    const isValidCity = validCities.some(
      city => city.toLowerCase() === searchData.location.trim().toLowerCase()
    );

    if (!isValidCity) {
      // Redirect to LocationNotServed page if city is not valid
      navigate('/location-not-served', { 
        state: { 
          location: searchData.location,
          validCities: validCities 
        } 
      });
      return;
    }

    // If location is valid, proceed with the search
    navigate('/cars', { 
      state: { ...searchData },
      search: `?location=${searchData.location}&showAll=true` 
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pickup Location */}
          <div className="relative md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="location"
                value={searchData.location}
                onChange={handleChange}
                placeholder="Enter city in AP or Telangana"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                list="cities"
              />
              <datalist id="cities">
                {validCities.map((city, index) => (
                  <option key={index} value={city} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="relative md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="vehicleType"
                value={searchData.vehicleType}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Vehicles</option>
                <option value="car">Cars</option>
                <option value="bike">Bikes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search Vehicles
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm; 