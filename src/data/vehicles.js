// Car Images
const car1 = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';
const car2 = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';
const car3 = 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';
const car4 = 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';
const car5 = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';
const car6 = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';

// Bike Images
const bike1 = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';
const bike2 = 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';
const bike3 = 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';
const bike4 = 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';
const bike5 = 'https://images.unsplash.com/photo-1611241443322-78b19f75ea8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';
const bike6 = 'https://images.unsplash.com/photo-1608462944927-b3c25c587b8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60';

export const cars = [
  {
    id: 'car-1',
    name: 'Toyota Camry',
    type: 'car',
    image: car1,
    price: 60,
    rating: 4.8,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Gasoline',
  },
  {
    id: 'car-2',
    name: 'Honda Civic',
    type: 'car',
    image: car2,
    price: 55,
    rating: 4.7,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Gasoline',
  },
  {
    id: 'car-3',
    name: 'BMW 3 Series',
    type: 'car',
    image: car3,
    price: 85,
    rating: 4.9,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Gasoline',
  },
  {
    id: 'car-4',
    name: 'Mercedes-Benz C-Class',
    type: 'car',
    image: car4,
    price: 90,
    rating: 4.9,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Gasoline',
  },
  {
    id: 'car-5',
    name: 'Tesla Model 3',
    type: 'car',
    image: car5,
    price: 100,
    rating: 4.9,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Electric',
  },
  {
    id: 'car-6',
    name: 'Audi A4',
    type: 'car',
    image: car6,
    price: 80,
    rating: 4.8,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Gasoline',
  },
];

export const bikes = [
  {
    id: 'bike-1',
    name: 'Yamaha MT-07',
    type: 'bike',
    image: bike1,
    price: 40,
    rating: 4.7,
    engineSize: '689cc',
  },
  {
    id: 'bike-2',
    name: 'Honda CBR650R',
    type: 'bike',
    image: bike2,
    price: 45,
    rating: 4.8,
    engineSize: '649cc',
  },
  {
    id: 'bike-3',
    name: 'Kawasaki Ninja 400',
    type: 'bike',
    image: bike3,
    price: 35,
    rating: 4.6,
    engineSize: '399cc',
  },
  {
    id: 'bike-4',
    name: 'Ducati Monster',
    type: 'bike',
    image: bike4,
    price: 55,
    rating: 4.9,
    engineSize: '937cc',
  },
  {
    id: 'bike-5',
    name: 'Triumph Street Triple',
    type: 'bike',
    image: bike5,
    price: 50,
    rating: 4.8,
    engineSize: '765cc',
  },
  {
    id: 'bike-6',
    name: 'BMW S1000RR',
    type: 'bike',
    image: bike6,
    price: 65,
    rating: 4.9,
    engineSize: '999cc',
  },
];

export const getAllVehicles = () => {
  return [...cars, ...bikes];
};

export const getVehicleById = (id) => {
  return getAllVehicles().find(vehicle => vehicle.id === id);
};

export const getVehiclesByType = (type) => {
  return getAllVehicles().filter(vehicle => vehicle.type === type);
};

export const getFeaturedVehicles = (count = 6) => {
  const allVehicles = getAllVehicles();
  const shuffled = [...allVehicles].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}; 