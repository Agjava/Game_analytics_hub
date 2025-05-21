import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Common practice is to use 'Authorization': `Bearer ${token}`
      // or 'x-auth-token': token. Let's use Bearer token.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor to handle global errors like 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Example: Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      // Ensure window.location is available (it is in browser environments)
      if (typeof window !== 'undefined') {
        // You might want to redirect to a login page, e.g.:
        // window.location.href = '/login';
        console.warn('Unauthorized request or token expired. User may need to login again.');
      }
    }
    return Promise.reject(error);
  }
);

export default api; 