import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { io } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '../utils/constants';

// Create the context
const SocketContext = createContext();

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineDoctors, setOnlineDoctors] = useState(new Set());
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;

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
      console.log('🔌 Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    // Doctor status events
    socketInstance.on(SOCKET_EVENTS.DOCTOR_STATUS_CHANGED, (data) => {
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
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isSignedIn]);

  const registerUser = useCallback(async (userType) => {
    if (socket && isConnected && user && userType) {
      console.log('📝 Registering user:', user.id, 'as', userType);
      
      // Send the correct data structure
      socket.emit(SOCKET_EVENTS.REGISTER_USER, {
        userId: user.id,  // This is the Clerk user ID
        userType: userType  // 'patient' or 'doctor'
      });
    } else {
      console.warn('⚠️ Cannot register user:', {
        socket: !!socket,
        isConnected,
        user: !!user,
        userType
      });
    }
  }, [socket, isConnected, user]);

  const initiateCall = useCallback((targetUserId, fromUserName) => {
    if (socket && isConnected) {
      console.log('📞 Initiating call to:', targetUserId);
      socket.emit(SOCKET_EVENTS.INITIATE_CALL, {
        targetUserId,
        fromUserName
      });
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    onlineDoctors,
    registerUser,
    initiateCall
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

// Export the context
export { SocketContext };
