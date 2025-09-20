import React from 'react';
import { useSocket } from '../../context/SocketContext';

const IncomingCallModal = () => {
  const { incomingCall, acceptCall, rejectCall } = useSocket();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        {/* Avatar */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {incomingCall.callerName[0]}
            </span>
          </div>
        </div>

        {/* Call info */}
        <h3 className="text-xl font-semibold mb-2">Incoming Call</h3>
        <p className="text-gray-600 mb-6">{incomingCall.callerName}</p>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => rejectCall(incomingCall.callId)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium"
          >
            Decline
          </button>
          <button
            onClick={() => acceptCall(incomingCall.callId)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
