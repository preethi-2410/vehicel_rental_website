import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, checkBookingsCollection, cancelBooking, rescheduleBooking } from '../firebase/bookings';
import { getVehicleById } from '../firebase/vehicles';
import { FaCalendarAlt, FaCarSide, FaClock, FaMoneyBillWave, FaTimes, FaExclamationTriangle, FaCalendarCheck, FaEdit, FaDownload, FaEye } from 'react-icons/fa';
import PaymentButton from '../components/PaymentButton';
import BookingDetailsModal from '../components/BookingDetailsModal';
import jsPDF from 'jspdf';

// Format datetime for input fields
const formatDateTimeForInput = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DDTHH:MM
    return date.toISOString().substring(0, 16);
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
};

// Get current date time with seconds set to zero to avoid validation issues
const getCurrentDateTimeString = () => {
  const now = new Date();
  now.setSeconds(0);
  return now.toISOString().substring(0, 16); // YYYY-MM-DDTHH:MM
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, bookingId, vehicle }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Cancellation</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to cancel your booking for 
          <span className="font-semibold">{vehicle ? ` ${vehicle.name}` : ''}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            No, Keep Booking
          </button>
          <button
            onClick={() => onConfirm(bookingId)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Yes, Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

// Reschedule Modal Component
const RescheduleModal = ({ isOpen, onClose, onConfirm, booking }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking && isOpen) {
      setStartDate(formatDateTimeForInput(booking.startDate));
      setEndDate(formatDateTimeForInput(booking.endDate));
      setError('');
    }
  }, [booking, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate dates
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
    const now = new Date();
    
    if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
      setError('Please enter valid dates');
      return;
    }
    
    if (newStartDate >= newEndDate) {
      setError('End date must be after start date');
      return;
    }
    
    if (newStartDate < now) {
      setError('Start date cannot be in the past');
      return;
    }
    
    setLoading(true);
    onConfirm(booking.id, startDate, endDate);
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Reschedule Booking</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <p className="text-gray-600 mb-4">
            Reschedule your booking for 
            <span className="font-semibold">{booking?.vehicle?.name || ''}</span>
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date and Time
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={getCurrentDateTimeString()}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date and Time
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || getCurrentDateTimeString()}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Determine booking status display color
const getBookingStatusColor = (booking) => {
  const now = new Date();
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  
  if (booking.status === 'cancelled') {
    return 'bg-red-100 text-red-800';
  }
  
  if (now < startDate) {
    return 'bg-blue-100 text-blue-800'; // Upcoming
  } else if (now >= startDate && now <= endDate) {
    return 'bg-green-100 text-green-800'; // Ongoing
  } else {
    return 'bg-purple-100 text-purple-800'; // Completed
  }
};

