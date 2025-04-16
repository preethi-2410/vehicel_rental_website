import { setDoc, doc, collection } from 'firebase/firestore';
import { db } from './config.js';
import { cars, bikes } from '../data/vehicles.js';

const VEHICLES_COLLECTION = 'vehicles';

export const seedVehicles = async () => {
  try {
    console.log('Starting to seed vehicles...');
    const vehicles = [...cars, ...bikes];
    
    for (const vehicle of vehicles) {
      // Use the vehicle's ID directly
      const vehicleData = {
        ...vehicle,
        hourlyRate: Math.round(vehicle.price / 24), // Convert daily rate to hourly
        availabilityStatus: true,
        createdAt: new Date().toISOString()
      };
      
      // Use setDoc with the original ID
      await setDoc(doc(db, VEHICLES_COLLECTION, vehicle.id), vehicleData);
      console.log(`Added vehicle ${vehicle.name} with ID: ${vehicle.id}`);
    }
    
    console.log('Successfully seeded all vehicles!');
    return true;
  } catch (error) {
    console.error('Error seeding vehicles:', error);
    throw error;
  }
};

// Run the seeding if this file is executed directly
if (import.meta.url === import.meta.main) {
  seedVehicles()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 