import { useEffect } from 'react';
import { checkAndFixBookingStatuses } from '../firebase/bookings';

const BookingMonitor = () => {
  useEffect(() => {
    // Function to check and update booking statuses
    const checkBookings = async () => {
      try {
        console.log('BookingMonitor: Starting comprehensive booking check...');
        const updatedBookings = await checkAndFixBookingStatuses();
        
        if (updatedBookings.length > 0) {
          console.log('BookingMonitor: Updated bookings:', 
            updatedBookings.map(b => ({
              id: b.id,
              oldStatus: b.status,
              newStatus: b.updates?.status,
              startDate: b.startDate,
              paymentStatus: b.paymentStatus
            }))
          );
        } else {
          console.log('BookingMonitor: No bookings needed updates');
        }
      } catch (error) {
        console.error('BookingMonitor: Error checking bookings:', error);
      }
    };

    console.log('BookingMonitor: Component mounted, starting monitoring...');

    // Check immediately when component mounts
    checkBookings();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkBookings, 30 * 1000);

    // Clean up interval on unmount
    return () => {
      console.log('BookingMonitor: Component unmounting, cleaning up...');
      clearInterval(interval);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default BookingMonitor; 