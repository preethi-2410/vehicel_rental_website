import { useState } from 'react';
import { FaCreditCard, FaSpinner } from 'react-icons/fa';
import { initiatePayment } from '../firebase/payments';
import { useAuth } from '../context/AuthContext';

const PaymentButton = ({ booking, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call the payment service
      const result = await initiatePayment(booking, user);
      
      // Check if payment was successful
      if (result && result.success) {
        console.log('Payment completed successfully:', result);
        
        // Call the success callback with the result
        if (onPaymentSuccess) {
          onPaymentSuccess(result);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Failed to process payment');
      
      // Call the error callback
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
    
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`flex items-center justify-center w-full px-4 py-2 text-white font-medium rounded-md
          ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
          transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <FaCreditCard className="mr-2" />
            Pay Now ₹{booking.totalPrice.toFixed(2)}
          </>
        )}
      </button>
    </div>
  );
};

export default PaymentButton; 