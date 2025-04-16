import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaGasPump, FaUsers, FaCog, FaStar, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { getVehicleById } from '../firebase/vehicles';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';

const VehicleDetails = () => {
  const { id } = useParams();
  console.log('VehicleDetails - Component mounted');
  console.log('VehicleDetails - URL params:', useParams());
  console.log('VehicleDetails - Received ID from params:', id);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Helper function to format datetime for input
  const formatDatetimeLocal = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  // Get current datetime in local format
  const now = formatDatetimeLocal(new Date());

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        console.log('VehicleDetails - Starting to fetch vehicle with ID:', id);
        setLoading(true);
        const vehicleData = await getVehicleById(id);
        console.log('VehicleDetails - Raw vehicle data from Firebase:', vehicleData);
        
        if (!vehicleData) {
          console.log('VehicleDetails - No vehicle found for ID:', id);
          setError('Vehicle not found');
          return;
        }
        
        console.log('VehicleDetails - Setting vehicle data in state:', vehicleData);
        setVehicle(vehicleData);
      } catch (err) {
        console.error('VehicleDetails - Error fetching vehicle:', err);
        console.error('VehicleDetails - Error details:', {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        setError('Failed to load vehicle details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      console.log('VehicleDetails - ID exists, calling fetchVehicle');
      fetchVehicle();
    } else {
      console.error('VehicleDetails - No ID provided in URL params');
      setError('No vehicle ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate < now) {
      return; // Don't allow past dates
    }
    setStartDate(selectedDate);
    // Clear end date if it's before new start date
    if (endDate && endDate < selectedDate) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate < startDate) {
      return; // Don't allow end date before start date
    }
    setEndDate(selectedDate);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Vehicle Not Found</h2>
        <p className="mb-8">The vehicle you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          Back to Home
        </Link>
      </div>
    );
  }
  
  const { name, type, image, hourlyRate, rating, seats, transmission, fuel, engineSize } = vehicle;
  
  const handleBooking = (e) => {
    e.preventDefault();
    
    if (startDate && endDate) {
      navigate(`/booking/${vehicle.id}?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
    }
  };
  
  return (
    <>
      <div className="container py-12">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <FaArrowLeft className="mr-2" /> Back to {type === 'car' ? 'Cars' : 'Bikes'}
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Vehicle Image */}
            <div className="md:w-1/2">
              <img 
                src={image} 
                alt={name} 
                className="w-full h-full object-cover"
                style={{ maxHeight: '500px' }}
              />
            </div>
            
            {/* Vehicle Details */}
            <div className="md:w-1/2 p-6 md:p-8">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">{name}</h1>
                <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                  <FaStar className="text-yellow-500 mr-1" />
                  <span className="font-medium">{rating?.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <span className="text-2xl font-bold text-blue-600">₹{hourlyRate}</span>
                <span className="text-gray-500">/hour</span>
              </div>
              
              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {type === 'car' && (
                    <>
                      {seats && (
                        <div className="flex items-center">
                          <FaUsers className="text-gray-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Seats</p>
                            <p className="font-medium">{seats} People</p>
                          </div>
                        </div>
                      )}
                      {transmission && (
                        <div className="flex items-center">
                          <FaCog className="text-gray-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Transmission</p>
                            <p className="font-medium">{transmission}</p>
                          </div>
                        </div>
                      )}
                      {fuel && (
                        <div className="flex items-center">
                          <FaGasPump className="text-gray-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Fuel Type</p>
                            <p className="font-medium">{fuel}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {type === 'bike' && engineSize && (
                    <div className="flex items-center">
                      <FaCog className="text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Engine Size</p>
                        <p className="font-medium">{engineSize}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-600">
                  {type === 'car' 
                    ? `The ${name} is a comfortable and reliable car, perfect for your journey. It features a smooth ${transmission?.toLowerCase()} transmission and runs on ${fuel?.toLowerCase()} fuel. With seating for ${seats} people, it's ideal for family trips or group outings.`
                    : `The ${name} is a powerful and agile motorcycle with a ${engineSize} engine. It offers an exhilarating riding experience with responsive handling and impressive performance. Perfect for both city commuting and weekend adventures.`
                  }
                </p>
              </div>
              
              <form onSubmit={handleBooking} className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold mb-4">Book this {type}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="start-date" className="block text-gray-700 mb-2">
                      Start Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="datetime-local"
                        id="start-date"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={startDate}
                        onChange={handleStartDateChange}
                        min={now}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="end-date" className="block text-gray-700 mb-2">
                      End Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="datetime-local"
                        id="end-date"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={endDate}
                        onChange={handleEndDateChange}
                        min={startDate || now}
                        required
                        disabled={!startDate}
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                  disabled={!startDate || !endDate}
                >
                  Book Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default VehicleDetails; 