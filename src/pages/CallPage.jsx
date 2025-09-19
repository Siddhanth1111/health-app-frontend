import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useSocket } from '../context/SocketContext';
import ApiService from '../services/api';
import VideoCall from '../components/video/VideoCall';
import Loading from '../components/common/Loading';

const CallPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { socket } = useSocket();
  const [doctor, setDoctor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCallData();
  }, [doctorId]);

  const loadCallData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Load doctor details
      const doctorData = await ApiService.getDoctorById(doctorId, token);
      setDoctor(doctorData);
      
      // Load current user profile
      const userData = await ApiService.getCurrentUser(token);
      setCurrentUser(userData);
      
    } catch (err) {
      console.error('❌ Error loading call data:', err);
      setError('Failed to load call information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCallEnd = () => {
    navigate('/doctors');
  };

  if (loading) return <Loading message="Preparing video call..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Call Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/doctors')}
              className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Back to Doctors
            </button>
            <button
              onClick={loadCallData}
              className="w-full px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👨‍⚕️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Doctor Not Found</h2>
          <button
            onClick={() => navigate('/doctors')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  // Only allow patients to call doctors
  if (currentUser.userType !== 'patient') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-yellow-500 text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Only patients can initiate calls with doctors.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoCall
      currentUser={currentUser}
      targetUser={doctor}
      socket={socket}
      onCallEnd={handleCallEnd}
    />
  );
};

export default CallPage;
