import React from 'react';
import { Link } from 'react-router-dom';
import { FaGasPump, FaCar, FaUsers } from 'react-icons/fa';

const VehicleCard = ({ vehicle, bookingData }) => {
  // Use the Firestore document ID from the vehicle object
  const { name, type, image, hourlyRate, seats, transmission, fuel, rating } = vehicle;
  const { location, startDate, endDate } = bookingData || {};

  console.log('VehicleCard - Vehicle data:', vehicle);
  console.log('VehicleCard - Vehicle ID:', vehicle.id);

  // Construct booking URL with parameters
  const bookingUrl = `/vehicle/${vehicle.id}${location ? `?location=${encodeURIComponent(location)}` : ''}${
    startDate ? `&start=${encodeURIComponent(startDate)}` : ''
  }${endDate ? `&end=${encodeURIComponent(endDate)}` : ''}`;

  console.log('VehicleCard - Generated URL:', bookingUrl);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-md">
          {type}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="ml-1 text-gray-600">{rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          {seats && (
            <div className="flex items-center text-gray-600">
              <FaUsers className="mr-2" />
              <span>{seats} seats</span>
            </div>
          )}
          {transmission && (
            <div className="flex items-center text-gray-600">
              <FaCar className="mr-2" />
              <span>{transmission}</span>
            </div>
          )}
          {fuel && (
            <div className="flex items-center text-gray-600">
              <FaGasPump className="mr-2" />
              <span>{fuel}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-900">
            <span className="text-2xl font-bold">₹{hourlyRate}</span>
            <span className="text-gray-600">/hour</span>
          </div>
          <Link
            to={bookingUrl}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard; 