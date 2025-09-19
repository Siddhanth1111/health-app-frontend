import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useSocket } from '../context/SocketContext';
import ApiService from '../services/api';
import Loading from '../components/common/Loading';

const DashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { getToken } = useAuth();
  const { user } = useUser();
  const { registerUser, isConnected } = useSocket();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    // Register with socket once profile is loaded and user type is confirmed
    if (profile && isConnected && profile.userType) {
      console.log('🔌 Registering with socket as:', profile.userType);
      registerUser(profile.userType);
    }
  }, [profile, isConnected, registerUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      
      // Load user profile first
      console.log('📡 Loading user profile...');
      const profileData = await ApiService.getCurrentUser(token);
      console.log('👤 Profile loaded:', profileData);
      
      setProfile(profileData);
      
      // Only load consultations if user has a complete profile
      if (profileData.userType) {
        console.log('📅 Loading consultations...');
        try {
          const consultationsData = await ApiService.getConsultations(token);
          setRecentConsultations(consultationsData.slice(0, 5));
          console.log('📅 Consultations loaded:', consultationsData.length);
        } catch (consultationError) {
          console.warn('⚠️ Could not load consultations:', consultationError);
          // Don't fail the whole dashboard if consultations fail
          setRecentConsultations([]);
        }
      }
      
    } catch (err) {
      console.error('❌ Error loading dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading your dashboard..." />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If user needs onboarding, redirect them
  if (!profile || profile.needsOnboarding || !profile.userType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">Complete Your Profile</h2>
          <p className="text-yellow-700 mb-4">Please complete your profile to access the dashboard.</p>
          <Link 
            to="/onboarding"
            className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Complete Profile
          </Link>
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
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {user?.firstName || profile.name || 'User'}!
            </h1>
            <p className="text-gray-600">
              {profile.userType === 'patient' ? 
                'Manage your health consultations' : 
                'Manage your medical practice'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <img
              src={user?.imageUrl || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=10b981&color=fff&size=150`}
              alt={user?.fullName || profile.name || 'User'}
              className="w-16 h-16 rounded-full border-4 border-blue-100"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.userType === 'doctor' ? 'Dr. ' : ''}{user?.fullName || profile.name || 'User'}
              </h2>
              <p className="text-gray-600">{user?.primaryEmailAddress?.emailAddress || profile.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profile.userType === 'patient' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {profile.userType === 'patient' ? 'Patient' : `${profile.specialty || 'Doctor'} Specialist`}
                </span>
                {profile.userType === 'doctor' && profile.experience && (
                  <span className="text-sm text-gray-500">{profile.experience} years experience</span>
                )}
              </div>
            </div>
            <Link
              to="/profile"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {profile.userType === 'patient' && (
          <>
            <Link
              to="/doctors"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors transform hover:scale-105"
            >
              <div className="text-3xl mb-3">👨‍⚕️</div>
              <h3 className="text-xl font-semibold mb-2">Browse Doctors</h3>
              <p className="text-blue-100">Find and consult with specialists</p>
            </Link>

            <Link
              to="/consultations"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors transform hover:scale-105"
            >
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-xl font-semibold mb-2">My Consultations</h3>
              <p className="text-green-100">View your appointment history</p>
            </Link>
          </>
        )}

        {profile.userType === 'doctor' && (
          <>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-xl font-semibold mb-2">Patients Today</h3>
              <p className="text-2xl font-bold">{recentConsultations.length}</p>
            </div>

            <Link
              to="/consultations"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors transform hover:scale-105"
            >
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-xl font-semibold mb-2">Appointments</h3>
              <p className="text-blue-100">Manage your schedule</p>
            </Link>
          </>
        )}

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="text-3xl mb-3">⭐</div>
          <h3 className="text-xl font-semibold mb-2">
            {profile.userType === 'patient' ? 'Health Score' : 'Rating'}
          </h3>
          <p className="text-2xl font-bold">
            {profile.userType === 'patient' ? 'Excellent' : `${profile.rating || 0}/5`}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Recent Consultations</h3>
            <Link
              to="/consultations"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {recentConsultations.length > 0 ? (
            <div className="space-y-4">
              {recentConsultations.map((consultation) => (
                <div key={consultation._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={profile.userType === 'patient' ? consultation.doctor?.avatar : consultation.patient?.avatar}
                      alt="Profile"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium">
                        {profile.userType === 'patient' ? 
                          `Dr. ${consultation.doctor?.name || 'Unknown Doctor'}` : 
                          consultation.patient?.name || 'Unknown Patient'
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(consultation.scheduledAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                      consultation.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {consultation.status || 'scheduled'}
                    </span>
                    <span className="text-sm text-gray-500">${consultation.fee || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📅</div>
              <p className="text-gray-500">
                {profile.userType === 'patient' ? 
                  'No consultations yet. Browse doctors to get started!' :
                  'No consultations scheduled yet.'
                }
              </p>
              {profile.userType === 'patient' && (
                <Link
                  to="/doctors"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Browse Doctors
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
