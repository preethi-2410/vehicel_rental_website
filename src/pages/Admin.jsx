import React, { useState, useEffect } from 'react';
import { seedVehicles } from '../firebase/seed';
import { removeDuplicateVehicles } from '../firebase/cleanup';
import { addNewVehicles } from '../firebase/addVehicles';
import { createBooking } from '../firebase/bookings';
import { getAvailableVehicles } from '../firebase/vehicles';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaCar, FaCalendarAlt, FaUsers, FaDatabase, FaChartLine } from 'react-icons/fa';
import { collection, addDoc, Timestamp, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Import admin components
import DashboardOverview from '../components/admin/DashboardOverview';
import VehiclesManagement from '../components/admin/VehiclesManagement';
import BookingsManagement from '../components/admin/BookingsManagement';
import UsersManagement from '../components/admin/UsersManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';

// Database Management Tab
const DatabaseManagementTab = ({ loading, setLoading, message, setMessage, vehicles }) => {
  const { user } = useAuth();

  const handleSeedVehicles = async () => {
    try {
      setLoading(true);
      setMessage('Seeding vehicles...');
      await seedVehicles();
      setMessage('Successfully seeded vehicles!');
    } catch (error) {
      console.error('Error seeding vehicles:', error);
      setMessage('Error seeding vehicles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupVehicles = async () => {
    try {
      setLoading(true);
      setMessage('Cleaning up duplicate vehicles...');
      const result = await removeDuplicateVehicles();
      setMessage(
        `Cleanup completed! Removed ${result.duplicatesRemoved} duplicates. ` +
        `(Total: ${result.totalVehicles}, Remaining: ${result.remainingVehicles})`
      );
    } catch (error) {
      console.error('Error cleaning up vehicles:', error);
      setMessage('Error cleaning up vehicles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewVehicles = async () => {
    try {
      setLoading(true);
      setMessage('Adding new vehicles...');
      const addedVehicles = await addNewVehicles();
      setMessage(
        `Successfully added ${addedVehicles.length} new vehicles!\n` +
        addedVehicles.map(v => `- ${v.name} (ID: ${v.id})`).join('\n')
      );
    } catch (error) {
      console.error('Error adding new vehicles:', error);
      setMessage('Error adding new vehicles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestBooking = async () => {
    if (!user) {
      setMessage('You must be logged in to create a test booking');
      return;
    }

    if (vehicles.length === 0) {
      setMessage('No vehicles available for booking. Please seed vehicles first.');
      return;
    }

    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    setLoading(true);
    setMessage(`Creating test booking for vehicle: ${randomVehicle.name}...`);

    try {
      // Set booking start date to tomorrow
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(12, 0, 0, 0);

      // Set booking end date to 6 hours after start
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 6);

      // Calculate total price (6 hours rental)
      const totalPrice = randomVehicle.hourlyRate ? randomVehicle.hourlyRate * 6 : 300;

      const bookingData = {
        userId: user.uid,
        vehicleId: randomVehicle.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice,
        customerDetails: {
          firstName: user.displayName ? user.displayName.split(' ')[0] : 'Test',
          lastName: user.displayName ? user.displayName.split(' ')[1] || 'User' : 'User',
          email: user.email,
          phone: user.phone || '1234567890'
        }
      };

      const bookingId = await createBooking(bookingData);
      setMessage(`Test booking created successfully! Booking ID: ${bookingId}\nVehicle: ${randomVehicle.name}\nDate: ${startDate.toLocaleDateString()} (${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()})`);
    } catch (error) {
      console.error('Error creating test booking:', error);
      setMessage('Error creating test booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateTestData = async () => {
    try {
      setLoading(true);
      setMessage('Generating test data for analytics...');
      
      // Generate some test vehicles
      const vehicleTypes = ['Car', 'Bike', 'SUV', 'Truck'];
      const vehicleNames = {
        Car: ['Honda Civic', 'Toyota Corolla', 'Nissan Altima', 'Ford Focus', 'Hyundai Elantra'],
        Bike: ['Honda CBR', 'Yamaha R15', 'Kawasaki Ninja', 'Harley Davidson Street', 'Royal Enfield'],
        SUV: ['Toyota RAV4', 'Honda CR-V', 'Ford Explorer', 'Jeep Cherokee', 'Nissan Rogue'],
        Truck: ['Ford F-150', 'Chevy Silverado', 'Ram 1500', 'Toyota Tundra', 'GMC Sierra']
      };
      
      // First, create vehicles
      const createdVehicles = [];
      for (let i = 0; i < 12; i++) {
        const type = vehicleTypes[i % vehicleTypes.length];
        const typeNames = vehicleNames[type];
        const name = typeNames[Math.floor(Math.random() * typeNames.length)];
        
        const vehicleData = {
          name: `${name} (Test)`,
          type,
          pricePerDay: 50 + (i * 10),
          available: true,
          imageUrl: 'https://via.placeholder.com/400x200',
          description: `A ${type.toLowerCase()} suitable for all your travel needs.`
        };
        
        const vehicleDoc = await addDoc(collection(db, 'vehicles'), vehicleData);
        createdVehicles.push({ id: vehicleDoc.id, ...vehicleData });
      }
      
      setMessage(`Created ${createdVehicles.length} test vehicles. Now creating bookings...`);
      
      // Generate bookings
      const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      const paymentStatuses = ['pending', 'paid', 'refunded'];
      const userNames = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Maria Garcia', 'Sam Wilson'];
      
      // Get date range for the last 6 months
      const now = new Date();
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 6);
      
      let bookingsCreated = 0;
      
      // Create 50 bookings
      for (let i = 0; i < 50; i++) {
        // Create a random date between startDate and now
        const randomTime = startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime());
        const bookingDate = new Date(randomTime);
        
        // End date is 1-7 days after booking date
        const endDate = new Date(bookingDate);
        endDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 7) + 1);
        
        // Vehicle for this booking
        const vehicle = createdVehicles[Math.floor(Math.random() * createdVehicles.length)];
        
        // Calculate total price
        const days = Math.ceil((endDate - bookingDate) / (1000 * 60 * 60 * 24));
        const totalPrice = vehicle.pricePerDay * days;
        
        // Random status and payment status
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        // More likely to be paid if confirmed or completed
        let paymentStatus;
        if (status === 'confirmed' || status === 'completed') {
          paymentStatus = Math.random() > 0.2 ? 'paid' : 'pending';
        } else {
          paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
        }
        
        const userName = userNames[Math.floor(Math.random() * userNames.length)];
        
        const bookingData = {
          vehicleId: vehicle.id,
          userId: `user${Math.floor(Math.random() * 10) + 1}`,
          userName,
          startDate: Timestamp.fromDate(bookingDate),
          endDate: Timestamp.fromDate(endDate),
          totalPrice,
          totalAmount: totalPrice, // For compatibility
          status,
          paymentStatus,
          createdAt: Timestamp.fromDate(new Date(bookingDate.getTime() - 86400000 * Math.floor(Math.random() * 10))),
          updatedAt: Timestamp.fromDate(new Date())
        };
        
        await addDoc(collection(db, 'bookings'), bookingData);
        bookingsCreated++;
        
        // Update message every 10 bookings
        if (bookingsCreated % 10 === 0) {
          setMessage(`Created ${bookingsCreated} bookings so far...`);
        }
      }
      
      setMessage(
        `Successfully generated test data for analytics!\n` +
        `- Created ${createdVehicles.length} vehicles\n` +
        `- Created ${bookingsCreated} bookings\n\n` +
        `Go to the Analytics tab to see your data.`
      );
    } catch (error) {
      console.error('Error generating test data:', error);
      setMessage('Error generating test data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeTestBookings = async () => {
    try {
      setLoading(true);
      setMessage('Searching for test bookings...');

      // Find all bookings where userName contains "Test" or vehicle name contains "Test"
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter out test bookings by username or other criteria
      const testBookings = bookings.filter(booking => {
        // Check username
        if (booking.userName && booking.userName.includes('Test')) return true;
        
        // Check if vehicle name has "Test" in it
        if (booking.vehicleName && booking.vehicleName.includes('Test')) return true;
        
        // Check if created via the generateTestData function
        if (booking.userName && ['John Doe', 'Jane Smith', 'Alex Johnson', 'Maria Garcia', 'Sam Wilson'].includes(booking.userName)) return true;
        
        return false;
      });

      if (testBookings.length === 0) {
        setMessage('No test bookings found in the database.');
        setLoading(false);
        return;
      }

      setMessage(`Found ${testBookings.length} test bookings. Deleting...`);

      // Delete each test booking
      let deletedCount = 0;
      for (const booking of testBookings) {
        await deleteDoc(doc(db, 'bookings', booking.id));
        deletedCount++;
        
        // Update message every 5 deletions
        if (deletedCount % 5 === 0) {
          setMessage(`Deleted ${deletedCount} of ${testBookings.length} test bookings...`);
        }
      }

      setMessage(`Successfully removed ${deletedCount} test bookings from the database.`);
    } catch (error) {
      console.error('Error removing test bookings:', error);
      setMessage('Error removing test bookings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeTestVehicles = async () => {
    try {
      setLoading(true);
      setMessage('Searching for test vehicles...');

      // Find all vehicles where name contains "Test"
      const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
      const vehicles = vehiclesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter out test vehicles
      const testVehicles = vehicles.filter(vehicle => {
        // Check if vehicle name has "Test" in it
        if (vehicle.name && vehicle.name.includes('Test')) return true;
        
        // Check if description mentions test
        if (vehicle.description && vehicle.description.includes('test')) return true;
        
        return false;
      });

      if (testVehicles.length === 0) {
        setMessage('No test vehicles found in the database.');
        setLoading(false);
        return;
      }

      setMessage(`Found ${testVehicles.length} test vehicles. Deleting...`);

      // Check if any of these vehicles have bookings
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Count bookings per vehicle
      const bookingsPerVehicle = {};
      for (const booking of bookings) {
        if (booking.vehicleId) {
          bookingsPerVehicle[booking.vehicleId] = (bookingsPerVehicle[booking.vehicleId] || 0) + 1;
        }
      }

      // Delete test vehicles that don't have bookings first
      let deletedCount = 0;
      for (const vehicle of testVehicles) {
        if (!bookingsPerVehicle[vehicle.id]) {
          await deleteDoc(doc(db, 'vehicles', vehicle.id));
          deletedCount++;
          
          if (deletedCount % 5 === 0) {
            setMessage(`Deleted ${deletedCount} of ${testVehicles.length} test vehicles...`);
          }
        }
      }

      // If there are vehicles with bookings, warn the user
      const vehiclesWithBookings = testVehicles.filter(v => bookingsPerVehicle[v.id]);
      
      if (vehiclesWithBookings.length > 0) {
        setMessage(`Successfully removed ${deletedCount} test vehicles from the database.\n\nWARNING: ${vehiclesWithBookings.length} test vehicles were not removed because they have bookings. Use the 'Remove Test Bookings' function first, then try again.`);
      } else {
        setMessage(`Successfully removed ${deletedCount} test vehicles from the database.`);
      }
    } catch (error) {
      console.error('Error removing test vehicles:', error);
      setMessage('Error removing test vehicles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const advancedCleanup = async () => {
    try {
      setLoading(true);
      setMessage('Starting advanced cleanup to remove all test data...');

      // Step 1: Identify and remove test bookings
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create a more comprehensive test detection
      const testBookings = bookings.filter(booking => {
        // Check direct indicators in names, etc.
        if (booking.userName && (booking.userName.toLowerCase().includes('test') || 
                                booking.userName.toLowerCase().includes('user') ||
                                ['John Doe', 'Jane Smith', 'Alex Johnson', 'Maria Garcia', 'Sam Wilson'].includes(booking.userName))) {
          return true;
        }
        
        // Check for placeholder or test emails
        if (booking.customerDetails && booking.customerDetails.email &&
           (booking.customerDetails.email.includes('test') || 
            booking.customerDetails.email.includes('example.com') ||
            booking.customerDetails.email.includes('user'))) {
          return true;
        }
        
        // Check for placeholder phone numbers
        if (booking.customerDetails && booking.customerDetails.phone &&
           (booking.customerDetails.phone === '1234567890' || 
            booking.customerDetails.phone === '0000000000')) {
          return true;
        }
        
        return false;
      });

      // Delete identified test bookings
      let deletedBookingsCount = 0;
      for (const booking of testBookings) {
        await deleteDoc(doc(db, 'bookings', booking.id));
        deletedBookingsCount++;
        
        if (deletedBookingsCount % 5 === 0) {
          setMessage(`Deleted ${deletedBookingsCount} test bookings...`);
        }
      }

      // Step 2: Identify and remove test vehicles
      const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
      const vehicles = vehiclesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get all remaining bookings after cleanup
      const remainingBookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const remainingBookings = remainingBookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Collect vehicle IDs that are still referenced in bookings
      const usedVehicleIds = new Set();
      for (const booking of remainingBookings) {
        if (booking.vehicleId) {
          usedVehicleIds.add(booking.vehicleId);
        }
      }

      // Filter test vehicles - only those not referenced in any remaining booking
      const testVehicles = vehicles.filter(vehicle => {
        if (usedVehicleIds.has(vehicle.id)) {
          return false; // Skip if it's used in a real booking
        }
        
        // Check for test indicators
        if (vehicle.name && (vehicle.name.toLowerCase().includes('test') || 
                            vehicle.name.includes('(Test)'))) {
          return true;
        }
        
        // Check for placeholder descriptions
        if (vehicle.description && (vehicle.description.toLowerCase().includes('test') ||
                                   vehicle.description.includes('travel needs'))) {
          return true;
        }
        
        // Check for placeholder images
        if (vehicle.imageUrl && vehicle.imageUrl.includes('placeholder')) {
          return true;
        }
        
        return false;
      });

      // Delete test vehicles
      let deletedVehiclesCount = 0;
      for (const vehicle of testVehicles) {
        await deleteDoc(doc(db, 'vehicles', vehicle.id));
        deletedVehiclesCount++;
        
        if (deletedVehiclesCount % 5 === 0) {
          setMessage(`Deleted ${deletedVehiclesCount} test vehicles...`);
        }
      }

      // Create a success message with the cleanup summary
      let summary = `Advanced Cleanup Complete!\n\n`;
      summary += `- Removed ${deletedBookingsCount} test bookings\n`;
      summary += `- Removed ${deletedVehiclesCount} test vehicles\n`;
      
      // Add recommendations if needed
      if (deletedBookingsCount === 0 && deletedVehiclesCount === 0) {
        summary += `\nNo test data was found to remove. Your database appears to be clean.`;
      } else {
        summary += `\nPlease refresh the Analytics tab to see the changes reflected.`;
      }
      
      setMessage(summary);
    } catch (error) {
      console.error('Error during advanced cleanup:', error);
      setMessage('Error during advanced cleanup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Database Management</h2>
      
      {/* Vehicle Management Section */}
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2 text-gray-700">Vehicle Management</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSeedVehicles}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            {loading ? 'Processing...' : 'Seed Vehicles'}
          </button>
          <button
            onClick={handleCleanupVehicles}
            disabled={loading}
            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 text-sm"
          >
            {loading ? 'Processing...' : 'Remove Duplicates'}
          </button>
          <button
            onClick={handleAddNewVehicles}
            disabled={loading}
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
          >
            {loading ? 'Processing...' : 'Add New Vehicles'}
          </button>
        </div>
      </div>
      
      {/* Test Data Section */}
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2 text-gray-700">Test Data</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCreateTestBooking}
            disabled={loading}
            className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm"
          >
            {loading ? 'Processing...' : 'Create Test Booking'}
          </button>
          <button
            onClick={removeTestBookings}
            disabled={loading}
            className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400 text-sm"
          >
            {loading ? 'Processing...' : 'Remove Test Bookings'}
          </button>
          <button
            onClick={removeTestVehicles}
            disabled={loading}
            className="bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 disabled:bg-gray-400 text-sm"
          >
            {loading ? 'Processing...' : 'Remove Test Vehicles'}
          </button>
          <button
            onClick={advancedCleanup}
            disabled={loading}
            className="bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-900 disabled:bg-gray-400 text-sm"
          >
            {loading ? 'Processing...' : 'Advanced Cleanup'}
          </button>
        </div>
      </div>
      
      {message && (
        <pre className={`mt-4 p-4 rounded bg-gray-50 whitespace-pre-wrap ${
          message.includes('Error') ? 'text-red-600' : 'text-green-600'
        }`}>
          {message}
        </pre>
      )}
    </div>
  );
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Load a few vehicles for the test booking function
    const loadVehicles = async () => {
      try {
        const availableVehicles = await getAvailableVehicles();
        console.log('Available vehicles for test booking:', availableVehicles);
        setVehicles(availableVehicles.slice(0, 5)); // Just take the first 5
      } catch (error) {
        console.error('Error loading vehicles for test booking:', error);
      }
    };
    
    loadVehicles();
  }, []);
  
  // If user is not admin, display an error message
  if (!isAdmin()) {
    return (
      <div className="container py-12">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <h1 className="text-xl font-bold">Access Denied</h1>
          <p>You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const tabContent = {
    dashboard: (
      <>
        <DashboardOverview />
        <DatabaseManagementTab 
          loading={loading} 
          setLoading={setLoading} 
          message={message} 
          setMessage={setMessage} 
          vehicles={vehicles} 
        />
      </>
    ),
    vehicles: <VehiclesManagement />,
    bookings: <BookingsManagement />,
    users: <UsersManagement />,
    analytics: <AnalyticsDashboard />
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="flex flex-wrap border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center py-2 px-4 border-b-2 ${
            activeTab === 'dashboard'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          <FaHome className="mr-2" /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`flex items-center py-2 px-4 border-b-2 ${
            activeTab === 'vehicles'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          <FaCar className="mr-2" /> Vehicles
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center py-2 px-4 border-b-2 ${
            activeTab === 'bookings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          <FaCalendarAlt className="mr-2" /> Bookings
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center py-2 px-4 border-b-2 ${
            activeTab === 'users'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          <FaUsers className="mr-2" /> Users
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center py-2 px-4 border-b-2 ${
            activeTab === 'analytics'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          <FaChartLine className="mr-2" /> Analytics
        </button>
      </div>
      
      {tabContent[activeTab]}
    </div>
  );
};

export default Admin; 