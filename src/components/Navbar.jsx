import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCar, FaMotorcycle, FaBars, FaTimes, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { signOutUser } from '../firebase/auth';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOutUser();
      setShowLogoutConfirm(false);
      setShowLoginModal(true);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary';
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <div className="flex items-center">
                <FaCar className="text-primary text-2xl" />
                <FaMotorcycle className="text-accent text-2xl ml-1" />
              </div>
              <span className="text-xl font-bold text-gray-800">RideRental</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`${isActive('/')} transition-colors duration-300`}>
                Home
              </Link>
              <Link to="/cars" className={`${isActive('/cars')} transition-colors duration-300`}>
                Cars
              </Link>
              <Link to="/bikes" className={`${isActive('/bikes')} transition-colors duration-300`}>
                Bikes
              </Link>
              <Link to="/about" className={`${isActive('/about')} transition-colors duration-300`}>
                About
              </Link>
              <Link to="/contact" className={`${isActive('/contact')} transition-colors duration-300`}>
                Contact
              </Link>
              {user ? (
                <>
                  <Link to="/my-bookings" className={`${isActive('/my-bookings')} transition-colors duration-300 flex items-center`}>
                    <FaCalendarAlt className="mr-1" />
                    My Bookings
                  </Link>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-primary transition-colors duration-300 flex items-center"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogoutClick}
                    className="text-gray-700 hover:text-primary transition-colors duration-300 flex items-center"
                  >
                    <FaUser className="mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={`${isActive('/login')} transition-colors duration-300`}>
                    Login
                  </Link>
                  <Link to="/register" className={`${isActive('/register')} transition-colors duration-300`}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-primary focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <FaTimes className="text-2xl" />
                ) : (
                  <FaBars className="text-2xl" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <div className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className={`${isActive('/')} block px-2 py-1 rounded hover:bg-gray-100`}
                  onClick={closeMenu}
                >
                  Home
                </Link>
                <Link
                  to="/cars"
                  className={`${isActive('/cars')} block px-2 py-1 rounded hover:bg-gray-100`}
                  onClick={closeMenu}
                >
                  Cars
                </Link>
                <Link
                  to="/bikes"
                  className={`${isActive('/bikes')} block px-2 py-1 rounded hover:bg-gray-100`}
                  onClick={closeMenu}
                >
                  Bikes
                </Link>
                <Link
                  to="/about"
                  className={`${isActive('/about')} block px-2 py-1 rounded hover:bg-gray-100`}
                  onClick={closeMenu}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className={`${isActive('/contact')} block px-2 py-1 rounded hover:bg-gray-100`}
                  onClick={closeMenu}
                >
                  Contact
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/my-bookings"
                      className={`${isActive('/my-bookings')} block px-2 py-1 rounded hover:bg-gray-100 flex items-center`}
                      onClick={closeMenu}
                    >
                      <FaCalendarAlt className="mr-2" />
                      My Bookings
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-primary block px-2 py-1 rounded hover:bg-gray-100 flex items-center"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogoutClick();
                        closeMenu();
                      }}
                      className="text-gray-700 hover:text-primary block px-2 py-1 rounded hover:bg-gray-100 flex items-center w-full"
                    >
                      <FaUser className="mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`${isActive('/login')} block px-2 py-1 rounded hover:bg-gray-100`}
                      onClick={closeMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className={`${isActive('/register')} block px-2 py-1 rounded hover:bg-gray-100`}
                      onClick={closeMenu}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={handleCloseLoginModal} />
    </>
  );
};

export default Navbar; 