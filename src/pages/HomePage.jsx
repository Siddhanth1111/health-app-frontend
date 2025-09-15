import React from 'react';
import { Link } from 'react-router-dom';
import { FaVideo, FaUsers, FaShieldAlt, FaRocket } from 'react-icons/fa';

const HomePage = () => {
  const features = [
    {
      icon: <FaVideo className="text-3xl text-blue-500" />,
      title: 'HD Video Calling',
      description: 'Crystal clear video calls with advanced WebRTC technology'
    },
    {
      icon: <FaUsers className="text-3xl text-green-500" />,
      title: 'User Management',
      description: 'Easy user management with real-time online status'
    },
    {
      icon: <FaShieldAlt className="text-3xl text-purple-500" />,
      title: 'Secure & Private',
      description: 'End-to-end encrypted calls for your privacy'
    },
    {
      icon: <FaRocket className="text-3xl text-orange-500" />,
      title: 'Fast & Reliable',
      description: 'Built with modern technologies for optimal performance'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Professional Video Calling
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with anyone, anywhere with our secure and reliable video calling platform
          </p>
          <Link 
            to="/login"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose VideoCall Pro?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technology to provide the best video calling experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Video Calling?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of users who trust VideoCall Pro for their communication needs
          </p>
          <Link 
            to="/login"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Start Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
