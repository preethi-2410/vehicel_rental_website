import { collection, getDocs, doc, updateDoc, query } from 'firebase/firestore';
import { db } from './config.js';
import { cars, bikes } from '../data/vehicles.js';

const BOOKINGS_COLLECTION = 'bookings';

const updateBookingReferences = async () => {
  try {
    console.log('Starting to update booking references...');
    
    // Get all bookings
    const bookingsQuery = query(collection(db, BOOKINGS_COLLECTION));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    
    // Map of vehicle names to their correct IDs
    const vehicleNameToId = {};
    [...cars, ...bikes].forEach(vehicle => {
      vehicleNameToId[vehicle.name.toLowerCase()] = vehicle.id;
    });
    
    // Update each booking
    for (const bookingDoc of bookingsSnapshot.docs) {
      const booking = bookingDoc.data();
      
      // If the booking has a vehicle name, use it to find the correct ID
      if (booking.vehicleName) {
        const vehicleName = booking.vehicleName.toLowerCase();
        const correctId = vehicleNameToId[vehicleName];
        
        if (correctId) {
          await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingDoc.id), {
            vehicleId: correctId
          });
          console.log(`Updated booking ${bookingDoc.id} to use vehicle ID: ${correctId}`);
        }
      }
      // If no vehicle name but has BMW in the reference, set to car-3 (BMW 3 Series)
      else if (booking.vehicleId && booking.vehicleId.includes('BMW')) {
        await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingDoc.id), {
          vehicleId: 'car-3'
        });
        console.log(`Updated BMW booking ${bookingDoc.id} to use vehicle ID: car-3`);
      }
      // If it's a long Firebase ID or any other format, set to car-1 (Toyota Camry)
      else if (booking.vehicleId && booking.vehicleId.length > 10) {
        await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingDoc.id), {
          vehicleId: 'car-1'
        });
        console.log(`Updated booking ${bookingDoc.id} to use vehicle ID: car-1`);
      }
    }
    
    console.log('Successfully updated all booking references!');
    return true;
  } catch (error) {
    console.error('Error updating booking references:', error);
    throw error;
  }
};

// Run the update if this file is executed directly
if (import.meta.url === import.meta.main) {
  updateBookingReferences()
    .then(() => {
      console.log('Update completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Update failed:', error);
      process.exit(1);
    });
} 