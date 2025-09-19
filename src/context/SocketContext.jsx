import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { io } from 'socket.io-client';

// Get socket URL from environment
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Create the context
const SocketContext = createContext({
  socket: null,
  isConnected: false,
  onlineDoctors: new Set(),
  incomingCall: null,
  currentCall: null,
  registerUser: () => {},
  initiateCall: () => {},
  acceptCall: () => {},
  rejectCall: () => {},
  endCall: () => {}
});

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineDoctors, setOnlineDoctors] = useState(new Set());
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) {
      if (socket) {
        console.log('🔌 Disconnecting socket - user not signed in');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    console.log('🔌 Attempting to connect to socket:', SOCKET_URL);

    const socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(socketInstance);

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      setIncomingCall(null);
      setCurrentCall(null);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    });

    // Call-related events
    socketInstance.on('incoming-call', (data) => {
      console.log('📞 Incoming call received:', data);
      setIncomingCall(data);
      
      // Play ringtone sound (optional)
      playRingtone();
    });

    socketInstance.on('call-initiated', (data) => {
      console.log('📞 Call initiated successfully:', data);
      setCurrentCall({
        ...data,
        status: 'ringing',
        isInitiator: true
      });
    });

    socketInstance.on('call-accepted', (data) => {
      console.log('✅ Call accepted:', data);
      setIncomingCall(null);
      setCurrentCall({
        ...data,
        status: 'connected'
      });
      stopRingtone();
    });

    socketInstance.on('call-rejected', (data) => {
      console.log('❌ Call rejected:', data);
      setCurrentCall(null);
      setIncomingCall(null);
      stopRingtone();
      alert('Call was rejected');
    });

    socketInstance.on('call-ended', (data) => {
      console.log('📞 Call ended:', data);
      setCurrentCall(null);
      setIncomingCall(null);
      stopRingtone();
    });

    socketInstance.on('call-failed', (data) => {
      console.log('❌ Call failed:', data);
      setCurrentCall(null);
      alert(`Call failed: ${data.reason}`);
    });

    // Doctor status events
    socketInstance.on('doctor-status-changed', (data) => {
      console.log('👨‍⚕️ Doctor status changed:', data);
      setOnlineDoctors(prev => {
        const newSet = new Set(prev);
        if (data.isOnline) {
          newSet.add(data.doctorId);
        } else {
          newSet.delete(data.doctorId);
        }
        return newSet;
      });
    });

    socketInstance.on('user-registered', (data) => {
      console.log('✅ User registration confirmed:', data);
    });

    socketInstance.on('registration-error', (error) => {
      console.error('❌ Registration error:', error);
    });

    return () => {
      console.log('🔌 Cleaning up socket connection');
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
      setIncomingCall(null);
      setCurrentCall(null);
    };
  }, [isSignedIn, user]);

  // Ringtone functions
  const playRingtone = () => {
    // You can add actual audio here
    console.log('🔊 Playing ringtone...');
  };

  const stopRingtone = () => {
    // Stop the ringtone
    console.log('🔇 Stopping ringtone...');
  };

  const registerUser = useCallback(async (userType) => {
    if (socket && isConnected && user && userType) {
      console.log('📝 Registering user:', user.id, 'as', userType);
      
      socket.emit('register-user', {
        userId: user.id,
        userType: userType,
        userName: user.fullName || user.firstName || 'User'
      });
    } else {
      console.warn('⚠️ Cannot register user - missing requirements:', {
        socket: !!socket,
        isConnected,
        user: !!user,
        userType
      });
    }
  }, [socket, isConnected, user]);

  const initiateCall = useCallback((targetUserId, targetUserName) => {
    if (socket && isConnected && user) {
      console.log('📞 Initiating call to:', targetUserId);
      socket.emit('initiate-call', {
        targetUserId,
        fromUserId: user.id,
        fromUserName: user.fullName || user.firstName || 'User',
        fromUserType: 'patient' // Assuming patient is calling doctor
      });
    } else {
      console.warn('⚠️ Cannot initiate call - socket not connected');
      alert('Not connected to server. Please refresh the page and try again.');
    }
  }, [socket, isConnected, user]);

  const acceptCall = useCallback(() => {
    if (socket && incomingCall && user) {
      console.log('✅ Accepting call:', incomingCall.callRoomId);
      socket.emit('call-response', {
        callRoomId: incomingCall.callRoomId,
        response: 'accept',
        userId: user.id
      });
    }
  }, [socket, incomingCall, user]);

  const rejectCall = useCallback(() => {
    if (socket && incomingCall && user) {
      console.log('❌ Rejecting call:', incomingCall.callRoomId);
      socket.emit('call-response', {
        callRoomId: incomingCall.callRoomId,
        response: 'reject',
        userId: user.id
      });
      setIncomingCall(null);
      stopRingtone();
    }
  }, [socket, incomingCall, user]);

  const endCall = useCallback(() => {
    if (socket && (currentCall || incomingCall) && user) {
      const callRoomId = currentCall?.callRoomId || incomingCall?.callRoomId;
      console.log('📞 Ending call:', callRoomId);
      socket.emit('end-call', {
        callRoomId,
        userId: user.id
      });
      setCurrentCall(null);
      setIncomingCall(null);
      stopRingtone();
    }
  }, [socket, currentCall, incomingCall, user]);

  const value = {
    socket,
    isConnected,
    onlineDoctors,
    incomingCall,
    currentCall,
    registerUser,
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

// Custom hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export { SocketContext };
