import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const VideoCallRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, endCall, currentCall } = useSocket();
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const localStreamRef = useRef();
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    initializeCall();
    setupSocketListeners();

    return () => {
      cleanup();
    };
  }, [socket, roomId]);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        console.log('📹 Received remote stream');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-signal', {
            roomId,
            type: 'ice-candidate',
            signal: event.candidate
          });
        }
      };

      // Handle connection state
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true);
        }
      };

      // Create and send offer (first person to join)
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socket.emit('webrtc-signal', {
        roomId,
        type: 'offer',
        signal: offer
      });

    } catch (error) {
      console.error('❌ Error initializing call:', error);
      alert('Could not access camera/microphone');
    }
  };

  const setupSocketListeners = () => {
    socket.on('webrtc-signal', handleWebRTCSignal);
    socket.on('call-ended', () => {
      cleanup();
      navigate('/dashboard');
    });
  };

  const handleWebRTCSignal = async (data) => {
    const { type, signal } = data;
    const peerConnection = peerConnectionRef.current;

    try {
      switch (type) {
        case 'offer':
          await peerConnection.setRemoteDescription(signal);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit('webrtc-signal', {
            roomId,
            type: 'answer',
            signal: answer
          });
          break;

        case 'answer':
          await peerConnection.setRemoteDescription(signal);
          break;

        case 'ice-candidate':
          await peerConnection.addIceCandidate(signal);
          break;
      }
    } catch (error) {
      console.error('❌ WebRTC signal error:', error);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    cleanup();
    endCall();
    navigate('/dashboard');
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  if (!currentCall) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Loading call...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            Video Call {isConnected ? '- Connected' : '- Connecting...'}
          </h1>
          <div className="text-sm">
            Room: {roomId}
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex">
        {/* Remote Video */}
        <div className="flex-1 relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-gray-800"
          />
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
            {currentCall.participants?.doctor?.name || currentCall.participants?.patient?.name || 'Remote'}
          </div>
        </div>

        {/* Local Video */}
        <div className="w-1/4 relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover bg-gray-700 border-2 border-gray-600"
          />
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-6">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${isAudioOn ? 'bg-gray-600' : 'bg-red-600'} hover:opacity-80`}
          >
            {isAudioOn ? '🎤' : '🔇'}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-600' : 'bg-red-600'} hover:opacity-80`}
          >
            {isVideoOn ? '📹' : '📵'}
          </button>
          
          <button
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallRoom;
