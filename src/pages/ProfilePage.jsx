import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaEnvelope, FaCalendar } from 'react-icons/fa';

const ProfilePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-6 mb-8">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full border-4 border-blue-100"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
              <p className="text-gray-600">{currentUser.email}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <FaUser className="text-blue-500 text-xl" />
              <div>
                <label className="font-semibold text-gray-700">Full Name</label>
                <p className="text-gray-600">{currentUser.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <FaEnvelope className="text-green-500 text-xl" />
              <div>
                <label className="font-semibold text-gray-700">Email Address</label>
                <p className="text-gray-600">{currentUser.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <FaCalendar className="text-purple-500 text-xl" />
              <div>
                <label className="font-semibold text-gray-700">Member Since</label>
                <p className="text-gray-600">January 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
