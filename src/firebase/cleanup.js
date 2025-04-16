import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';

const VEHICLES_COLLECTION = 'vehicles';

export const removeDuplicateVehicles = async () => {
  try {
    console.log('Starting duplicate vehicle cleanup...');
    
    // Get all vehicles
    const querySnapshot = await getDocs(collection(db, VEHICLES_COLLECTION));
    const vehicles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${vehicles.length} total vehicles`);

    // Create a map to track unique vehicles by name
    const uniqueVehicles = new Map();
    const duplicates = [];

    vehicles.forEach(vehicle => {
      if (!uniqueVehicles.has(vehicle.name)) {
        // Keep the first instance of each vehicle
        uniqueVehicles.set(vehicle.name, vehicle);
      } else {
        // Add to duplicates list
        duplicates.push(vehicle);
      }
    });

    console.log(`Found ${duplicates.length} duplicate vehicles`);

    // Delete duplicate vehicles
    for (const vehicle of duplicates) {
      console.log(`Deleting duplicate vehicle: ${vehicle.name} (ID: ${vehicle.id})`);
      await deleteDoc(doc(db, VEHICLES_COLLECTION, vehicle.id));
    }

    console.log('Cleanup completed successfully!');
    return {
      totalVehicles: vehicles.length,
      duplicatesRemoved: duplicates.length,
      remainingVehicles: vehicles.length - duplicates.length
    };
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}; 