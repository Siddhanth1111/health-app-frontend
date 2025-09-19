import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { SocketProvider, useSocket } from '../context/SocketContext';
import ApiService from '../services/api';
import Loading from '../components/common/Loading';

// Dashboard Content Component
const DashboardPageContent = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();
  const { registerUser, isConnected } = useSocket();

  useEffect(() => {
    loadUserData();
  }, []);

  // Register user with socket when connected
  useEffect(() => {
    if (isConnected && userData?.userType) {
      console.log('📝 Registering user with socket:', userData.userType);
      registerUser(userData.userType);
    }
  }, [isConnected, userData?.userType, registerUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await ApiService.getCurrentUser(token);
      setUserData(data);
      
      console.log('👤 User data loaded:', data);
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {userData?.name || user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-gray-600 capitalize">
              {userData?.userType || 'User'} Dashboard
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a 
              href="/doctors"
              className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              👨‍⚕️ Browse Doctors
            </a>
            <a 
              href="/consultations"
              className="block w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              📅 My Consultations
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Profile Info</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {userData?.name}</p>
            <p><strong>Email:</strong> {userData?.email}</p>
            <p><strong>Type:</strong> <span className="capitalize">{userData?.userType}</span></p>
            <p><strong>Status:</strong> 
              <span className={`ml-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      </div>
    </div>
  );
};

// Main DashboardPage Component with SocketProvider
const DashboardPage = () => {
  return (
    <SocketProvider>
      <DashboardPageContent />
    </SocketProvider>
  );
};

export default DashboardPage;
