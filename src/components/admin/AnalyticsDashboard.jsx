import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, getDocs, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { FaCalendarAlt, FaChartLine, FaCarAlt, FaMotorcycle, FaMoneyBillWave, FaPrint, FaFileExcel, FaFileExport } from 'react-icons/fa';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AnalyticsDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportMessage, setExportMessage] = useState('');
  const printRef = useRef();

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  // Function to export data to CSV
  const handleCsvExport = () => {
    try {
      setExportMessage('Preparing CSV export...');
      
      if (bookings.length === 0) {
        setExportMessage('No booking data available to export');
        setTimeout(() => setExportMessage(''), 3000);
        return;
      }
      
      // Create a more comprehensive data set for the export
      // First, prepare time period for the filename
      const period = timeRange === 'week' ? 'weekly' : timeRange === 'month' ? 'monthly' : 'yearly';
      
      // Create proper headers for CSV
      const csvData = [
        // Headers
        ['Booking ID', 'Customer', 'Vehicle', 'Vehicle Type', 'Start Date', 'End Date', 'Duration (Days)', 'Status', 'Payment Status', 'Amount'],
      ];
      
      // Add each booking as a row with complete information
      bookings.forEach(booking => {
        // Find vehicle details
        const vehicle = vehicles.find(v => v.id === booking.vehicleId) || {};
        
        // Simple date formatting without using format function
        let startDateStr = 'N/A';
        let endDateStr = 'N/A';
        let duration = 0;
        
        // Handle start date
        if (booking.startDate) {
          let startDate;
          if (booking.startDate instanceof Timestamp) {
            startDate = booking.startDate.toDate();
          } else if (booking.startDate instanceof Date) {
            startDate = booking.startDate;
          } else if (typeof booking.startDate === 'string') {
            startDate = new Date(booking.startDate);
          } else if (booking.startDate.seconds) {
            startDate = new Date(booking.startDate.seconds * 1000);
          } else if (booking.startDate.toDate && typeof booking.startDate.toDate === 'function') {
            startDate = booking.startDate.toDate();
          }
          
          if (startDate && !isNaN(startDate.getTime())) {
            startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          }
          
          // Handle end date
          let endDate;
          if (booking.endDate) {
            if (booking.endDate instanceof Timestamp) {
              endDate = booking.endDate.toDate();
            } else if (booking.endDate instanceof Date) {
              endDate = booking.endDate;
            } else if (typeof booking.endDate === 'string') {
              endDate = new Date(booking.endDate);
            } else if (booking.endDate.seconds) {
              endDate = new Date(booking.endDate.seconds * 1000);
            } else if (booking.endDate.toDate && typeof booking.endDate.toDate === 'function') {
              endDate = booking.endDate.toDate();
            }
            
            if (endDate && !isNaN(endDate.getTime())) {
              endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD format
              
              // Calculate duration
              if (startDate && !isNaN(startDate.getTime())) {
                const diffTime = Math.abs(endDate - startDate);
                duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // Minimum 1 day for same-day bookings
                if (duration === 0) {
                  duration = 1;
                }
              }
            }
          }
        }
        
        // Get the proper amount
        let amount = 0;
        if (typeof booking.totalAmount === 'number') {
          amount = booking.totalAmount;
        } else if (typeof booking.totalPrice === 'number') {
          amount = booking.totalPrice;
        } else if (typeof booking.amount === 'number') {
          amount = booking.amount;
        }
        
        // Add row to CSV data
        csvData.push([
          booking.id || '',
          booking.userName || (booking.customerDetails ? booking.customerDetails.name : ''),
          vehicle.name || '',
          vehicle.type || '',
          startDateStr,
          endDateStr,
          duration.toString(),
          booking.status || '',
          booking.paymentStatus || '',
          amount.toFixed(2)
        ]);
      });
      
      // Convert to CSV string - handle commas in text fields by quoting values
      const csvContent = csvData.map(row => 
        row.map(cell => {
          // If cell contains commas, quotes or newlines, wrap in quotes and escape any quotes
          if (cell && (String(cell).includes(',') || String(cell).includes('"') || String(cell).includes('\n'))) {
            return `"${String(cell).replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',')
      ).join('\n');
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      // Use simple Date constructor for filename
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      link.setAttribute('download', `vehicle_rental_${period}_report_${dateStr}.csv`);
      
      document.body.appendChild(link);
      
      // Trigger download and cleanup
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the URL object
      
      setExportMessage('CSV exported successfully!');
      setTimeout(() => setExportMessage(''), 3000);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setExportMessage('Error exporting CSV: ' + err.message);
      setTimeout(() => setExportMessage(''), 5000);
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get date range based on selected time range
        const now = new Date();
        let startDate;
        
        if (timeRange === 'week') {
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
        } else if (timeRange === 'month') {
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
        } else if (timeRange === 'year') {
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
        }

        // Fetch all bookings
        const allBookingsSnapshot = await getDocs(collection(db, 'bookings'));
        const allBookingsData = allBookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`Fetched ${allBookingsData.length} total bookings`);
        
        // Filter bookings by date range client-side
        const filteredBookings = allBookingsData.filter(booking => {
          try {
            let bookingDate;
            
            if (booking.startDate instanceof Timestamp) {
              bookingDate = booking.startDate.toDate();
            } else if (booking.startDate instanceof Date) {
              bookingDate = booking.startDate;
            } else if (typeof booking.startDate === 'string') {
              bookingDate = new Date(booking.startDate);
            } else {
              return false;
            }
            
            return bookingDate >= startDate;
          } catch (e) {
            console.error('Error filtering booking by date:', e);
            return false;
          }
        });
        
        console.log(`Filtered to ${filteredBookings.length} bookings for the ${timeRange} period`);
        
        if (filteredBookings.length === 0) {
          console.log("No bookings found in the specified time range");
          setError("No booking data found for the selected time period. You may need to adjust the time range or add more bookings.");
        } else {
          setError('');
        }
        
        setBookings(filteredBookings);
          
        // Fetch all vehicles
        const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
        const vehiclesData = vehiclesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`Fetched ${vehiclesData.length} vehicles`);
        setVehicles(vehiclesData);
        
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  // Calculate revenue data (daily/weekly/monthly)
  const revenueData = useMemo(() => {
    if (bookings.length === 0) return null;
    
    const now = new Date();
    const data = {
      labels: [],
      datasets: [
        {
          label: 'Revenue',
          data: [],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };
    
    // Group bookings by date/week/month
    const groupedData = {};
    
    if (timeRange === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        groupedData[dateStr] = 0;
        data.labels.push(dateStr);
      }
      
      // Sum revenue by day
      bookings.forEach(booking => {
        if (booking.paymentStatus === 'paid') {
          // Handle Firestore Timestamp
          let bookingDate;
          try {
            if (booking.startDate instanceof Timestamp) {
              bookingDate = booking.startDate.toDate();
            } else if (booking.startDate instanceof Date) {
              bookingDate = booking.startDate;
            } else if (typeof booking.startDate === 'string') {
              bookingDate = new Date(booking.startDate);
            } else {
              console.log('Unknown startDate format:', booking.startDate);
              return; // Skip this booking
            }
            
            const dateStr = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (groupedData[dateStr] !== undefined) {
              groupedData[dateStr] += booking.totalPrice || booking.totalAmount || 0;
            }
          } catch (e) {
            console.error('Error processing booking date:', e);
          }
        }
      });
    } else if (timeRange === 'month') {
      // Last 4 weeks
      for (let i = 4; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const dateStr = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        groupedData[dateStr] = 0;
        data.labels.push(dateStr);
      }
      
      // Sum revenue by week
      bookings.forEach(booking => {
        if (booking.paymentStatus === 'paid') {
          // Handle Firestore Timestamp
          let bookingDate;
          try {
            if (booking.startDate instanceof Timestamp) {
              bookingDate = booking.startDate.toDate();
            } else if (booking.startDate instanceof Date) {
              bookingDate = booking.startDate;
            } else if (typeof booking.startDate === 'string') {
              bookingDate = new Date(booking.startDate);
            } else {
              console.log('Unknown startDate format in month view:', booking.startDate);
              return; // Skip this booking
            }
            
            const bookingWeekStart = new Date(bookingDate);
            bookingWeekStart.setDate(bookingDate.getDate() - bookingDate.getDay());
            
            for (let i = 4; i >= 0; i--) {
              const date = new Date();
              date.setDate(date.getDate() - (i * 7));
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              
              if (bookingWeekStart >= weekStart && bookingWeekStart <= weekEnd) {
                const dateStr = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                if (groupedData[dateStr] !== undefined) {
                  groupedData[dateStr] += booking.totalPrice || booking.totalAmount || 0;
                }
                break;
              }
            }
          } catch (e) {
            console.error('Error processing booking date for month view:', e);
          }
        }
      });
    } else if (timeRange === 'year') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        groupedData[dateStr] = 0;
        data.labels.push(dateStr);
      }
      
      // Sum revenue by month
      bookings.forEach(booking => {
        if (booking.paymentStatus === 'paid') {
          // Handle Firestore Timestamp
          let bookingDate;
          try {
            if (booking.startDate instanceof Timestamp) {
              bookingDate = booking.startDate.toDate();
            } else if (booking.startDate instanceof Date) {
              bookingDate = booking.startDate;
            } else if (typeof booking.startDate === 'string') {
              bookingDate = new Date(booking.startDate);
            } else {
              console.log('Unknown startDate format in year view:', booking.startDate);
              return; // Skip this booking
            }
            
            const dateStr = bookingDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            if (groupedData[dateStr] !== undefined) {
              groupedData[dateStr] += booking.totalPrice || booking.totalAmount || 0;
            }
          } catch (e) {
            console.error('Error processing booking date for year view:', e);
          }
        }
      });
    }
    
    // Fill in the dataset
    data.datasets[0].data = data.labels.map(label => groupedData[label] || 0);
    
    return data;
  }, [bookings, timeRange]);

  // Vehicle Type Distribution
  const vehicleTypeData = useMemo(() => {
    if (vehicles.length === 0) return null;
    
    const vehicleTypes = {};
    vehicles.forEach(vehicle => {
      // Normalize vehicle type (lowercase for consistent comparison)
      const type = (vehicle.type || 'unknown').toLowerCase();
      vehicleTypes[type] = (vehicleTypes[type] || 0) + 1;
    });
    
    return {
      labels: Object.keys(vehicleTypes).map(type => 
        type.charAt(0).toUpperCase() + type.slice(1)
      ),
      datasets: [
        {
          label: 'Vehicle Types',
          data: Object.values(vehicleTypes),
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(255, 99, 132, 0.5)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [vehicles]);

  // Vehicle Utilization
  const vehicleUtilization = useMemo(() => {
    if (bookings.length === 0 || vehicles.length === 0) return null;
    
    // Count bookings per vehicle ID
    const vehicleBookings = {};
    bookings.forEach(booking => {
      if (booking.vehicleId) {
        vehicleBookings[booking.vehicleId] = (vehicleBookings[booking.vehicleId] || 0) + 1;
      }
    });
    
    // Group vehicles to avoid duplicates (keeping the one with most bookings if duplicates by name)
    const vehicleMap = {};
    vehicles.forEach(vehicle => {
      const vehicleName = vehicle.name?.toLowerCase() || 'unknown vehicle';
      if (!vehicleMap[vehicleName] || 
          (vehicleBookings[vehicle.id] || 0) > (vehicleBookings[vehicleMap[vehicleName].id] || 0)) {
        vehicleMap[vehicleName] = vehicle;
      }
    });
    
    // Get top 5 most booked vehicles
    const topVehicles = Object.values(vehicleMap)
      .filter(vehicle => vehicleBookings[vehicle.id])
      .sort((a, b) => 
        (vehicleBookings[b.id] || 0) - (vehicleBookings[a.id] || 0)
      )
      .slice(0, 5);
    
    return {
      labels: topVehicles.map(vehicle => {
        // Proper case for vehicle name
        const name = vehicle.name || 'Unknown Vehicle';
        return name.charAt(0).toUpperCase() + name.slice(1);
      }),
      datasets: [
        {
          label: 'Number of Bookings',
          data: topVehicles.map(vehicle => vehicleBookings[vehicle.id] || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [bookings, vehicles]);

  // Popular Booking Times
  const bookingTimesData = useMemo(() => {
    if (bookings.length === 0) return null;
    
    // Group bookings by hour of day
    const hourlyBookings = Array(24).fill(0);
    
    bookings.forEach(booking => {
      try {
        let bookingDate;
        if (booking.startDate instanceof Timestamp) {
          bookingDate = booking.startDate.toDate();
        } else if (booking.startDate instanceof Date) {
          bookingDate = booking.startDate;
        } else if (typeof booking.startDate === 'string') {
          bookingDate = new Date(booking.startDate);
        } else {
          return; // Skip this booking
        }
        
        const hour = bookingDate.getHours();
        if (hour >= 0 && hour < 24) {
          hourlyBookings[hour]++;
        }
      } catch (e) {
        console.error('Error processing booking time:', e);
      }
    });
    
    return {
      labels: Array.from({ length: 24 }, (_, i) => 
        i === 0 ? '12 AM' : 
        i < 12 ? `${i} AM` : 
        i === 12 ? '12 PM' : 
        `${i - 12} PM`
      ),
      datasets: [
        {
          label: 'Bookings by Hour',
          data: hourlyBookings,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3,
        },
      ],
    };
  }, [bookings]);

  // Revenue by vehicle type
  const revenueByTypeData = useMemo(() => {
    if (bookings.length === 0 || vehicles.length === 0) return null;
    
    // Map vehicle IDs to their types (normalized)
    const vehicleTypes = {};
    vehicles.forEach(vehicle => {
      vehicleTypes[vehicle.id] = (vehicle.type || 'unknown').toLowerCase();
    });
    
    // Sum revenue by vehicle type
    const revenueByType = {};
    bookings.forEach(booking => {
      if (booking.paymentStatus === 'paid' && booking.vehicleId) {
        const type = vehicleTypes[booking.vehicleId] || 'unknown';
        const amount = booking.totalPrice || booking.totalAmount || 0;
        revenueByType[type] = (revenueByType[type] || 0) + amount;
      }
    });
    
    // Sort by revenue (highest first) and get labels and data
    const sortedTypes = Object.keys(revenueByType).sort((a, b) => revenueByType[b] - revenueByType[a]);
    
    return {
      labels: sortedTypes.map(type => 
        type.charAt(0).toUpperCase() + type.slice(1)
      ),
      datasets: [
        {
          label: 'Revenue by Vehicle Type',
          data: sortedTypes.map(type => revenueByType[type]),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [bookings, vehicles]);

  // Booking Status Distribution
  const bookingStatusData = useMemo(() => {
    if (bookings.length === 0) return null;
    
    // Count bookings by status
    const statusCounts = {};
    bookings.forEach(booking => {
      const status = booking.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Sort statuses by count (highest first)
    const sortedStatuses = Object.keys(statusCounts).sort((a, b) => statusCounts[b] - statusCounts[a]);
    
    return {
      labels: sortedStatuses.map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [
        {
          label: 'Booking Status',
          data: sortedStatuses.map(status => statusCounts[status]),
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [bookings]);

  if (loading && !revenueData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 no-print">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 no-print">{error}</div>}
      {exportMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 no-print">{exportMessage}</div>}
      
      <div className="analytics-content">
        {/* Print Header - only visible when printing */}
        <div className="print-header hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-center">Vehicle Rental Analytics Report</h1>
          <p className="text-center text-gray-600">
            {timeRange === 'week' 
              ? 'Weekly Report - Last 7 days' 
              : timeRange === 'month' 
              ? 'Monthly Report - Last 4 weeks' 
              : 'Yearly Report - Last 6 months'}
          </p>
          <p className="text-center text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-6 no-print">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <div className="space-x-2">
            <div className="inline-flex space-x-2 mr-4">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 rounded-md ${
                  timeRange === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 rounded-md ${
                  timeRange === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`px-3 py-1 rounded-md ${
                  timeRange === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Yearly
              </button>
            </div>
            {/* Add refresh button */}
            <button
              onClick={() => {
                setLoading(true);
                setError('');
                setTimeout(() => {
                  const fetchData = async () => {
                    try {
                      // Get date range based on selected time range
                      const now = new Date();
                      let startDate;
                      
                      if (timeRange === 'week') {
                        startDate = new Date(now);
                        startDate.setDate(now.getDate() - 7);
                      } else if (timeRange === 'month') {
                        startDate = new Date(now);
                        startDate.setMonth(now.getMonth() - 1);
                      } else if (timeRange === 'year') {
                        startDate = new Date(now);
                        startDate.setFullYear(now.getFullYear() - 1);
                      }

                      // Fetch all bookings
                      const allBookingsSnapshot = await getDocs(collection(db, 'bookings'));
                      const allBookingsData = allBookingsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                      }));
                      
                      console.log(`Refreshed: Fetched ${allBookingsData.length} total bookings`);
                      
                      // Filter bookings by date range client-side
                      const filteredBookings = allBookingsData.filter(booking => {
                        try {
                          let bookingDate;
                          
                          if (booking.startDate instanceof Timestamp) {
                            bookingDate = booking.startDate.toDate();
                          } else if (booking.startDate instanceof Date) {
                            bookingDate = booking.startDate;
                          } else if (typeof booking.startDate === 'string') {
                            bookingDate = new Date(booking.startDate);
                          } else {
                            return false;
                          }
                          
                          return bookingDate >= startDate;
                        } catch (e) {
                          console.error('Error filtering booking by date:', e);
                          return false;
                        }
                      });
                      
                      console.log(`Refreshed: Filtered to ${filteredBookings.length} bookings for the ${timeRange} period`);
                      
                      if (filteredBookings.length === 0) {
                        setError("No booking data found for the selected time period. You may need to adjust the time range or add more bookings.");
                      } else {
                        setError('');
                      }
                      
                      setBookings(filteredBookings);
                      
                      // Fetch all vehicles
                      const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
                      const vehiclesData = vehiclesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                      }));
                      
                      console.log(`Refreshed: Fetched ${vehiclesData.length} vehicles`);
                      setVehicles(vehiclesData);
                      
                    } catch (err) {
                      console.error('Error refreshing data:', err);
                      setError('Failed to refresh analytics data: ' + err.message);
                    } finally {
                      setLoading(false);
                    }
                  };
                  
                  fetchData();
                }, 500);
              }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              <FaPrint className="inline mr-2" /> Print Report
            </button>
            <button
              onClick={handleCsvExport}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              <FaFileExport className="inline mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 print-cols">
          {/* Total Revenue Card */}
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  ${revenueData 
                    ? revenueData.datasets[0].data.reduce((sum, val) => sum + val, 0).toFixed(2)
                    : '0.00'
                  }
                </h3>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaMoneyBillWave className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Total Bookings Card */}
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                <h3 className="text-2xl font-bold text-gray-800">{bookings.length}</h3>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaCalendarAlt className="text-green-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Vehicles Count Card */}
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Vehicles</p>
                <h3 className="text-2xl font-bold text-gray-800">{vehicles.length}</h3>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaCarAlt className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Utilization Rate Card */}
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Top Vehicle</p>
                <h3 className="text-2xl font-bold text-gray-800 truncate" style={{maxWidth: '180px'}}>
                  {vehicleUtilization && vehicleUtilization.labels.length > 0 
                    ? vehicleUtilization.labels[0]
                    : 'N/A'
                  }
                </h3>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <FaChartLine className="text-yellow-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 charts-container">
              <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
              <div className="h-80">
                {revenueData ? (
                  <Bar
                    data={revenueData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: `Revenue ${
                            timeRange === 'week'
                              ? 'This Week'
                              : timeRange === 'month'
                              ? 'Last 4 Weeks'
                              : 'Last 6 Months'
                          }`,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Revenue ($)',
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center p-6">
                      <p className="text-gray-500 mb-3">No revenue data available</p>
                      <p className="text-sm text-gray-400">Try adjusting the time period or adding more bookings with payment data</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Distribution & Revenue by Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print-cols">
              {/* Vehicle Type Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-md charts-container">
                <h3 className="text-lg font-semibold mb-4">Vehicle Distribution</h3>
                <div className="h-64">
                  {vehicleTypeData ? (
                    <Pie
                      data={vehicleTypeData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                          title: {
                            display: true,
                            text: 'Vehicle Types',
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <div className="text-center p-6">
                        <p className="text-gray-500 mb-3">No vehicle data available</p>
                        <p className="text-sm text-gray-400">Add vehicles to your database to see statistics</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue by Vehicle Type */}
              <div className="bg-white p-6 rounded-lg shadow-md charts-container">
                <h3 className="text-lg font-semibold mb-4">Revenue by Vehicle Type</h3>
                <div className="h-64">
                  {revenueByTypeData ? (
                    <Pie
                      data={revenueByTypeData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                          title: {
                            display: true,
                            text: 'Revenue Distribution',
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <div className="text-center p-6">
                        <p className="text-gray-500 mb-3">No revenue data available by vehicle type</p>
                        <p className="text-sm text-gray-400">Generate analytics data from the Dashboard tab</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Utilization & Popular Times */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print-cols">
              {/* Most Booked Vehicles */}
              <div className="bg-white p-6 rounded-lg shadow-md charts-container">
                <h3 className="text-lg font-semibold mb-4">Most Booked Vehicles</h3>
                <div className="h-64">
                  {vehicleUtilization ? (
                    <Bar
                      data={vehicleUtilization}
                      options={{
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: 'Vehicle Utilization',
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <div className="text-center p-6">
                        <p className="text-gray-500 mb-3">No utilization data available</p>
                        <p className="text-sm text-gray-400">Add more bookings to see which vehicles are most popular</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Popular Booking Times */}
              <div className="bg-white p-6 rounded-lg shadow-md charts-container">
                <h3 className="text-lg font-semibold mb-4">Popular Booking Times</h3>
                <div className="h-64">
                  {bookingTimesData ? (
                    <Line
                      data={bookingTimesData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: 'Bookings by Hour of Day',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Bookings',
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <div className="text-center p-6">
                        <p className="text-gray-500 mb-3">No booking time data available</p>
                        <p className="text-sm text-gray-400">Add more bookings to analyze popular booking times</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Status Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 charts-container">
              <h3 className="text-lg font-semibold mb-4">Booking Status Distribution</h3>
              <div className="h-64">
                {bookingStatusData ? (
                  <Pie
                    data={bookingStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        title: {
                          display: true,
                          text: 'Booking Statuses',
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center p-6">
                      <p className="text-gray-500 mb-3">No booking status data available</p>
                      <p className="text-sm text-gray-400">Add bookings with different statuses to see the distribution</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Section - visible in both screen and print */}
            <div className="analytics-summary bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-xl font-semibold mb-4">Analytics Summary</h3>
              <p><strong>Total Vehicles:</strong> {vehicles.length}</p>
              <p><strong>Total Bookings:</strong> {bookings.length}</p>
              <p><strong>Time Period:</strong> {
                timeRange === 'week' 
                  ? 'Last 7 days' 
                  : timeRange === 'month' 
                  ? 'Last 4 weeks' 
                  : 'Last 6 months'
              }</p>
              <p><strong>Total Revenue:</strong> ${
                revenueData 
                  ? revenueData.datasets[0].data.reduce((sum, val) => sum + val, 0).toFixed(2)
                  : '0.00'
              }</p>
              <p><strong>Most Popular Vehicle:</strong> {vehicleUtilization && vehicleUtilization.labels.length > 0 ? vehicleUtilization.labels[0] : 'N/A'}</p>
              <p><strong>Highest Revenue Vehicle Type:</strong> {revenueByTypeData && revenueByTypeData.labels.length > 0 ? revenueByTypeData.labels[0] : 'N/A'}</p>
              <p><strong>Report Generated:</strong> {new Date().toLocaleString()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 