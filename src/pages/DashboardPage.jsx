import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useSocket } from '../context/SocketContext'; // Just use the hook
import ApiService from '../services/api';
import Loading from '../components/common/Loading';

// DashboardPage Component (no SocketProvider needed)
const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();
  const { isConnected, userType } = useSocket();

  useEffect(() => {
    loadUserData();
  }, []);

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
      {/* ... your existing dashboard JSX */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {userData?.name || user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-gray-600 capitalize">
              {userData?.userType || userType || 'User'} Dashboard
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Rest of your dashboard content */}
    </div>
  );
};

export default DashboardPage;
