import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaList, FaTicketAlt, FaCreditCard } from 'react-icons/fa';

const BookingSuccess = () => {
  const location = useLocation();
  const bookingInfo = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Booking Confirmed!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for choosing our service. Your booking has been successfully processed.
        </p>

        {bookingInfo.bookingId && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="mb-4">
              <p className="text-gray-500">Booking Reference</p>
              <p className="text-xl font-bold">{bookingInfo.bookingId}</p>
            </div>
            
            <div className="space-y-3 text-left">
              {bookingInfo.vehicleName && (
                <div>
                  <p className="text-gray-500 text-sm">Vehicle</p>
                  <p className="font-medium">{bookingInfo.vehicleName}</p>
                </div>
              )}
              
              {bookingInfo.startDate && bookingInfo.endDate && (
                <div>
                  <p className="text-gray-500 text-sm">Booking Period</p>
                  <p className="font-medium">
                    {new Date(bookingInfo.startDate).toLocaleString()} - {new Date(bookingInfo.endDate).toLocaleString()}
                  </p>
                </div>
              )}
              
              {bookingInfo.customerName && (
                <div>
                  <p className="text-gray-500 text-sm">Customer</p>
                  <p className="font-medium">{bookingInfo.customerName}</p>
                </div>
              )}
              
              {bookingInfo.totalPrice && (
                <div>
                  <p className="text-gray-500 text-sm">Total Amount</p>
                  <p className="font-medium text-green-600">₹{bookingInfo.totalPrice}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {bookingInfo.bookingId && (
            <Link
              to={`/payment/${bookingInfo.bookingId}`}
              className="block w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors duration-300 flex items-center justify-center"
            >
              <FaCreditCard className="mr-2" />
              Pay Now
            </Link>
          )}
          
          <Link
            to="/my-bookings"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
          >
            <FaTicketAlt className="mr-2" />
            View My Bookings
          </Link>
          
          <Link
            to="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center"
          >
            <FaHome className="mr-2" />
            Return to Home
          </Link>
          
          <Link
            to="/cars"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center"
          >
            <FaList className="mr-2" />
            Browse More Vehicles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess; 