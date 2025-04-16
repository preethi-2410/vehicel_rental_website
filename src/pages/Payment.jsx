import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { getBookingById } from '../firebase/bookings';
import { getVehicleById } from '../firebase/vehicles';
import { generateReceipt } from '../firebase/payments';
import PaymentButton from '../components/PaymentButton';
import Receipt from '../components/Receipt';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get booking details
        const bookingData = await getBookingById(id);
        
        if (!bookingData) {
          setError('Booking not found');
          return;
        }
        
        // Check if user is authorized to view this booking
        if (bookingData.userId !== user.uid) {
          setError('You are not authorized to view this booking');
          return;
        }
        
        // Get vehicle details
        const vehicleData = await getVehicleById(bookingData.vehicleId);
        
        setBooking(bookingData);
        setVehicle(vehicleData);
        
        // Check if already paid
        if (bookingData.paymentStatus === 'paid') {
          setPaymentSuccess(true);
          
          // Generate receipt
          const receiptData = generateReceipt(
            { ...bookingData, vehicle: vehicleData }, 
            { paymentId: bookingData.paymentId || 'N/A' }
          );
          setReceipt(receiptData);
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchBooking();
    }
  }, [id, user]);

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    setPaymentSuccess(true);
    
    // Generate receipt
    const receiptData = generateReceipt(
      { ...booking, vehicle }, 
      { 
        paymentId: result?.paymentDetails?.paymentId || 'RZP' + Math.random().toString(36).substring(2, 10),
        amount: booking.totalPrice
      }
    );
    setReceipt(receiptData);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError('Payment failed: ' + error.message);
    
    // Clear error after 5 seconds
    setTimeout(() => {
      setError('');
    }, 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 px-4 mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/my-bookings')} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Go to My Bookings
        </button>
      </div>
    );
  }

  if (!booking || !vehicle) {
    return (
      <div className="container py-12 px-4 mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>Booking information not available</p>
        </div>
        <button 
          onClick={() => navigate('/my-bookings')} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Go to My Bookings
        </button>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="container py-12 px-4 mx-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 flex items-center">
            <FaCheckCircle className="mr-2" />
            <p>Payment successful! Thank you for your purchase.</p>
          </div>
          
          {receipt && <Receipt receipt={receipt} />}
          
          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => navigate('/my-bookings')} 
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaArrowLeft className="mr-2" /> Go to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 px-4 mx-auto">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/my-bookings')} 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <FaArrowLeft className="mr-2" /> Back to My Bookings
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6 bg-blue-50 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
            <p className="text-gray-600 mt-1">Booking ID: {booking.id}</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Booking Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle</p>
                    <p className="font-medium">{vehicle.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booking Period</p>
                    <p className="font-medium">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">
                      {new Date(booking.startDate).toLocaleTimeString()} - {new Date(booking.endDate).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60))} hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Payment Summary</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-gray-500">Subtotal</td>
                      <td className="px-4 py-3 text-right">₹{booking.totalPrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-500">Tax (18% GST)</td>
                      <td className="px-4 py-3 text-right">₹{(booking.totalPrice * 0.18).toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-3">Total</td>
                      <td className="px-4 py-3 text-right">₹{(booking.totalPrice * 1.18).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <FaCreditCard className="text-blue-500 mr-2" />
                  <div>
                    <p className="font-medium">Pay with Razorpay</p>
                    <p className="text-sm text-gray-500">Secure online payment</p>
                  </div>
                </div>
              </div>
              
              <PaymentButton 
                booking={{
                  ...booking,
                  vehicle,
                  totalPrice: Math.round(booking.totalPrice * 1.18 * 100) / 100 // Include tax
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 