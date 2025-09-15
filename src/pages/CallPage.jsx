import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useUsers } from '../hooks/useUsers';
import VideoCall from '../components/video/VideoCall';
import Loading from '../components/common/Loading';

const CallPage = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const { users, loading } = useUsers();
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    if (!loading && users.length > 0) {
      const user = users.find(u => u._id === targetUserId);
      if (user) {
        setTargetUser(user);
      } else {
        // User not found, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [users, loading, targetUserId, navigate]);

  const handleCallEnd = () => {
    navigate('/dashboard');
  };

  if (loading || !targetUser) {
    return <Loading message="Preparing video call..." />;
  }

  return (
    <VideoCall
      currentUser={currentUser}
      targetUser={targetUser}
      socket={socket}
      onCallEnd={handleCallEnd}
    />
  );
};

export default CallPage;
