import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from './api';

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  const handleGithubLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/github`;
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header as="h4" className="text-center">Login</Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger">{error}</Alert>
              )}
              
              <p className="text-center mb-4">
                Sign in with your social media account to access game analytics and share your feedback.
              </p>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="danger" 
                  size="lg" 
                  onClick={handleGoogleLogin}
                  className="mb-3"
                >
                  <i className="bi bi-google me-2"></i> Sign in with Google
                </Button>
                
                <Button 
                  variant="dark" 
                  size="lg" 
                  onClick={handleGithubLogin}
                >
                  <i className="bi bi-github me-2"></i> Sign in with GitHub
                </Button>
              </div>
              
              <div className="text-center mt-4">
                <p>
                  Don't have an account? Accounts are automatically created when you sign in.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
