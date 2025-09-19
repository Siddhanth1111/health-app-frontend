import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { io } from 'socket.io-client';
import ApiService from '../services/api';

// Get socket URL from environment
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Create the context
const SocketContext = createContext({
  socket: null,
  isConnected: false,
  isRegistered: false,
  onlineDoctors: new Set(),
  incomingCall: null,
  currentCall: null,
  userType: null,
  userData: null,
  registerUser: () => {},
  initiateCall: () => {},
  acceptCall: () => {},
  rejectCall: () => {},
  endCall: () => {},
  // WebRTC helpers for VideoCall component
  emitWebRTC: () => {}
});

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [onlineDoctors, setOnlineDoctors] = useState(new Set());
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  // Initialize socket connection and user registration
  useEffect(() => {
    const initializeSocket = async () => {
      if (!isSignedIn || !user) {
        if (socket) {
          console.log('🔌 Disconnecting socket - user not signed in');
          socket.disconnect();
          setSocket(null);
          setIsConnected(false);
          setIsRegistered(false);
          setUserType(null);
          setUserData(null);
          setIncomingCall(null);
          setCurrentCall(null);
        }
        return;
      }

      try {
        // Get user profile to determine user type
        console.log('👤 Getting user profile...');
        const token = await getToken();
        let userProfile;
        
        try {
          userProfile = await ApiService.getCurrentUser(token);
          console.log('📋 User profile loaded:', userProfile);
        } catch (err) {
          console.warn('Could not load user profile:', err);
          // Create basic user data from Clerk user
          userProfile = {
            _id: user.id,
            name: user.fullName || user.firstName || 'User',
            email: user.emailAddresses?.[0]?.emailAddress || '',
            avatar: user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=4f46e5&color=fff&size=150`,
            userType: 'patient', // Default assumption
            clerkUserId: user.id
          };
        }
        
        setUserData(userProfile);
        setUserType(userProfile.userType);

        if (userProfile.needsOnboarding) {
          console.log('⚠️ User needs onboarding, skipping socket connection');
          return;
        }

        // Connect to socket
        console.log('🔌 Connecting to socket:', SOCKET_URL);
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
          
          // Auto-register user when connected
          if (userProfile.userType && !isRegistered) {
            console.log('📝 Auto-registering user:', userProfile.userType);
            socketInstance.emit('register-user', {
              userId: user.id,
              userType: userProfile.userType,
              userName: userProfile.name || user.fullName || user.firstName || 'User'
            });
          }
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason);
          setIsConnected(false);
          setIsRegistered(false);
          setIncomingCall(null);
          setCurrentCall(null);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          setIsConnected(false);
          setIsRegistered(false);
        });

        // Registration events
        socketInstance.on('user-registered', (data) => {
          console.log('✅ User registration confirmed:', data);
          setIsRegistered(true);
        });

        socketInstance.on('registration-error', (error) => {
          console.error('❌ Registration error:', error);
          setIsRegistered(false);
        });

        // Call-related events
        socketInstance.on('incoming-call', (data) => {
          console.log('📞 Incoming call received:', data);
          setIncomingCall(data);
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
          
          // Navigate to call room
          const callRoomId = data.callRoomId;
          console.log('📱 Navigating to call room:', callRoomId);
          
          // Use window.location for guaranteed navigation
          window.location.href = `/call-room/${callRoomId}`;
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
          
          // Navigate away from call room
          if (window.location.pathname.includes('/call-room/')) {
            window.location.href = '/dashboard';
          }
        });

        socketInstance.on('call-failed', (data) => {
          console.log('❌ Call failed:', data);
          setCurrentCall(null);
          alert(`Call failed: ${data.reason}`);
        });

        // WebRTC signaling events (for VideoCall component)
        socketInstance.on('calling', (data) => {
          console.log('📞 WebRTC calling event received:', data);
          // This will be handled by the VideoCall component directly
          // The event is already forwarded to the component via the socket prop
        });

        socketInstance.on('user-not-available', (data) => {
          console.log('❌ User not available for WebRTC:', data);
          alert('User is not available for video call');
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

        // Error handling
        socketInstance.on('error', (error) => {
          console.error('❌ Socket error:', error);
        });

        // Handle socket reconnection
        socketInstance.on('reconnect', () => {
          console.log('🔄 Socket reconnected');
          // Re-register user on reconnection
          if (userProfile.userType) {
            socketInstance.emit('register-user', {
              userId: user.id,
              userType: userProfile.userType,
              userName: userProfile.name || user.fullName || user.firstName || 'User'
            });
          }
        });

      } catch (error) {
        console.error('❌ Error initializing socket:', error);
      }
    };

    initializeSocket();

    // Cleanup on unmount or dependency change
    return () => {
      if (socket) {
        console.log('🔌 Cleaning up socket connection');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setIsRegistered(false);
        setIncomingCall(null);
        setCurrentCall(null);
      }
    };
  }, [isSignedIn, user?.id]); // Only depend on sign-in status and user ID

  // Ringtone functions
  const playRingtone = useCallback(() => {
    console.log('🔊 Playing ringtone...');
    // You can implement actual audio playback here
    // Example:
    // const audio = new Audio('/ringtone.mp3');
    // audio.loop = true;
    // audio.play().catch(console.warn);
  }, []);

  const stopRingtone = useCallback(() => {
    console.log('🔇 Stopping ringtone...');
    // Stop the ringtone audio here
  }, []);

  // Manual user registration (if needed)
  const registerUser = useCallback(async (forceUserType = null) => {
    if (socket && isConnected && user && (userType || forceUserType) && !isRegistered) {
      const typeToUse = forceUserType || userType;
      console.log('📝 Manually registering user:', user.id, 'as', typeToUse);
      
      socket.emit('register-user', {
        userId: user.id,
        userType: typeToUse,
        userName: userData?.name || user.fullName || user.firstName || 'User'
      });
    } else {
      console.warn('⚠️ Cannot register user - missing requirements:', {
        socket: !!socket,
        isConnected,
        user: !!user,
        userType: userType || forceUserType,
        isRegistered
      });
    }
  }, [socket, isConnected, user, userType, userData, isRegistered]);

  // Initiate a call
  const initiateCall = useCallback((targetUserId, targetUserName) => {
    if (socket && isConnected && user && isRegistered) {
      console.log('📞 Initiating call to:', targetUserId);
      socket.emit('initiate-call', {
        targetUserId,
        fromUserId: user.id,
        fromUserName: userData?.name || user.fullName || user.firstName || 'User',
        fromUserType: userType || 'patient'
      });
    } else {
      console.warn('⚠️ Cannot initiate call:', {
        socket: !!socket,
        isConnected,
        user: !!user,
        isRegistered
      });
      alert('Not connected to server. Please refresh the page and try again.');
    }
  }, [socket, isConnected, user, userType, userData, isRegistered]);

  // Accept an incoming call
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

  // Reject an incoming call
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
  }, [socket, incomingCall, user, stopRingtone]);

  // End a call
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
  }, [socket, currentCall, incomingCall, user, stopRingtone]);

  // Helper for VideoCall component to emit WebRTC events
  const emitWebRTC = useCallback((eventName, data) => {
    if (socket && isConnected) {
      console.log('📡 Emitting WebRTC event:', eventName, data);
      socket.emit(eventName, data);
    } else {
      console.warn('⚠️ Cannot emit WebRTC event - socket not connected');
    }
  }, [socket, isConnected]);

  // Helper to get current user data in format expected by VideoCall
  const getCurrentUserForVideoCall = useCallback(() => {
    if (!userData || !user) return null;
    
    return {
      _id: userData._id || user.id,
      name: userData.name || user.fullName || user.firstName || 'User',
      email: userData.email || user.emailAddresses?.[0]?.emailAddress || '',
      avatar: userData.avatar || user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=4f46e5&color=fff&size=150`,
      userType: userData.userType || 'patient'
    };
  }, [userData, user]);

  // Context value
  const value = {
    // Socket connection
    socket,
    isConnected: isConnected && isRegistered, // Only show connected when registered
    isRegistered,
    
    // User data
    userType,
    userData,
    getCurrentUserForVideoCall,
    
    // Doctor status
    onlineDoctors,
    
    // Call management
    incomingCall,
    currentCall,
    
    // Call actions
    registerUser,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    
    // WebRTC helper
    emitWebRTC,
    
    // Audio helpers
    playRingtone,
    stopRingtone
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

// Export context for direct access if needed
export { SocketContext };

// Default export
export default SocketProvider;
