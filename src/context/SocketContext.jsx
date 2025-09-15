import React, { createContext, useState, useEffect, useCallback } from 'react';
import SocketService from '../services/socket';
import { useAuth } from '../hooks/useAuth';
import { SOCKET_EVENTS } from '../utils/constants';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const socketInstance = SocketService.connect();
    setSocket(socketInstance);

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      
      // Register user if logged in
      if (currentUser) {
        socketInstance.emit(SOCKET_EVENTS.REGISTER_USER, currentUser._id);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    // User status events
    socketInstance.on(SOCKET_EVENTS.USER_STATUS_CHANGED, (data) => {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === data.userId 
            ? { ...user, isOnline: data.isOnline }
            : user
        )
      );
    });

    return () => {
      SocketService.disconnect();
    };
  }, [currentUser]);

  const registerUser = useCallback((userId) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.REGISTER_USER, userId);
    }
  }, [socket, isConnected]);

  const initiateCall = useCallback((targetUserId, fromUserName) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.INITIATE_CALL, {
        targetUserId,
        fromUserName
      });
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    users,
    setUsers,
    registerUser,
    initiateCall
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext };
