import { FaCar, FaMotorcycle, FaUsers, FaHistory, FaAward, FaHandshake } from 'react-icons/fa';

const About = () => {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold mb-6">About RideRental</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're dedicated to providing the best vehicle rental experience with quality cars and bikes at affordable prices.
        </p>
      </div>
      
      {/* Our Story */}
      <div className="mb-16">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" 
                alt="Our Story" 
                className="w-full h-full object-cover"
                style={{ maxHeight: '500px' }}
              />
            </div>
            <div className="md:w-1/2 p-8">
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2010, RideRental started with a small fleet of just 5 cars and 3 motorcycles. Our founder, John Smith, had a vision to create a rental service that prioritized quality, affordability, and customer satisfaction.
              </p>
              <p className="text-gray-600 mb-4">
                Over the years, we've grown to become one of the leading vehicle rental services in the region, with a diverse fleet of over 100 vehicles including luxury cars, economy cars, sports bikes, and cruisers.
              </p>
              <p className="text-gray-600">
                Our mission remains the same: to provide our customers with reliable, well-maintained vehicles at competitive prices, backed by exceptional customer service.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaAward className="text-primary text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Quality</h3>
            <p className="text-gray-600">
              We maintain our vehicles to the highest standards, ensuring they are clean, reliable, and safe for our customers.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHandshake className="text-primary text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Integrity</h3>
            <p className="text-gray-600">
              We believe in transparent pricing, honest communication, and always putting our customers' needs first.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-primary text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Customer Focus</h3>
            <p className="text-gray-600">
              We strive to exceed customer expectations with personalized service and attention to detail.
            </p>
          </div>
        </div>
      </div>
      
      {/* Our Fleet */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Fleet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" 
                alt="Cars" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <div className="flex items-center mb-2">
                    <FaCar className="text-2xl mr-2" />
                    <h3 className="text-2xl font-bold">Cars</h3>
                  </div>
                  <p>From economy to luxury, we have the perfect car for your needs.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" 
                alt="Bikes" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <div className="flex items-center mb-2">
                    <FaMotorcycle className="text-2xl mr-2" />
                    <h3 className="text-2xl font-bold">Bikes</h3>
                  </div>
                  <p>Experience the thrill of the road with our range of motorcycles.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Journey</h2>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
          
          {/* Timeline Items */}
          <div className="relative z-10">
            <div className="mb-12 flex justify-center">
              <div className="bg-white p-6 rounded-lg shadow-md max-w-md relative">
                <div className="absolute top-6 -left-3 w-6 h-6 bg-primary rounded-full border-4 border-white transform -translate-x-1/2"></div>
                <div className="flex items-center mb-2">
                  <FaHistory className="text-primary mr-2" />
                  <h3 className="text-xl font-semibold">2010</h3>
                </div>
                <p className="text-gray-600">
                  RideRental was founded with a small fleet of 5 cars and 3 motorcycles.
                </p>
              </div>
            </div>
            
            <div className="mb-12 flex justify-center">
              <div className="bg-white p-6 rounded-lg shadow-md max-w-md relative">
                <div className="absolute top-6 -left-3 w-6 h-6 bg-primary rounded-full border-4 border-white transform -translate-x-1/2"></div>
                <div className="flex items-center mb-2">
                  <FaHistory className="text-primary mr-2" />
                  <h3 className="text-xl font-semibold">2015</h3>
                </div>
                <p className="text-gray-600">
                  Expanded our fleet to 50 vehicles and opened our second location.
                </p>
              </div>
            </div>
            
            <div className="mb-12 flex justify-center">
              <div className="bg-white p-6 rounded-lg shadow-md max-w-md relative">
                <div className="absolute top-6 -left-3 w-6 h-6 bg-primary rounded-full border-4 border-white transform -translate-x-1/2"></div>
                <div className="flex items-center mb-2">
                  <FaHistory className="text-primary mr-2" />
                  <h3 className="text-xl font-semibold">2018</h3>
                </div>
                <p className="text-gray-600">
                  Launched our online booking platform for a seamless rental experience.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-lg shadow-md max-w-md relative">
                <div className="absolute top-6 -left-3 w-6 h-6 bg-primary rounded-full border-4 border-white transform -translate-x-1/2"></div>
                <div className="flex items-center mb-2">
                  <FaHistory className="text-primary mr-2" />
                  <h3 className="text-xl font-semibold">Today</h3>
                </div>
                <p className="text-gray-600">
                  Now with over 100 vehicles and multiple locations, we continue to grow while maintaining our commitment to quality and customer satisfaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Section */}
      <div>
        <h2 className="text-3xl font-bold mb-8 text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="John Smith" 
              className="w-full h-64 object-cover"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold">John Smith</h3>
              <p className="text-gray-500">Founder & CEO</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Sarah Johnson" 
              className="w-full h-64 object-cover"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold">Sarah Johnson</h3>
              <p className="text-gray-500">Operations Manager</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Michael Brown" 
              className="w-full h-64 object-cover"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold">Michael Brown</h3>
              <p className="text-gray-500">Fleet Manager</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Emily Davis" 
              className="w-full h-64 object-cover"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold">Emily Davis</h3>
              <p className="text-gray-500">Customer Service Lead</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 