// Get user-friendly booking status label
const getBookingStatusLabel = (booking) => {
  const now = new Date();
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  
  if (booking.status === 'cancelled') {
    return 'Cancelled';
  }
  
  if (now < startDate) {
    return 'Upcoming';
  } else if (now >= startDate && now <= endDate) {
    return 'Ongoing';
  } else {
    return 'Completed';
  }
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collectionExists, setCollectionExists] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);
  const { user } = useAuth();

  // Open confirmation modal
  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmModal(true);
  };

  // Close confirmation modal
  const closeCancelModal = () => {
    setShowConfirmModal(false);
    setSelectedBooking(null);
  };

  // Open reschedule modal
  const openRescheduleModal = (booking) => {
    setSelectedBooking(booking);
    setShowRescheduleModal(true);
  };

  // Close reschedule modal
  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setSelectedBooking(null);
  };

  // Function to cancel a booking
  const handleCancelBooking = async (bookingId) => {
    // Close the modal
    setShowConfirmModal(false);
    
    try {
      setCancelError('');
      setCancelSuccess('');
      setCancellingId(bookingId);
      
      await cancelBooking(bookingId);
      
      // Update the booking in the state
      setBookings(prevBookings => prevBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      
      setCancelSuccess(`Booking ${bookingId} has been cancelled successfully.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setCancelSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setCancelError(error.message || 'Failed to cancel booking');
      
      // Clear error message after it's shown for 5 seconds
      setTimeout(() => {
        setCancelError('');
      }, 5000);
    } finally {
      setCancellingId(null);
      setSelectedBooking(null);
    }
  };

  // Function to reschedule a booking
  const handleRescheduleBooking = async (bookingId, newStartDate, newEndDate) => {
    // Close the modal
    setShowRescheduleModal(false);
    
    try {
      setRescheduleError('');
      setRescheduleSuccess('');
      setReschedulingId(bookingId);
      
      const result = await rescheduleBooking(bookingId, newStartDate, newEndDate);
      
      // Update the booking in the state
      setBookings(prevBookings => prevBookings.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              startDate: newStartDate,
              endDate: newEndDate,
              totalPrice: result.newTotalPrice,
              status: 'pending' // Reset to pending after reschedule
            } 
          : booking
      ));
      
      setRescheduleSuccess(`Booking has been rescheduled successfully.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setRescheduleSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      setRescheduleError(error.message || 'Failed to reschedule booking');
      
      // Clear error message after it's shown for 5 seconds
      setTimeout(() => {
        setRescheduleError('');
      }, 5000);
    } finally {
      setReschedulingId(null);
      setSelectedBooking(null);
    }
  };

  // Can this booking be modified?
  const canModifyBooking = (booking) => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }
    
    // Check if the booking start date is in the future
    const startDate = new Date(booking.startDate);
    const now = new Date();
    return startDate > now;
  };

  useEffect(() => {
    const checkCollection = async () => {
      const exists = await checkBookingsCollection();
      setCollectionExists(exists);
    };
    checkCollection();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        console.log('Current user ID:', user.uid);
        
        const userBookings = await getUserBookings(user.uid);
        console.log('Fetched bookings:', userBookings);
        
        // Fetch vehicle details and add user information for each booking
        const bookingsWithVehicles = await Promise.all(
          userBookings.map(async (booking) => {
            try {
              const vehicle = await getVehicleById(booking.vehicleId);
              return {
                ...booking,
                vehicle,
                // Ensure customer information is included
                customerName: user.displayName,
                customerEmail: user.email,
                customerPhone: user.phoneNumber || booking.phone,
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ')[1] || '',
                email: user.email
              };
            } catch (err) {
              console.error('Error fetching vehicle for booking:', booking.id, err);
              return {
                ...booking,
                vehicle: null,
                // Still include customer information even if vehicle fetch fails
                customerName: user.displayName,
                customerEmail: user.email,
                customerPhone: user.phoneNumber || booking.phone,
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ')[1] || '',
                email: user.email
              };
            }
          })
        );

        console.log('Final bookings with vehicles and customer info:', bookingsWithVehicles);
        setBookings(bookingsWithVehicles);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Generate and download PDF receipt
  const downloadReceipt = (booking) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60));

      // Set initial font size and style for header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('VEHICLE RENTAL RECEIPT', 105, 20, { align: 'center' });
      
      // Add company name
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Your Vehicle Rental Service', 105, 30, { align: 'center' });
      
      // Add a line
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);

      // Booking details
      doc.setFontSize(11);
      let y = 45; // Starting y position for content

      // Helper function to add a section title
      const addSectionTitle = (title) => {
        y += 5; // Add space before section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(title, 20, y);
        doc.line(20, y + 1, 190, y + 1); // Underline the section title
        y += 8;
        doc.setFontSize(11);
      };

      // Helper function to add a row with label and value
      const addRow = (label, value) => {
        const displayValue = value || 'N/A';
        doc.setFont('helvetica', 'bold');
        doc.text(label, 25, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(displayValue), 80, y);
        y += 7;
      };

      // Format currency
      const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return `₹${Number(amount).toFixed(2)}`;
      };

      // Format date
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

      // Add booking information
      addSectionTitle('Booking Information');
      addRow('Booking ID:', booking.id);
      addRow('Status:', booking.status.toUpperCase());
      addRow('Payment Status:', booking.paymentStatus.toUpperCase());
      
      // Add customer details
      addSectionTitle('Customer Details');
      const customerName = booking.customerName || `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || user?.displayName;
      const customerEmail = booking.customerEmail || booking.email || user?.email;
      const customerPhone = booking.customerPhone || booking.phone;

      addRow('Name:', customerName || 'N/A');
      addRow('Email:', customerEmail || 'N/A');
      addRow('Phone:', customerPhone || 'N/A');
      
      // Add vehicle details
      addSectionTitle('Vehicle Details');
      if (booking.vehicle) {
        addRow('Vehicle:', booking.vehicle.name);
        addRow('Vehicle Type:', booking.vehicle.type?.charAt(0).toUpperCase() + booking.vehicle.type?.slice(1));
        addRow('Transmission:', booking.vehicle.transmission);
        addRow('Fuel Type:', booking.vehicle.fuel);
        addRow('Vehicle ID:', booking.vehicleId);
      } else {
        addRow('Vehicle:', 'Vehicle unavailable');
        addRow('Vehicle ID:', booking.vehicleId);
      }
      
      // Add booking period details
      addSectionTitle('Booking Period');
      addRow('From:', formatDateTime(startDate));
      addRow('To:', formatDateTime(endDate));
      addRow('Duration:', `${duration} hour${duration > 1 ? 's' : ''}`);
      
      if (booking.pickupLocation) {
        addRow('Pickup Location:', booking.pickupLocation);
      }
      
      // Add payment details
      addSectionTitle('Payment Details');
      addRow('Total Amount:', formatCurrency(booking.totalPrice));
      if (booking.vehicle && booking.vehicle.hourlyRate) {
        addRow('Hourly Rate:', formatCurrency(booking.vehicle.hourlyRate) + '/hour');
      }
      addRow('Payment ID:', booking.paymentId);
      
      // Add cancellation details if cancelled
      if (booking.status === 'cancelled' && booking.cancellationReason) {
        addSectionTitle('Cancellation Details');
        addRow('Reason:', booking.cancellationReason);
        if (booking.cancellationDate) {
          addRow('Cancelled On:', formatDateTime(booking.cancellationDate));
        }
      }

      // Add footer
      y += 15;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128); // Gray color
      doc.text('Thank you for choosing our service!', 105, y, { align: 'center' });
      
      // Add terms and conditions
      y += 8;
      doc.setFontSize(8);
      doc.text('This is an electronically generated receipt.', 105, y, { align: 'center' });
      
      // Add timestamp
      y += 5;
      doc.text(`Generated on: ${formatDateTime(new Date())}`, 105, y, { align: 'center' });

      // Save the PDF
      doc.save(`booking-receipt-${booking.id}.pdf`);
    } catch (error) {
      console.error('Error generating receipt:', error);
      setError('Failed to generate receipt. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
      
      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={!!selectedBookingForDetails}
        onClose={() => setSelectedBookingForDetails(null)}
        booking={selectedBookingForDetails}
      />
      
      {bookings.some(booking => !booking.vehicle) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-medium">Some of your booked vehicles are no longer available</p>
          <p className="mt-1">These vehicles may have been removed from our fleet. Your booking history is preserved for your records.</p>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={closeCancelModal}
        onConfirm={handleCancelBooking}
        bookingId={selectedBooking?.id}
        vehicle={selectedBooking?.vehicle}
      />
      
      {/* Reschedule Modal */}
      <RescheduleModal 
        isOpen={showRescheduleModal}
        onClose={closeRescheduleModal}
        onConfirm={handleRescheduleBooking}
        booking={selectedBooking}
      />
      
      {cancelError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <p>{cancelError}</p>
        </div>
      )}
      
      {rescheduleError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <p>{rescheduleError}</p>
        </div>
      )}
      
      {cancelSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{cancelSuccess}</p>
        </div>
      )}
      
      {rescheduleSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{rescheduleSuccess}</p>
        </div>
      )}
      
      {collectionExists === false && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>The bookings collection does not exist in Firestore. This may indicate a database setup issue.</p>
        </div>
      )}
      
      {bookings.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Bookings Found</h2>
          <p className="text-gray-600 mb-8">You haven't made any bookings yet.</p>
          <a
            href="/cars"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Vehicles
          </a>
        </div>
      )}
      
      <div className="space-y-6">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.vehicle ? booking.vehicle.name : (
                    <span className="text-yellow-600">
                      This vehicle is no longer available in our fleet
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Payment Status */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                  
                  {/* Booking Status */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'confirmed' || booking.status === 'pending'
                      ? getBookingStatusColor(booking)
                      : booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getBookingStatusLabel(booking)}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Booking ID: {booking.id}
                </div>
                
                <div className="flex space-x-2">
                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedBookingForDetails(booking)}
                    className="flex items-center text-sm font-medium px-3 py-1.5 rounded bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    <FaEye className="mr-1" /> View Details
                  </button>
                  
                  {booking.paymentStatus === 'paid' && (
                    <button
                      onClick={() => downloadReceipt(booking)}
                      className="flex items-center text-sm font-medium px-3 py-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100"
                    >
                      <FaDownload className="mr-1" /> Download Receipt
                    </button>
                  )}
                  
                  {/* ... other buttons ... */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;