import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Cars from './pages/Cars'
import Bikes from './pages/Bikes'
import About from './pages/About'
import Contact from './pages/Contact'
import VehicleDetails from './pages/VehicleDetails'
import Booking from './pages/Booking'
import BookingSuccess from './pages/BookingSuccess'
import Login from './components/Login'
import Register from './pages/Register'
import MyBookings from './pages/MyBookings'
import LocationNotServed from './components/LocationNotServed'
import Admin from './pages/Admin'
import Payment from './pages/Payment'
import MakeAdmin from './pages/MakeAdmin'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import BookingMonitor from './components/BookingMonitor'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <BookingMonitor />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/bikes" element={<Bikes />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/booking/:id" element={
              <PrivateRoute>
                <Booking />
              </PrivateRoute>
            } />
            <Route path="/booking-success" element={
              <PrivateRoute>
                <BookingSuccess />
              </PrivateRoute>
            } />
            <Route path="/payment/:id" element={
              <PrivateRoute>
                <Payment />
              </PrivateRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-bookings" element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            } />
            <Route path="/admin" element={<Admin />} />
            <Route path="/make-admin" element={<MakeAdmin />} />
            <Route path="/location-not-served" element={<LocationNotServed />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App 