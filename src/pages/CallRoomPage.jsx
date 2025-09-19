import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useUser } from '@clerk/clerk-react';

const CallRoomPage = () => {
  const { callRoomId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected, endCall, currentCall } = useSocket();
  const { user } = useUser();
  const [callStatus, setCallStatus] = useState('connecting');
  const [participantInfo, setParticipantInfo] = useState(null);

  useEffect(() => {
    if (!isConnected) {
      console.log('❌ Not connected to socket server');
      return;
    }

    if (!callRoomId) {
      console.log('❌ No call room ID provided');
      navigate('/dashboard');
      return;
    }

    console.log('📱 Entered call room:', callRoomId);
    setCallStatus('connected');

    // Set up call-related socket listeners
    const handleCallEnded = (data) => {
      console.log('📞 Call ended in room:', data);
      setCallStatus('ended');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    };

    const handleCallAccepted = (data) => {
      console.log('✅ Call accepted in room:', data);
      setCallStatus('connected');
      setParticipantInfo(data);
    };

    const handleParticipantJoined = (data) => {
      console.log('👥 Participant joined:', data);
      setParticipantInfo(data);
    };

    socket?.on('call-ended', handleCallEnded);
    socket?.on('call-accepted', handleCallAccepted);
    socket?.on('participant-joined', handleParticipantJoined);

    return () => {
      socket?.off('call-ended', handleCallEnded);
      socket?.off('call-accepted', handleCallAccepted);
      socket?.off('participant-joined', handleParticipantJoined);
    };
  }, [socket, isConnected, callRoomId, navigate]);

  const handleEndCall = () => {
    console.log('📞 Ending call from call room');
    endCall();
    navigate('/dashboard');
  };

  const handleToggleMute = () => {
    console.log('🔇 Toggle mute (placeholder)');
    // Implement mute functionality
  };

  const handleToggleVideo = () => {
    console.log('📹 Toggle video (placeholder)');
    // Implement video toggle functionality
  };

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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-white">
          <h1 className="text-xl font-bold">Video Call</h1>
          <p className="text-sm text-gray-300">
            Room: {callRoomId?.split('_').pop()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-white text-sm">
            {callStatus === 'connected' ? 'Connected' : callStatus}
          </span>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl">
          {/* Local Video */}
          <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center relative">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-lg font-medium">
                {user?.firstName || user?.fullName || 'You'}
              </p>
              <p className="text-sm text-gray-400">Local Video</p>
            </div>
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              You
            </div>
          </div>

          {/* Remote Video */}
          <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center relative">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <p className="text-lg font-medium">
                {participantInfo?.participantName || 'Participant'}
              </p>
              <p className="text-sm text-gray-400">Remote Video</p>
            </div>
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              Remote
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex justify-center space-x-6">
          <button
            onClick={handleToggleMute}
            className="flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors"
            title="Toggle Mute"
          >
            🎤
          </button>
          
          <button
            onClick={handleToggleVideo}
            className="flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors"
            title="Toggle Video"
          >
            📹
          </button>
          
          <button
            onClick={handleEndCall}
            className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            title="End Call"
          >
            📞
          </button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-white text-sm">
            Call started • Room ID: {callRoomId?.split('_').pop()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallRoomPage;
