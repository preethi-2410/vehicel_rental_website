import React, { useState, useEffect } from 'react';
import { 
  getAllBookings, 
  updateBookingStatus 
} from '../../firebase/bookings';
import { getVehicleById } from '../../firebase/vehicles';
import { FaSearch, FaEdit, FaCheck, FaTimes, FaExclamationCircle } from 'react-icons/fa';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  // Load all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookingsData = await getAllBookings();
        
        // Fetch vehicle details for each booking
        const bookingsWithVehicles = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const vehicle = await getVehicleById(booking.vehicleId);
              return {
                ...booking,
                vehicle
              };
            } catch (err) {
              console.error(`Error fetching vehicle for booking ${booking.id}:`, err);
              return {
                ...booking,
                vehicle: { name: 'Unknown Vehicle' }
              };
            }
          })
        );
        
        setBookings(bookingsWithVehicles);
      } catch (err) {
        setError('Failed to load bookings: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Handle updating booking status
  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateBookingStatus(currentBooking.id, currentBooking.status);
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === currentBooking.id 
            ? { ...booking, status: currentBooking.status } 
            : booking
        )
      );
      
      setShowEditModal(false);
    } catch (err) {
      setError('Failed to update booking: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || booking.paymentStatus === filterPayment;
    
    const searchFields = [
      booking.id,
      booking.vehicle?.name,
      booking.customerDetails?.firstName,
      booking.customerDetails?.lastName,
      booking.customerDetails?.email
    ].filter(Boolean).join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPayment && matchesSearch;
  });

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <h2 className="text-xl font-semibold">Bookings Management</h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          
          {/* Payment status filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map(booking => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.id.substring(0, 8)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.vehicle?.name || 'Unknown Vehicle'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.customerDetails?.firstName} {booking.customerDetails?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{booking.customerDetails?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(booking.startDate).toLocaleTimeString()} - {new Date(booking.endDate).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">₹{booking.totalPrice}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : booking.status === 'completed'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => {
                      setCurrentBooking(booking);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FaEdit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Booking Modal */}
      {showEditModal && currentBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Update Booking Status</h2>
            <form onSubmit={handleUpdateBooking}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Booking ID
                </label>
                <p className="text-gray-600">{currentBooking.id}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Vehicle
                </label>
                <p className="text-gray-600">{currentBooking.vehicle?.name || 'Unknown Vehicle'}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Customer
                </label>
                <p className="text-gray-600">
                  {currentBooking.customerDetails?.firstName} {currentBooking.customerDetails?.lastName}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Booking Status
                </label>
                <select
                  value={currentBooking.status}
                  onChange={(e) => setCurrentBooking({...currentBooking, status: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement; 