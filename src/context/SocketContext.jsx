import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [onlineDoctors, setOnlineDoctors] = useState(new Set());

  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    console.log('🔌 Connecting to:', socketUrl);

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
      setIsRegistered(false);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setIsRegistered(false);
    };
  }, [isSignedIn, user]);

  // Register user when connected
  useEffect(() => {
    if (socket && isConnected && user && !isRegistered) {
      // Determine user type (you might get this from your user profile)
      const userType = user.publicMetadata?.userType || 'patient';
      
      console.log('📝 Registering user:', user.fullName, 'as', userType);
      
      socket.emit('register-user', {
        userId: user.id,
        userType: userType,
        userName: user.fullName || user.firstName || 'User'
      });
    }
  }, [socket, isConnected, user, isRegistered]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Registration events
    socket.on('registration-success', (data) => {
      console.log('✅ Registration successful:', data);
      setIsRegistered(true);
    });

    socket.on('registration-error', (error) => {
      console.error('❌ Registration failed:', error);
    });

    // Call events
    socket.on('incoming-call', (data) => {
      console.log('📞 Incoming call:', data);
      setIncomingCall(data);
    });

    socket.on('call-initiated', (data) => {
      console.log('📞 Call initiated:', data);
      setCurrentCall(data);
    });

    socket.on('call-accepted', (data) => {
      console.log('✅ Call accepted:', data);
      setIncomingCall(null);
      setCurrentCall(data);
      // Navigate to call room
      navigate(`/video-call/${data.roomId}`);
    });

    socket.on('call-rejected', (data) => {
      console.log('❌ Call rejected:', data);
      setCurrentCall(null);
      alert(`Dr. ${data.doctorName} declined your call`);
    });

    socket.on('call-failed', (data) => {
      console.log('❌ Call failed:', data);
      setCurrentCall(null);
      alert(data.message);
    });

    socket.on('call-ended', () => {
      console.log('📞 Call ended');
      setCurrentCall(null);
      setIncomingCall(null);
      navigate('/dashboard');
    });

    // Doctor status events
    socket.on('doctor-online', (data) => {
      setOnlineDoctors(prev => new Set([...prev, data.doctorId]));
    });

    socket.on('doctor-offline', (data) => {
      setOnlineDoctors(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.doctorId);
        return newSet;
      });
    });

    return () => {
      socket.off('registration-success');
      socket.off('registration-error');
      socket.off('incoming-call');
      socket.off('call-initiated');
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('call-failed');
      socket.off('call-ended');
      socket.off('doctor-online');
      socket.off('doctor-offline');
    };
  }, [socket, navigate]);

  // Call functions
  const initiateCall = (doctorId, doctorName) => {
    if (!socket || !isRegistered) {
      alert('Not connected to server');
      return;
    }

    console.log('📞 Initiating call to doctor:', doctorId);
    socket.emit('initiate-call', {
      targetDoctorId: doctorId,
      patientName: user.fullName || user.firstName || 'Patient'
    });
  };

  const acceptCall = (callId) => {
    if (!socket) return;
    
    console.log('✅ Accepting call:', callId);
    socket.emit('respond-to-call', {
      callId,
      accepted: true
    });
  };

  const rejectCall = (callId) => {
    if (!socket) return;
    
    console.log('❌ Rejecting call:', callId);
    socket.emit('respond-to-call', {
      callId,
      accepted: false
    });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (!socket || !currentCall) return;
    
    console.log('📞 Ending call');
    socket.emit('end-call', {
      callId: currentCall.callId,
      roomId: currentCall.roomId
    });
  };

  const value = {
    socket,
    isConnected,
    isRegistered,
    incomingCall,
    currentCall,
    onlineDoctors,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
