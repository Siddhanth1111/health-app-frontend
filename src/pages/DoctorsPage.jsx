import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useSocket } from '../context/SocketContext';
import ApiService from '../services/api';
import Loading from '../components/common/Loading';

// ... existing imports and code ...

const handleVideoCall = async (doctor) => {
  try {
    console.log('📞 Initiating video call with:', doctor.name);
    console.log('👨‍⚕️ Doctor data:', doctor);
    
    if (!isConnected) {
      alert('Not connected to server. Please refresh the page and try again.');
      return;
    }
    
    // Use the doctor's database ID (_id) not their Clerk ID
    const doctorId = doctor._id;
    
    console.log('📋 Using doctor ID:', doctorId);
    
    // Navigate to call page with doctor ID
    navigate(`/call/${doctorId}`);
    
    // Also initiate the call through socket
    initiateCall(doctorId, doctor.name);
    
  } catch (error) {
    console.error('❌ Error initiating call:', error);
    alert('Failed to start video call. Please try again.');
  }
};

// ... rest of your existing DoctorsPage code ...


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

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading doctors...');
      const doctorsData = await ApiService.getDoctors();
      console.log('👨‍⚕️ Doctors loaded:', doctorsData);
      
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
    } catch (err) {
      console.error('❌ Error loading doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialties = async () => {
    try {
      const specialtiesData = await ApiService.getDoctorSpecialties();
      setSpecialties(specialtiesData);
    } catch (err) {
      console.error('❌ Error loading specialties:', err);
    }
  };

  const filterAndSortDoctors = () => {
    let filtered = [...doctors];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doctor.bio && doctor.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }

    // Sort doctors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experience':
          return (b.experience || 0) - (a.experience || 0);
        case 'fee':
          return (a.consultationFee || 0) - (b.consultationFee || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  };

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

  const handleBookConsultation = async (doctor) => {
    try {
      const token = await getToken();
      
      // For now, just show an alert. You can implement booking logic later
      alert(`Booking consultation with ${doctor.name}. This feature is coming soon!`);
      
    } catch (error) {
      console.error('❌ Error booking consultation:', error);
      alert('Failed to book consultation. Please try again.');
    }
  };

  if (loading) return <Loading message="Loading doctors..." />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDoctors}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Doctors</h1>
            <p className="text-gray-600">Find and connect with verified medical professionals</p>
          </div>
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Video calls available' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search doctors, specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Specialty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="fee">Lowest Fee</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </p>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Doctor Header */}
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=4f46e5&color=fff&size=150`}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full border-4 border-blue-100"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {doctor.rating || 4.5} ({doctor.totalReviews || 0} reviews)
                        </span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${doctor.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-500">
                        {doctor.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{doctor.experience || 0} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="font-medium text-green-600">${doctor.consultationFee || 0}</span>
                  </div>
                  {doctor.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleVideoCall(doctor)}
                    disabled={!isConnected}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      isConnected
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    📹 Video Call
                  </button>
                  <button
                    onClick={() => handleBookConsultation(doctor)}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    📅 Book
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-1 text-center">
                    Connecting... refresh page if issues persist
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👨‍⚕️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No doctors found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedSpecialty !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'No doctors are available at the moment'}
          </p>
          <button
            onClick={loadDoctors}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
