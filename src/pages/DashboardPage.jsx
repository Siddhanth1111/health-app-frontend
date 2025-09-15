import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useUsers } from '../hooks/useUsers';
import UserList from '../components/user/UserList';
import Loading from '../components/common/Loading';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { isConnected } = useSocket();
  const { users, loading, error, refreshUsers } = useUsers();

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={refreshUsers}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const otherUsers = users.filter(user => user._id !== currentUser._id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {currentUser.name}!
        </h1>
        <p className="text-gray-600">
          Select a user below to start a video call
        </p>
      </div>

      <UserList 
        currentUser={currentUser}
        users={otherUsers}
        socketConnected={isConnected}
      />
    </div>
  );
};

export default DashboardPage;
