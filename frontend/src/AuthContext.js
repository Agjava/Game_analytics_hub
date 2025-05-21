import React, { createContext, useContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import api from './api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false); // For OAuth callback processing
  const [error, setError] = useState(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // setLoading(true); // Already true by default, or set it if you move initial state to false
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Check if token is expired
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expired
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        
        // Get user data
        const response = await api.get('/auth/user');
        setUser(response.data);
      } catch (err) {
        console.error('Auth error:', err);
        localStorage.removeItem('token');
        setError('Authentication failed. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Handle OAuth callback
  const handleAuthCallback = async (token) => { // Make it async
    if (token) {
      setIsAuthenticating(true);
      localStorage.setItem('token', token);
      try {
        // Fetch user data
        const response = await api.get('/auth/user');
        setUser(response.data);
        setError(null);
        setIsAuthenticating(false);
        return true; // Indicate success
      } catch (err) {
        console.error('Error fetching user data after callback:', err);
        setError('Failed to fetch user data after login.');
        localStorage.removeItem('token'); // Important: clear token if user fetch fails
        setUser(null);                    // Ensure user is null
        setIsAuthenticating(false);
        return false; // Indicate failure
      }
    }
    // No token provided
    setIsAuthenticating(false);
    return false;
  };

  // Logout
  const logout = () => {
    setIsAuthenticating(false); // Reset this state on logout too
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticating,
    error,
    isAuthenticated: !!user,
    handleAuthCallback,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
