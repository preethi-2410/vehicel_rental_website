import { getDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './config';
import { getBookingById } from './bookings';
import { getVehicleById } from './vehicles';

// Replace with your actual Razorpay key ID
const RAZORPAY_KEY_ID = 'rzp_test_4WFgF986wjVwyO';

/**
 * Dynamically loads the Razorpay script
 * @returns {Promise} Resolves when the script is loaded
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Initiates a payment process with Razorpay
 * @param {Object} booking - The booking object
 * @param {Object} user - The user object
 * @returns {Promise} Promise that resolves with the payment details
 */
export const initiatePayment = async (booking, user) => {
  // Load Razorpay script if not already loaded
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    throw new Error('Failed to load Razorpay checkout script');
  }

  if (!window.Razorpay) {
    throw new Error('Razorpay not available');
  }

  // Validate inputs
  if (!booking?.id || !booking?.totalPrice) {
    throw new Error('Invalid booking information');
  }

  if (!user?.uid || !user?.email) {
    throw new Error('User information required');
  }

  return new Promise((resolve, reject) => {
    // Format amount (Razorpay expects amount in paise)
    const amountInPaise = Math.round(booking.totalPrice * 100);
    
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Ride Rental',
      description: `Booking for ${booking.vehicle?.name || 'Vehicle'}`,
      image: 'https://cdn-icons-png.flaticon.com/512/5648/5648197.png', // Car rental logo from flaticon
      order_id: '', // This will come from your backend when you implement server-side integration
      handler: async function(response) {
        // This function runs when payment is successful
        try {
          const result = await handlePaymentSuccess(response, booking.id);
          resolve(result); // Resolve the promise with the payment result
        } catch (error) {
          reject(error);
        }
      },
      prefill: {
        name: user.displayName || 'Customer',
        email: user.email || '',
        contact: user.phone || ''
      },
      notes: {
        bookingId: booking.id,
        vehicleId: booking.vehicleId,
        startDate: booking.startDate,
        endDate: booking.endDate
      },
      theme: {
        color: '#3B82F6' // Blue color to match your UI
      }
    };
    
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    
    // Handle payment failure
    paymentObject.on('payment.failed', function(response) {
      reject(new Error('Payment failed: ' + response.error.description));
    });
  });
};

// Handle successful payment
export const handlePaymentSuccess = async (response, bookingId) => {
  try {
    console.log('Payment successful!', response);
    
    // In a real implementation, you would verify this payment on your backend
    // before updating the booking status
    
    // Update payment status in Firestore
    await updatePaymentStatus(
      bookingId,
      response.razorpay_payment_id,
      'paid'
    );
    
    // Generate receipt data
    const bookingData = await getBookingById(bookingId);
    let vehicleData = null;
    
    if (bookingData && bookingData.vehicleId) {
      try {
        vehicleData = await getVehicleById(bookingData.vehicleId);
      } catch (err) {
        console.warn('Could not fetch vehicle details for receipt', err);
      }
    }
    
    // Return payment details and success status
    return {
      success: true,
      paymentDetails: {
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
        bookingId: bookingId,
        status: 'paid'
      },
      booking: bookingData,
      vehicle: vehicleData
    };
  } catch (error) {
    console.error('Error processing payment success:', error);
    throw error;
  }
};

// Generate receipt for a booking
export const generateReceipt = (booking, paymentDetails) => {
  if (!booking || !paymentDetails) {
    throw new Error('Booking and payment details are required');
  }

  // Calculate duration in hours
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const durationHours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
  
  // Calculate amounts
  const subtotal = booking.totalPrice || 0;
  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  const receiptData = {
    receiptNumber: `RCPT-${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
    date: new Date().toISOString(),
    status: 'Paid',
    
    // Customer Information
    customer: {
      name: booking.customerDetails?.firstName 
        ? `${booking.customerDetails.firstName} ${booking.customerDetails.lastName || ''}`
        : 'Customer',
      email: booking.customerDetails?.email || 'N/A'
    },
    
    // Booking Information
    booking: {
      id: booking.id,
      vehicle: booking.vehicle?.name || 'Vehicle',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: `${durationHours} hours`
    },
    
    // Payment Information
    payment: {
      subtotal: subtotal,
      tax: taxAmount,
      total: totalAmount,
      method: 'Razorpay',
      id: paymentDetails.paymentId
    },
    
    // Company Information
    company: {
      name: 'Ride Rental',
      email: 'support@riderental.com',
      phone: '+91 1234567890',
      address: '123 Main Street, City, State, India'
    }
  };
  
  return receiptData;
};

// Record payment in a separate collection (useful for reports)
export const recordPayment = async (paymentDetails) => {
  // This would be implemented to store payment records in a payments collection
  // For now, we'll just return the details
  return paymentDetails;
};

// Updates the payment status of a booking in Firestore
export const updatePaymentStatus = async (bookingId, paymentId, paymentStatus = 'paid') => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      throw new Error(`Booking ${bookingId} not found`);
    }
    
    // When payment is successful, also update the booking status to confirmed
    const updateData = {
      paymentStatus,
      paymentId,
      paymentDate: new Date().toISOString()
    };
    
    // If payment is marked as paid, also set the booking status to confirmed
    if (paymentStatus === 'paid') {
      updateData.status = 'confirmed';
    }
    
    await updateDoc(bookingRef, updateData);
    
    console.log(`Payment status updated to ${paymentStatus} for booking ${bookingId}`);
    return true;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}; 