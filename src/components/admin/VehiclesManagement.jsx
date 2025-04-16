import React, { useState, useEffect } from 'react';
import { 
  getAllVehicles, 
  addVehicle, 
  updateVehicle, 
  deleteVehicle 
} from '../../firebase/vehicles';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';

const VehiclesManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: 'car',
    image: '',
    price: 0,
    hourlyRate: 0,
    rating: 4.0,
    engineSize: '',
    availabilityStatus: true
  });

  // Load all vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await getAllVehicles();
        setVehicles(data);
      } catch (err) {
        setError('Failed to load vehicles: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Handle the add vehicle form submission
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const vehicleId = await addVehicle(newVehicle);
      setVehicles(prev => [...prev, { id: vehicleId, ...newVehicle }]);
      setShowAddModal(false);
      setNewVehicle({
        name: '',
        type: 'car',
        image: '',
        price: 0,
        hourlyRate: 0,
        rating: 4.0,
        engineSize: '',
        availabilityStatus: true
      });
    } catch (err) {
      setError('Failed to add vehicle: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a vehicle
  const handleEditVehicle = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateVehicle(currentVehicle.id, currentVehicle);
      setVehicles(prev => 
        prev.map(vehicle => 
          vehicle.id === currentVehicle.id ? currentVehicle : vehicle
        )
      );
      setShowEditModal(false);
    } catch (err) {
      setError('Failed to update vehicle: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a vehicle
  const handleDeleteVehicle = async () => {
    try {
      setLoading(true);
      await deleteVehicle(currentVehicle.id);
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== currentVehicle.id));
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete vehicle: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter vehicles by type and search term
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesType = filterType === 'all' || vehicle.type === filterType;
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <h2 className="text-xl font-semibold">Vehicles Management</h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All Types</option>
            <option value="car">Cars</option>
            <option value="bike">Bikes</option>
          </select>
          
          {/* Add button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <FaPlus className="mr-2" /> Add Vehicle
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Vehicles Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hourly Rate
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name}
                    className="h-12 w-20 object-cover rounded-md"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{vehicle.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {vehicle.type === 'car' ? 'Car' : 'Bike'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{vehicle.hourlyRate?.toFixed(2) || (vehicle.price / 24).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    vehicle.availabilityStatus 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.availabilityStatus ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => {
                      setCurrentVehicle(vehicle);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentVehicle(vehicle);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add New Vehicle</h2>
            <form onSubmit={handleAddVehicle}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Type
                </label>
                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={newVehicle.image}
                  onChange={(e) => setNewVehicle({...newVehicle, image: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Hourly Rate (₹)
                </label>
                <input
                  type="number"
                  value={newVehicle.hourlyRate}
                  onChange={(e) => setNewVehicle({...newVehicle, hourlyRate: parseFloat(e.target.value)})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  value={newVehicle.rating}
                  onChange={(e) => setNewVehicle({...newVehicle, rating: parseFloat(e.target.value)})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {newVehicle.type === 'car' ? 'Engine Capacity' : 'Engine Size'}
                </label>
                <input
                  type="text"
                  value={newVehicle.engineSize}
                  onChange={(e) => setNewVehicle({...newVehicle, engineSize: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={newVehicle.type === 'car' ? 'e.g. 2.0L' : 'e.g. 150cc'}
                />
              </div>
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  checked={newVehicle.availabilityStatus}
                  onChange={(e) => setNewVehicle({...newVehicle, availabilityStatus: e.target.checked})}
                  className="mr-2"
                />
                <label className="block text-gray-700 text-sm font-bold">
                  Available for Booking
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && currentVehicle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Vehicle</h2>
            <form onSubmit={handleEditVehicle}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  value={currentVehicle.name}
                  onChange={(e) => setCurrentVehicle({...currentVehicle, name: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Type
                </label>
                <select
                  value={currentVehicle.type}
                  onChange={(e) => setCurrentVehicle({...currentVehicle, type: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={currentVehicle.image}
                  onChange={(e) => setCurrentVehicle({...currentVehicle, image: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Hourly Rate (₹)
                </label>
                <input
                  type="number"
                  value={currentVehicle.hourlyRate}
                  onChange={(e) => setCurrentVehicle({...currentVehicle, hourlyRate: parseFloat(e.target.value)})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  value={currentVehicle.rating}
                  onChange={(e) => setCurrentVehicle({...currentVehicle, rating: parseFloat(e.target.value)})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {currentVehicle.type === 'car' ? 'Engine Capacity' : 'Engine Size'}
                </label>
                <input
                  type="text"
                  value={currentVehicle.engineSize}
                  onChange={(e) => setCurrentVehicle({...currentVehicle, engineSize: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={currentVehicle.type === 'car' ? 'e.g. 2.0L' : 'e.g. 150cc'}
                />
              </div>
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  checked={currentVehicle.availabilityStatus}
                  onChange={(e) => setCurrentVehicle({...currentVehicle, availabilityStatus: e.target.checked})}
                  className="mr-2"
                />
                <label className="block text-gray-700 text-sm font-bold">
                  Available for Booking
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentVehicle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete the vehicle "{currentVehicle.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesManagement; 