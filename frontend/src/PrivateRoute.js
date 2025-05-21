import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap'; // For consistency

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, isAuthenticating } = useAuth();

  if (loading || isAuthenticating) { // Check both initial loading and OAuth callback processing
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
