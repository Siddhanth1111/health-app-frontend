import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { initiateCall, isConnected, onlineDoctors } = useSocket();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/doctors');
      const doctorsData = await response.json();
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoCall = (doctor) => {
    if (!isConnected) {
      alert('Not connected to server. Please refresh and try again.');
      return;
    }
    
    console.log('Starting call with doctor:', doctor._id);
    initiateCall(doctor._id, doctor.name);
  };

  if (loading) return <div className="p-8">Loading doctors...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Doctors</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {doctor.name[0]}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">{doctor.name}</h3>
                <p className="text-gray-600">{doctor.specialty}</p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    onlineDoctors.has(doctor._id) ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm text-gray-500">
                    {onlineDoctors.has(doctor._id) ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm"><strong>Experience:</strong> {doctor.experience} years</p>
              <p className="text-sm"><strong>Fee:</strong> ${doctor.consultationFee}</p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleVideoCall(doctor)}
                disabled={!onlineDoctors.has(doctor._id) || !isConnected}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  onlineDoctors.has(doctor._id) && isConnected
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                📹 Video Call
              </button>
              <button className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                📅 Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsPage;
