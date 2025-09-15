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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Test backend connection
  async testConnection() {
    return this.request('/test');
  }

  // User related APIs
  async getUsers() {
    return this.request('/users');
  }

  async getUserById(userId) {
    return this.request(`/users/me/${userId}`);
  }

  async seedUsers() {
    return this.request('/users/seed', { method: 'POST' });
  }
}

export default new ApiService();
