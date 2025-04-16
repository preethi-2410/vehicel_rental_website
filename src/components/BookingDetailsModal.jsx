import React from 'react';
import { FaCalendarAlt, FaCarSide, FaClock, FaMoneyBillWave, FaTimes, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `₹${Number(amount).toFixed(2)}`;
  };

  // Extract customer information
  const customerName = booking.customerName || `${booking.firstName || ''} ${booking.lastName || ''}`.trim();
  const customerEmail = booking.customerEmail || booking.email;
  const customerPhone = booking.customerPhone || booking.phone;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Booking Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : booking.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
          </div>

          {/* Vehicle Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <FaCarSide className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-medium">
                    {booking.vehicle?.name || 'Vehicle unavailable'}
                  </p>
                </div>
              </div>
              {booking.vehicle && (
                <>
                  <div className="flex items-start">
                    <FaCarSide className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">{booking.vehicle.type}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaCarSide className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Transmission</p>
                      <p className="font-medium">{booking.vehicle.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaCarSide className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Fuel Type</p>
                      <p className="font-medium">{booking.vehicle.fuel}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Booking Period */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <FaCalendarAlt className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium">{formatDateTime(booking.startDate)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCalendarAlt className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-medium">{formatDateTime(booking.endDate)}</p>
                </div>
              </div>
              {booking.pickupLocation && (
                <div className="flex items-start col-span-2">
                  <FaMapMarkerAlt className="text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Pickup Location</p>
                    <p className="font-medium">{booking.pickupLocation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Details - Updated Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <FaUser className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {booking.customerName || `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <FaEnvelope className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">
                    {booking.customerEmail || booking.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <FaPhone className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">
                    {booking.customerPhone || booking.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <FaMoneyBillWave className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
                </div>
              </div>
              {booking.vehicle?.hourlyRate && (
                <div className="flex items-start">
                  <FaMoneyBillWave className="text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Rate</p>
                    <p className="font-medium">{formatCurrency(booking.vehicle.hourlyRate)}/hour</p>
                  </div>
                </div>
              )}
              {booking.paymentId && (
                <div className="flex items-start col-span-2">
                  <FaMoneyBillWave className="text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Payment ID</p>
                    <p className="font-medium">{booking.paymentId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Details */}
          {booking.status === 'cancelled' && booking.cancellationReason && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Cancellation Details</h3>
              <div className="space-y-2">
                <p className="text-sm text-red-600">Reason: {booking.cancellationReason}</p>
                {booking.cancellationDate && (
                  <p className="text-sm text-red-600">
                    Cancelled on: {formatDateTime(booking.cancellationDate)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 