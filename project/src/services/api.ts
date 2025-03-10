import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api', // Use environment variable if available
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to prevent long-hanging requests
  timeout: 5000,
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if error is a timeout
    if (error.code === 'ECONNABORTED') {
      console.log('Request timed out');
    }
    
    // Check if error is a network error (no connection to server)
    if (error.message === 'Network Error') {
      console.log('Network error - server may be down or unreachable');
    }
    
    if (error.response) {
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;