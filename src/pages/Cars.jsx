import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import { getAvailableVehicles } from '../firebase/vehicles';

const Cars = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedTransmission, setSelectedTransmission] = useState([]);
  const [selectedFuel, setSelectedFuel] = useState([]);
  const [pickupLocation, setPickupLocation] = useState(queryParams.get('location') || '');
  const [pickupDate, setPickupDate] = useState(queryParams.get('start') || '');
  const [returnDate, setReturnDate] = useState(queryParams.get('end') || '');
  const [showAll, setShowAll] = useState(queryParams.get('showAll') === 'true');

  // Fetch cars from Firestore
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const vehiclesData = await getAvailableVehicles('car');
        console.log('Fetched vehicles:', vehiclesData);
        
        // Remove duplicates based on vehicle name
        const uniqueVehicles = Array.from(
          new Map(vehiclesData.map(item => [item.name, item])).values()
        );
        
        setCars(uniqueVehicles);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Failed to load cars. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Get unique transmission types
  const transmissionTypes = Array.from(new Set(cars.map(car => car.transmission)));
  
  // Get unique fuel types
  const fuelTypes = Array.from(new Set(cars.map(car => car.fuel)));

  // Effect to handle URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setPickupLocation(params.get('location') || '');
    setPickupDate(params.get('start') || '');
    setReturnDate(params.get('end') || '');
    setShowAll(params.get('showAll') === 'true');
    
    // If location is provided in the URL, use it as the search term
    if (params.get('location')) {
      setSearchTerm(params.get('location') || '');
    }
  }, [location.search]);

  const toggleTransmission = (transmission) => {
    if (selectedTransmission.includes(transmission)) {
      setSelectedTransmission(selectedTransmission.filter(t => t !== transmission));
    } else {
      setSelectedTransmission([...selectedTransmission, transmission]);
    }
  };

  const toggleFuel = (fuel) => {
    if (selectedFuel.includes(fuel)) {
      setSelectedFuel(selectedFuel.filter(f => f !== fuel));
    } else {
      setSelectedFuel([...selectedFuel, fuel]);
    }
  };

  const resetFilters = () => {
    setPriceRange([0, 200]);
    setSelectedTransmission([]);
    setSelectedFuel([]);
    setSearchTerm('');
  };

  const filteredCars = cars.filter(car => {
    // Filter by search term
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (pickupLocation && pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by price range (using hourlyRate instead of price)
    const matchesPrice = car.hourlyRate >= priceRange[0] && car.hourlyRate <= priceRange[1];
    
    // Filter by transmission
    const matchesTransmission = selectedTransmission.length === 0 || 
      (car.transmission && selectedTransmission.includes(car.transmission));
    
    // Filter by fuel
    const matchesFuel = selectedFuel.length === 0 || 
      (car.fuel && selectedFuel.includes(car.fuel));
    
    return matchesSearch && matchesPrice && matchesTransmission && matchesFuel;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-4">Rent a Car in India</h1>
        <p className="text-gray-600 max-w-3xl">
          Choose from our wide selection of cars for your next journey across India. We offer various models from economy to luxury, all at competitive prices.
        </p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="Search cars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          <span>Filters</span>
        </button>
      </div>
      
      {/* Search Parameters Summary */}
      {(pickupLocation || pickupDate || returnDate) && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">Your Search Parameters:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pickupLocation && (
              <div>
                <span className="text-gray-600">Location:</span> {pickupLocation}
              </div>
            )}
            {pickupDate && (
              <div>
                <span className="text-gray-600">Pickup Date:</span> {new Date(pickupDate).toLocaleDateString()}
              </div>
            )}
            {returnDate && (
              <div>
                <span className="text-gray-600">Return Date:</span> {new Date(returnDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowFilters(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Range Filter */}
            <div>
              <h4 className="font-medium mb-2">Price Range ($/day)</h4>
              <div className="flex items-center gap-4">
                <span>${priceRange[0]}</span>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <span>${priceRange[1]}</span>
              </div>
            </div>
            
            {/* Transmission Filter */}
            <div>
              <h4 className="font-medium mb-2">Transmission</h4>
              <div className="flex flex-wrap gap-2">
                {transmissionTypes.map((transmission) => (
                  transmission && (
                    <button
                      key={transmission}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTransmission.includes(transmission)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => toggleTransmission(transmission)}
                    >
                      {transmission}
                    </button>
                  )
                ))}
              </div>
            </div>
            
            {/* Fuel Type Filter */}
            <div>
              <h4 className="font-medium mb-2">Fuel Type</h4>
              <div className="flex flex-wrap gap-2">
                {fuelTypes.map((fuel) => (
                  fuel && (
                    <button
                      key={fuel}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedFuel.includes(fuel)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => toggleFuel(fuel)}
                    >
                      {fuel}
                    </button>
                  )
                ))}
              </div>
            </div>
          </div>
          
          <button
            className="mt-6 px-4 py-2 text-gray-600 hover:text-gray-800"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      )}
      
      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCars.map((car) => (
          <VehicleCard
            key={car.id}
            vehicle={car}
            bookingData={{
              location: pickupLocation,
              startDate: pickupDate,
              endDate: returnDate
            }}
          />
        ))}
      </div>
      
      {filteredCars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No cars found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Cars; 