import React, { useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';

const IncomingCallModal = () => {
  const { incomingCall, acceptCall, rejectCall } = useSocket();

  useEffect(() => {
    if (incomingCall) {
      // Request permission for notifications
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Incoming call from ${incomingCall.fromUserName}`, {
          body: `${incomingCall.fromUserType} is calling you`,
          icon: '/favicon.ico',
          requireInteraction: true
        });
      }
    }
  }, [incomingCall]);

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-pulse">
        {/* Caller Avatar */}
        <div className="mb-6">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(incomingCall.fromUserName)}&background=10b981&color=fff&size=120`}
            alt={incomingCall.fromUserName}
            className="w-24 h-24 rounded-full mx-auto border-4 border-green-400"
          />
        </div>

        {/* Call Info */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Incoming Call
          </h3>
          <p className="text-lg font-medium text-blue-600 mb-1">
            {incomingCall.fromUserName}
          </p>
          <p className="text-sm text-gray-500 capitalize">
            {incomingCall.fromUserType}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(incomingCall.timestamp).toLocaleTimeString()}
          </p>
        </div>

        {/* Ringing Animation */}
        <div className="mb-6">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Ringing...</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 justify-center">
          <button
            onClick={rejectCall}
            className="flex items-center justify-center w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            onClick={acceptCall}
            className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-lg animate-pulse"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-500">
          <span>Decline</span>
          <span>Accept</span>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
