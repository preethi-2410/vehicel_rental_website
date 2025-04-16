import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import { getAvailableVehicles } from '../firebase/vehicles';

const Bikes = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedEngineSize, setSelectedEngineSize] = useState([]);
  const [pickupLocation, setPickupLocation] = useState(queryParams.get('location') || '');
  const [pickupDate, setPickupDate] = useState(queryParams.get('start') || '');
  const [returnDate, setReturnDate] = useState(queryParams.get('end') || '');

  // Fetch bikes from Firestore
  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        const vehiclesData = await getAvailableVehicles('bike');
        console.log('Fetched bikes:', vehiclesData);
        
        // Remove duplicates based on vehicle name
        const uniqueVehicles = Array.from(
          new Map(vehiclesData.map(item => [item.name, item])).values()
        );
        
        setBikes(uniqueVehicles);
      } catch (err) {
        console.error('Error fetching bikes:', err);
        setError('Failed to load bikes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, []);

  // Get unique engine sizes
  const engineSizes = Array.from(new Set(bikes.map(bike => bike.engineSize)));

  // Effect to handle URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setPickupLocation(params.get('location') || '');
    setPickupDate(params.get('start') || '');
    setReturnDate(params.get('end') || '');
    
    // If location is provided in the URL, use it as the search term
    if (params.get('location')) {
      setSearchTerm(params.get('location') || '');
    }
  }, [location.search]);

  const toggleEngineSize = (engineSize) => {
    if (engineSize && selectedEngineSize.includes(engineSize)) {
      setSelectedEngineSize(selectedEngineSize.filter(size => size !== engineSize));
    } else if (engineSize) {
      setSelectedEngineSize([...selectedEngineSize, engineSize]);
    }
  };

  const resetFilters = () => {
    setPriceRange([0, 100]);
    setSelectedEngineSize([]);
    setSearchTerm('');
  };

  const filteredBikes = bikes.filter(bike => {
    // Filter by search term
    const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (pickupLocation && pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by price range (using hourlyRate instead of price)
    const matchesPrice = bike.hourlyRate >= priceRange[0] && bike.hourlyRate <= priceRange[1];
    
    // Filter by engine size
    const matchesEngineSize = selectedEngineSize.length === 0 || 
      (bike.engineSize && selectedEngineSize.includes(bike.engineSize));
    
    return matchesSearch && matchesPrice && matchesEngineSize;
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
        <h1 className="text-3xl font-bold mb-4">Rent a Bike in India</h1>
        <p className="text-gray-600 max-w-3xl">
          Explore our collection of motorcycles and bikes for your next adventure across India. From cruisers to sport bikes, we have the perfect ride for you at locations throughout the country.
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
            placeholder="Search bikes..."
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Range Filter */}
            <div>
              <h4 className="font-medium mb-2">Price Range ($/day)</h4>
              <div className="flex items-center gap-4">
                <span>${priceRange[0]}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <span>${priceRange[1]}</span>
              </div>
            </div>
            
            {/* Engine Size Filter */}
            <div>
              <h4 className="font-medium mb-2">Engine Size</h4>
              <div className="flex flex-wrap gap-2">
                {engineSizes.map((engineSize) => (
                  engineSize && (
                    <button
                      key={engineSize}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedEngineSize.includes(engineSize)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => toggleEngineSize(engineSize)}
                    >
                      {engineSize}
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
      
      {/* Bikes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBikes.map((bike) => (
          <VehicleCard
            key={bike.id}
            vehicle={bike}
            bookingData={{
              location: pickupLocation,
              startDate: pickupDate,
              endDate: returnDate
            }}
          />
        ))}
      </div>
      
      {filteredBikes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No bikes found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Bikes; 