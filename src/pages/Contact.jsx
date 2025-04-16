import { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheck } from 'react-icons/fa';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1500);
  };
  
  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Have questions or need assistance? We're here to help. Reach out to our team.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <FaMapMarkerAlt className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Our Location</h3>
                  <p className="text-gray-600">
                    123 Rental Street<br />
                    City, State 12345<br />
                    United States
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <FaPhone className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone Number</h3>
                  <p className="text-gray-600">
                    +1 (555) 123-4567<br />
                    +1 (555) 765-4321
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <FaEnvelope className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Address</h3>
                  <p className="text-gray-600">
                    info@riderental.com<br />
                    support@riderental.com
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <FaClock className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9AM - 7PM<br />
                    Saturday: 9AM - 5PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheck className="text-green-500 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)} 
                  className="btn btn-primary"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-gray-700 mb-2 font-medium">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="How can we help you?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 mb-2 font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary py-3 px-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Map */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
        <h2 className="text-2xl font-bold mb-6">Our Location</h2>
        <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
          {/* In a real application, you would embed a Google Map or similar here */}
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Map would be displayed here</p>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="bg-white rounded-lg shadow-lg divide-y">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">What documents do I need to rent a vehicle?</h3>
            <p className="text-gray-600">
              You'll need a valid driver's license, a credit card in your name, and proof of insurance. For international customers, a passport and international driver's permit may be required.
            </p>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Is there a security deposit?</h3>
            <p className="text-gray-600">
              Yes, we require a security deposit which is refundable upon return of the vehicle in its original condition. The amount varies depending on the vehicle type.
            </p>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Can I modify or cancel my reservation?</h3>
            <p className="text-gray-600">
              Yes, you can modify or cancel your reservation up to 24 hours before the scheduled pickup time without any penalty. Changes made within 24 hours may incur a fee.
            </p>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Is insurance included in the rental price?</h3>
            <p className="text-gray-600">
              Basic insurance is included in all our rentals. However, we offer additional coverage options for extra peace of mind. Our staff can provide details on available insurance packages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 