import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useUser } from '@clerk/clerk-react';
import VideoCall from '../components/video/VideoCall';
import Loading from '../components/common/Loading';
import ApiService from '../services/api';

const CallRoomPage = () => {
  const { callRoomId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected, currentCall, incomingCall } = useSocket();
  const { user } = useUser();
  const [currentUserData, setCurrentUserData] = useState(null);
  const [targetUserData, setTargetUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCallData();
  }, [callRoomId, currentCall, incomingCall]);

  const loadCallData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!callRoomId) {
        setError('No call room ID provided');
        return;
      }

      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Get current user profile
      const token = await user.getToken?.() || null;
      let userData;
      
      try {
        userData = await ApiService.getCurrentUser(token);
      } catch (err) {
        console.warn('Could not load user profile:', err);
        // Create basic user data from Clerk user
        userData = {
          _id: user.id,
          name: user.fullName || user.firstName || 'User',
          email: user.emailAddresses?.[0]?.emailAddress || '',
          avatar: user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=4f46e5&color=fff&size=150`,
          userType: 'patient' // Default assumption
        };
      }

      setCurrentUserData(userData);

      // Determine target user from call data
      let targetUser = null;

      if (currentCall) {
        // We initiated the call
        console.log('📞 Using current call data:', currentCall);
        targetUser = {
          _id: currentCall.targetUserId,
          name: currentCall.targetUserName || 'Doctor',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentCall.targetUserName || 'Doctor')}&background=10b981&color=fff&size=150`,
          userType: 'doctor'
        };
      } else if (incomingCall) {
        // We received the call
        console.log('📞 Using incoming call data:', incomingCall);
        targetUser = {
          _id: incomingCall.fromDbUserId || incomingCall.fromUserId,
          name: incomingCall.fromUserName || 'User',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(incomingCall.fromUserName || 'User')}&background=f59e0b&color=fff&size=150`,
          userType: incomingCall.fromUserType || 'patient'
        };
      } else {
        // Try to extract from call room ID
        const callParts = callRoomId.split('_');
        if (callParts.length >= 3) {
          const [, initiatorId, receiverId] = callParts;
          const targetId = initiatorId === userData._id ? receiverId : initiatorId;
          
          targetUser = {
            _id: targetId,
            name: 'Participant',
            avatar: `https://ui-avatars.com/api/?name=Participant&background=6366f1&color=fff&size=150`,
            userType: 'unknown'
          };
        } else {
          setError('Invalid call room format');
          return;
        }
      }

      setTargetUserData(targetUser);
      console.log('👤 Current user:', userData.name);
      console.log('🎯 Target user:', targetUser.name);

    } catch (err) {
      console.error('❌ Error loading call data:', err);
      setError('Failed to load call information');
    } finally {
      setLoading(false);
    }
  };

  const handleCallEnd = () => {
    console.log('📞 Call ended, navigating to dashboard');
    navigate('/dashboard');
  };

  if (loading) {
    return <Loading message="Loading call room..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4">Call Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold mb-4">Connecting...</h2>
          <p className="text-gray-300">Please wait while we connect you to the call</p>
        </div>
      </div>
    );
  }

  if (!currentUserData || !targetUserData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-4">Loading Participants...</h2>
        </div>
      </div>
    );
  }

  return (
    <VideoCall
      currentUser={currentUserData}
      targetUser={targetUserData}
      socket={socket}
      onCallEnd={handleCallEnd}
    />
  );
};

export default CallRoomPage;
