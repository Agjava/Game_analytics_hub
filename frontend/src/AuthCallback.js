import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from './AuthContext';

const AuthCallback = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const processToken = async () => {
      const params = new URLSearchParams(search);
      const token = params.get('token');
      
      if (token) {
        const success = await handleAuthCallback(token);
        if (success) {
          navigate('/dashboard', { replace: true });
        } else {
          // AuthContext might set a more specific error, or use a generic one here
          setError('Authentication failed. Please try logging in again.');
          setProcessing(false);
          // Optionally navigate to login after a delay
          // setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } else {
        setError('Authentication token not found.');
        setProcessing(false);
        // navigate('/login', { replace: true }); // Or redirect after showing error
      }
    };
    
    processToken();
  }, [search, handleAuthCallback, navigate]);
  
  if (error) {
    return (
      <Container className="text-center my-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate('/login', { replace: true })}>Go to Login</Button>
      </Container>
    );
  }

  return (
    <Container className="text-center my-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="mt-3">Completing authentication...</p>
    </Container>
  );
};

export default AuthCallback;
