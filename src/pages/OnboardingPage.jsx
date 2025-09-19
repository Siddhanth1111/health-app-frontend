import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import ApiService from '../services/api';
import { DOCTOR_SPECIALTIES } from '../utils/constants';

const OnboardingPage = () => {
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser(); // This contains the actual user ID
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Pre-fill form with Clerk user data
  useEffect(() => {
    if (user && step === 2) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.primaryEmailAddress?.emailAddress || '',
        phone: user.primaryPhoneNumber?.phoneNumber || ''
      }));
    }
  }, [user, step]);

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setStep(2);
    setError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('User not loaded. Please refresh and try again.');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Starting profile creation...');
      console.log('👤 Clerk User:', user.id); // This is the actual user ID, not JWT
      console.log('📝 Form data:', formData);
      
      // Get the Clerk token for API authentication
      const token = await getToken();
      console.log('🔐 Got token for API authentication');
      
      if (!token) {
        throw new Error('Failed to get authentication token. Please sign in again.');
      }

      // Test backend connection first
      try {
        await ApiService.testConnection();
        console.log('✅ Backend connection successful');
      } catch (backendError) {
        console.error('❌ Backend connection failed:', backendError);
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
      }
      
      let result;
      if (userType === 'patient') {
        console.log('👨‍⚕️ Creating patient profile...');
        result = await ApiService.updatePatientProfile(formData, token);
      } else {
        console.log('🩺 Creating doctor profile...');
        result = await ApiService.updateDoctorProfile(formData, token);
      }
      
      console.log('✅ Profile created successfully:', result);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('❌ Profile creation error:', error);
      
      if (error.message.includes('401')) {
        setError('Authentication failed. Please sign out and sign in again.');
      } else if (error.message.includes('Cannot connect')) {
        setError('Server connection failed. Please ensure the backend is running on port 3000.');
      } else {
        setError(error.message || 'Failed to create profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not signed in
  if (!isSignedIn) {
    return null;
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to MedConsult</h1>
            <p className="text-gray-600">Let's set up your profile</p>
            <p className="text-sm text-gray-500 mt-2">
              Signed in as: {user?.primaryEmailAddress?.emailAddress}
            </p>
            <p className="text-xs text-gray-400">
              User ID: {user?.id}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6 text-center">I am a...</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <button
                onClick={() => handleUserTypeSelection('patient')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">🤒</div>
                  <div>
                    <div className="font-semibold text-lg">Patient</div>
                    <div className="text-gray-600 text-sm">I want to consult with doctors</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUserTypeSelection('doctor')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">👨‍⚕️</div>
                  <div>
                    <div className="font-semibold text-lg">Doctor</div>
                    <div className="text-gray-600 text-sm">I want to provide medical consultations</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {userType === 'patient' ? 'Patient Profile' : 'Doctor Profile'}
          </h1>
          <p className="text-gray-600">Please provide your information</p>
          <p className="text-sm text-gray-500 mt-2">
            Signed in as: {user?.primaryEmailAddress?.emailAddress}
          </p>
          <p className="text-xs text-gray-400">
            User ID: {user?.id}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">⚠️</div>
                <div>
                  <p className="text-red-800 font-semibold">Error creating profile</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Common Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Patient-specific fields */}
            {userType === 'patient' && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </>
            )}

            {/* Doctor-specific fields */}
            {userType === 'doctor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
                  <select
                    name="specialty"
                    value={formData.specialty || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Specialty</option>
                    {DOCTOR_SPECIALTIES.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                    <input
                      type="number"
                      name="experience"
                      min="0"
                      max="50"
                      value={formData.experience || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee ($) *</label>
                    <input
                      type="number"
                      name="consultationFee"
                      min="0"
                      value={formData.consultationFee || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    rows="4"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell patients about yourself, your expertise, and approach to medicine..."
                  />
                </div>
              </>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Profile...</span>
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
