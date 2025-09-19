import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUser, SignOutButton } from '@clerk/clerk-react';
import { useSocket } from '../../context/SocketContext';

const Header = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { isConnected } = useSocket();

  return (
    <header className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-bold text-gray-800">MedConsult</span>
          </Link>

          {/* Navigation & Status */}
          <div className="flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* User Info */}
            {isSignedIn ? (
              <>
                <Link 
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <span>🏠</span>
                  <span>Dashboard</span>
                </Link>
                
                <Link 
                  to="/doctors"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <span>👨‍⚕️</span>
                  <span>Doctors</span>
                </Link>
                
                <Link 
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <img
                    src={user?.imageUrl}
                    alt={user?.fullName}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{user?.firstName || user?.fullName}</span>
                </Link>
                
                <SignOutButton>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </SignOutButton>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/sign-in"
                  className="text-gray-600 hover:text-blue-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/sign-up"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
