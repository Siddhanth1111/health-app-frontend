import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useSocket } from '../context/SocketContext'; // Just use the hook
import ApiService from '../services/api';
import Loading from '../components/common/Loading';

// DoctorsPage Component (no SocketProvider needed)
const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [specialties, setSpecialties] = useState([]);

  const { getToken } = useAuth();
  const { initiateCall, isConnected } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctors();
    loadSpecialties();
  }, []);

  useEffect(() => {
    filterAndSortDoctors();
  }, [doctors, searchTerm, selectedSpecialty, sortBy]);

  // ... rest of your existing DoctorsPage code stays the same

  const handleVideoCall = async (doctor) => {
    try {
      console.log('📞 Initiating video call with:', doctor.name);
      
      if (!isConnected) {
        alert('Not connected to server. Please refresh the page and try again.');
        return;
      }
      
      // Navigate to call page with doctor ID
      navigate(`/call/${doctor._id}`);
      
      // Also initiate the call through socket
      initiateCall(doctor._id, doctor.name);
      
    } catch (error) {
      console.error('❌ Error initiating call:', error);
      alert('Failed to start video call. Please try again.');
    }
  };

  // ... rest of your component code (loadDoctors, filterAndSortDoctors, etc.)

  // Your existing return JSX stays the same
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... your existing JSX */}
    </div>
  );
};

export default DoctorsPage;
