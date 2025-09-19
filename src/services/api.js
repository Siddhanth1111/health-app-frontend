import { API_BASE_URL } from '../utils/constants';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
      if (options.body) {
        console.log('📦 Request body:', options.body);
      }
      
      const response = await fetch(url, config);
      
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      
      // Get response text first
      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);
      
      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} -`, responseData);
        throw new Error(`HTTP ${response.status}: ${responseData.error || responseText}`);
      }
      
      return responseData;
    } catch (error) {
      console.error(`❌ API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Test backend connection
  async testConnection() {
    return this.request('/test');
  }

  // Test database operations
  async testCreatePatient() {
    return this.request('/test/create-test-patient', { method: 'POST' });
  }

  async getAllPatients() {
    return this.request('/test/all-patients');
  }

  // User related APIs
  async getCurrentUser(token) {
    console.log('🔍 Getting current user with token:', token ? 'Present' : 'Missing');
    return this.request('/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async updatePatientProfile(profileData, token) {
    console.log('💾 Updating patient profile:', profileData);
    console.log('🔐 Using token:', token ? 'Present' : 'Missing');
    
    return this.request('/patients/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
  }

  // Doctor related APIs
  async getDoctors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/doctors${queryString ? `?${queryString}` : ''}`);
  }

  async getDoctorById(doctorId, token) {
    return this.request(`/doctors/${doctorId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getDoctorSpecialties() {
    return this.request('/doctors/specialties');
  }

  async seedDoctors(token) {
    return this.request('/doctors/seed', { 
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async updateDoctorProfile(profileData, token) {
    console.log('💾 Updating doctor profile:', profileData);
    console.log('🔐 Using token:', token ? 'Present' : 'Missing');
    
    return this.request('/doctors/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
  }

  // Consultation APIs
  async bookConsultation(consultationData, token) {
    return this.request('/consultations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(consultationData)
    });
  }

  async getConsultations(token) {
    return this.request('/consultations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

export default new ApiService();
