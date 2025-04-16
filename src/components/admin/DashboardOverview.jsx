import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaCar, FaUsers, FaMoneyBillWave, FaCalendarCheck, FaCreditCard, FaChartLine } from 'react-icons/fa';
import { FaMotorcycle } from 'react-icons/fa6';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalCars: 0,
    totalBikes: 0,
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    paidBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get vehicles stats
        const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
        const vehicles = vehiclesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const totalVehicles = vehicles.length;
        const totalCars = vehicles.filter(v => v.type === 'car').length;
        const totalBikes = vehicles.filter(v => v.type === 'bike').length;
        
        // Get users stats
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;
        
        // Get bookings stats
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        const bookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const totalBookings = bookings.length;
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        const paidBookings = bookings.filter(b => b.paymentStatus === 'paid').length;
        
        // Calculate total revenue from paid bookings
        const totalRevenue = bookings
          .filter(booking => booking.paymentStatus === 'paid')
          .reduce((total, booking) => total + (booking.totalPrice || 0), 0);
        
        // Get recent bookings
        const recentBookingsQuery = query(
          collection(db, 'bookings'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
        const recentBookingsData = recentBookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch vehicle info for each booking
        const recentBookingsWithVehicle = await Promise.all(
          recentBookingsData.map(async (booking) => {
            try {
              const vehicleDoc = await getDocs(
                query(collection(db, 'vehicles'), where('id', '==', booking.vehicleId))
              );
              
              let vehicleName = 'Unknown Vehicle';
              if (!vehicleDoc.empty) {
                vehicleName = vehicleDoc.docs[0].data().name;
              }
              
              return {
                ...booking,
                vehicleName
              };
            } catch (err) {
              console.error('Error fetching vehicle for booking:', err);
              return {
                ...booking,
                vehicleName: 'Unknown Vehicle'
              };
            }
          })
        );
        
        setRecentBookings(recentBookingsWithVehicle);
        
        setStats({
          totalVehicles,
          totalCars,
          totalBikes,
          totalUsers,
          totalBookings,
          pendingBookings,
          completedBookings,
          totalRevenue,
          paidBookings
        });
      } catch (err) {
        setError('Failed to load dashboard data: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-full p-3">
              <FaCar className="text-2xl text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Cars</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalCars}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-full p-3">
              <FaMotorcycle className="text-2xl text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bikes</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalBikes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 rounded-full p-3">
              <FaUsers className="text-2xl text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 rounded-full p-3">
              <FaCalendarCheck className="text-2xl text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalBookings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 rounded-full p-3">
              <FaCalendarCheck className="text-2xl text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-teal-50 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-teal-100 rounded-full p-3">
              <FaCalendarCheck className="text-2xl text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{stats.completedBookings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 rounded-full p-3">
              <FaCreditCard className="text-2xl text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{stats.paidBookings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-pink-50 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-pink-100 rounded-full p-3">
              <FaMoneyBillWave className="text-2xl text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analytics Info Card */}
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-full">
            <FaChartLine className="text-2xl text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Analytics Dashboard Available</h3>
            <p className="mb-4">View detailed analytics about your vehicle rentals, bookings, and revenue.</p>
            <div className="flex flex-col space-y-2 text-sm">
              <p>To get started with analytics:</p>
              <ol className="list-decimal list-inside pl-2 space-y-1">
                <li>Click on the 'Analytics' tab above</li>
                <li>Add vehicles and make bookings to see stats</li>
                <li>Use the time filters to analyze different periods</li>
                <li>Export your reports as CSV or print them</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.vehicleName || 'Unknown Vehicle'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.customerDetails?.firstName} {booking.customerDetails?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : booking.status === 'completed'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No recent bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 