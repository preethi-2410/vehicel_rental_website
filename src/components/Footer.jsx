import { Link } from 'react-router-dom';
import { FaCar, FaMotorcycle, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <FaCar className="text-primary text-2xl" />
              <FaMotorcycle className="text-accent text-2xl ml-1" />
              <span className="text-xl font-bold ml-2">RideRental</span>
            </div>
            <p className="text-gray-300 mb-4">
              Premium car and bike rental service across India. Offering quality vehicles at affordable prices with locations in all major cities.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors duration-300">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors duration-300">
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors duration-300">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary transition-colors duration-300">Home</Link>
              </li>
              <li>
                <Link to="/cars" className="text-gray-300 hover:text-primary transition-colors duration-300">Cars</Link>
              </li>
              <li>
                <Link to="/bikes" className="text-gray-300 hover:text-primary transition-colors duration-300">Bikes</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary transition-colors duration-300">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors duration-300">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Car Rentals</li>
              <li className="text-gray-300">Bike Rentals</li>
              <li className="text-gray-300">Long Term Rentals</li>
              <li className="text-gray-300">Airport Pickup</li>
              <li className="text-gray-300">Corporate Rentals</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">42 MG Road, Bangalore 560001</li>
              <li className="text-gray-300">Phone: +91 98765 43210</li>
              <li className="text-gray-300">Email: info@riderental.in</li>
              <li className="text-gray-300">Hours: Mon-Sat 9AM - 8PM</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} RideRental India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 