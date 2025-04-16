// New Car Images
const newCars = {
  car7: 'https://images.unsplash.com/photo-1617654112368-307921291f42?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
  car8: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
  car9: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
  car10: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
};

// New Bike Images
const newBikes = {
  bike7: 'https://images.unsplash.com/photo-1568708167243-438efa4505f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
  bike8: 'https://images.unsplash.com/photo-1571646034647-52e6ea84b28c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
  bike9: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
  bike10: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
};

// Additional cars data
const additionalCars = [
  {
    name: 'Porsche 911',
    type: 'car',
    image: newCars.car7,
    price: 150,
    hourlyRate: 7,
    rating: 4.9,
    seats: 2,
    transmission: 'Automatic',
    fuel: 'Gasoline'
  },
  {
    name: 'Range Rover Sport',
    type: 'car',
    image: newCars.car8,
    price: 120,
    hourlyRate: 5,
    rating: 4.8,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Diesel'
  },
  {
    name: 'Lexus ES',
    type: 'car',
    image: newCars.car9,
    price: 95,
    hourlyRate: 4,
    rating: 4.7,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Hybrid'
  },
  {
    name: 'Volkswagen Golf GTI',
    type: 'car',
    image: newCars.car10,
    price: 75,
    hourlyRate: 3.5,
    rating: 4.6,
    seats: 5,
    transmission: 'Manual',
    fuel: 'Gasoline'
  }
];

// Additional bikes data
const additionalBikes = [
  {
    name: 'KTM Duke 390',
    type: 'bike',
    image: newBikes.bike7,
    price: 45,
    hourlyRate: 2,
    rating: 4.7,
    engineSize: '373cc'
  },
  {
    name: 'Royal Enfield Classic 350',
    type: 'bike',
    image: newBikes.bike8,
    price: 35,
    hourlyRate: 1.5,
    rating: 4.6,
    engineSize: '349cc'
  },
  {
    name: 'Suzuki GSX-R750',
    type: 'bike',
    image: newBikes.bike9,
    price: 60,
    hourlyRate: 2.5,
    rating: 4.8,
    engineSize: '750cc'
  },
  {
    name: 'Harley-Davidson Iron 883',
    type: 'bike',
    image: newBikes.bike10,
    price: 70,
    hourlyRate: 3,
    rating: 4.7,
    engineSize: '883cc'
  }
];

import { addDoc, collection } from 'firebase/firestore';
import { db } from './config';

const VEHICLES_COLLECTION = 'vehicles';

export const addNewVehicles = async () => {
  try {
    console.log('Starting to add new vehicles...');
    const allNewVehicles = [...additionalCars, ...additionalBikes];
    const addedVehicles = [];

    for (const vehicle of allNewVehicles) {
      const vehicleData = {
        ...vehicle,
        availabilityStatus: true,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), vehicleData);
      console.log(`Added vehicle ${vehicle.name} with ID: ${docRef.id}`);
      addedVehicles.push({ id: docRef.id, name: vehicle.name });
    }

    console.log('Successfully added all new vehicles!');
    return addedVehicles;
  } catch (error) {
    console.error('Error adding new vehicles:', error);
    throw error;
  }
}; 