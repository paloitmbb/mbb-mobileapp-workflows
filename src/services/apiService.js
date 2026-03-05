import { API_URLS, ENVIRONMENTS } from '../constants/appConstants';
import { getConfig } from '../config/appConfig';

const config = getConfig();

/**
 * Base API service for making network requests
 */
class ApiService {
  constructor() {
    this.baseUrl = API_URLS[config.environment] || API_URLS.SIT;
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }
}

export default new ApiService();
