import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from './api';
import { useAuth } from './AuthContext';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [userFeedback, setUserFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For profile update
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user feedback
        const feedbackResponse = await api.get('/feedback/user');
        setUserFeedback(feedbackResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h1 className="mb-4">Your Profile</h1>
      
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <div className="text-center mb-3">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="rounded-circle"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <span className="text-white" style={{ fontSize: '2rem' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h4 className="mt-3">{user.name}</h4>
                <p className="text-muted">{user.email}</p>
              </div>
              
              <div className="mb-3">
                <strong>Account Type:</strong> {user.role === 'admin' ? 'Administrator' : 'User'}
              </div>
              
              <div className="mb-3">
                <strong>Login Provider:</strong> {user.authProvider.charAt(0).toUpperCase() + user.authProvider.slice(1)}
              </div>
              
              <div className="mb-3">
                <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </div>
              
              <div className="mb-3">
                <strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleDateString()}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Your Game Reviews</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {userFeedback.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {userFeedback.map(feedback => (
                    <Card key={feedback._id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="mb-0">
                            <a href={`/games/${feedback.gameId?._id}`} className="text-decoration-none">
                              {feedback.gameId?.title || 'Game'}
                            </a>
                          </h5>
                          <span className="badge bg-primary">{feedback.rating}/10</span>
                        </div>
                        
                        {feedback.platform && (
                          <div className="mb-2">
                            <small className="text-muted">
                              Platform: {feedback.platform}
                            </small>
                          </div>
                        )}
                        
                        {feedback.review ? (
                          <p className="mb-1">{feedback.review}</p>
                        ) : (
                          <p className="text-muted mb-1">No written review</p>
                        )}
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </small>
                          
                          <div>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              href={`/games/${feedback.gameId?._id}`}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert variant="info">
                  You haven't submitted any reviews yet. Browse games and share your feedback!
                </Alert>
              )}
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h4>Account Settings</h4>
            </Card.Header>
            <Card.Body>
              <p>
                Your account is managed through {user.authProvider.charAt(0).toUpperCase() + user.authProvider.slice(1)} OAuth.
                Profile information is synchronized during login.
              </p>
              
              <Alert variant="info">
                To update your profile information or change your password, please visit your 
                {user.authProvider === 'google' ? ' Google ' : ' GitHub '} 
                account settings.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
