import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge, Tab, Tabs } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [game, setGame] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState('');
  const [userPlatform, setUserPlatform] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        
        // Fetch game details
        const gameResponse = await api.get(`/games/${id}`);
        setGame(gameResponse.data);
        
        // Fetch game feedback
        const feedbackResponse = await api.get(`/feedback/game/${id}`);
        setFeedback(feedbackResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data');
        setLoading(false);
      }
    };

    fetchGameData();
  }, [id]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      await api.post('/feedback', {
        gameId: id,
        rating: userRating,
        review: userReview,
        platform: userPlatform
      });
      
      // Refresh feedback data
      const feedbackResponse = await api.get(`/feedback/game/${id}`);
      setFeedback(feedbackResponse.data);
      
      // Reset form
      setUserRating(5);
      setUserReview('');
      setUserPlatform('');
      setSubmitSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setSubmitError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare chart data
  const prepareRatingDistribution = () => {
    // Count ratings by score
    const ratingCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    feedback.forEach(item => {
      const rating = Math.floor(item.rating);
      if (rating >= 1 && rating <= 10) {
        ratingCounts[rating - 1]++;
      }
    });
    
    return {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      datasets: [
        {
          label: 'Number of Ratings',
          data: ratingCounts,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const preparePlatformDistribution = () => {
    // Count feedback by platform
    const platformCounts = {};
    
    feedback.forEach(item => {
      if (item.platform) {
        platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
      }
    });
    
    return {
      labels: Object.keys(platformCounts),
      datasets: [
        {
          label: 'Feedback by Platform',
          data: Object.values(platformCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/games')}>
          Back to Games
        </Button>
      </Container>
    );
  }

  if (!game) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Game not found</Alert>
        <Button variant="primary" onClick={() => navigate('/games')}>
          Back to Games
        </Button>
      </Container>
    );
  }

  // Calculate average rating
  const averageRating = feedback.length > 0
    ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
    : 0;

  return (
    <Container className="my-4">
      <Button variant="outline-primary" onClick={() => navigate('/games')} className="mb-4">
        &larr; Back to Games
      </Button>
      
      <Row>
        {/* Game Details */}
        <Col lg={8}>
          <Card className="mb-4">
            {game.imageUrl && (game.imageUrl.startsWith('http') || game.imageUrl.startsWith('https')) ? (
              <Card.Img 
                variant="top" 
                src={game.imageUrl} 
                alt={game.title}
                style={{ maxHeight: '300px', objectFit: 'cover' }}
                onError={e => { 
                  console.log(`Image error for ${game.title}: ${game.imageUrl}`);
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/800x300.png?text=${encodeURIComponent(game.title)}`;
                }}
              />
            ) : (
              <Card.Img 
                variant="top" 
                src={`https://via.placeholder.com/800x300.png?text=${encodeURIComponent(game.title)}`}
                alt={game.title}
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
            )}
            <Card.Body>
              <Card.Title as="h2">{game.title}</Card.Title>
              
              <div className="mb-3">
                <Badge bg="primary" className="me-2">
                  {game.developer}
                </Badge>
                <Badge bg="secondary" className="me-2">
                  {game.publisher}
                </Badge>
                <Badge bg="info">
                  {new Date(game.releaseDate).toLocaleDateString()}
                </Badge>
              </div>
              
              {averageRating > 0 && (
                <div className="mb-3">
                  <strong>User Score:</strong> {averageRating.toFixed(1)}/10 ({feedback.length} reviews)
                </div>
              )}
              
              {game.metacriticScore > 0 && (
                <div className="mb-3">
                  <strong>Metacritic:</strong> {game.metacriticScore}/100
                </div>
              )}
              
              {game.genres && game.genres.length > 0 && (
                <div className="mb-3">
                  <strong>Genres:</strong>{' '}
                  {game.genres.map((genre, index) => (
                    <Badge key={index} bg="success" className="me-1">{genre}</Badge>
                  ))}
                </div>
              )}
              
              {game.platforms && game.platforms.length > 0 && (
                <div className="mb-3">
                  <strong>Platforms:</strong>{' '}
                  {game.platforms.map((platform, index) => (
                    <Badge key={index} bg="dark" className="me-1">{platform}</Badge>
                  ))}
                </div>
              )}
              
              {game.description && (
                <div className="mt-4">
                  <h5>Description</h5>
                  <p>{game.description}</p>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {/* Analytics */}
          {feedback.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h4>Game Analytics</h4>
              </Card.Header>
              <Card.Body>
                <Tabs defaultActiveKey="ratings" className="mb-3">
                  <Tab eventKey="ratings" title="Rating Distribution">
                    <div style={{ height: '300px' }}>
                      <Bar 
                        data={prepareRatingDistribution()} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Number of Ratings'
                              }
                            },
                            x: {
                              title: {
                                display: true,
                                text: 'Rating'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </Tab>
                  <Tab eventKey="platforms" title="Platform Distribution">
                    <div style={{ height: '300px' }}>
                      <Pie 
                        data={preparePlatformDistribution()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false
                        }}
                      />
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          )}
          
          {/* Submit Feedback */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Submit Your Feedback</h4>
            </Card.Header>
            <Card.Body>
              {!isAuthenticated ? (
                <Alert variant="info">
                  Please <Alert.Link href="/login">login</Alert.Link> to submit your feedback.
                </Alert>
              ) : (
                <Form onSubmit={handleSubmitFeedback}>
                  {submitSuccess && (
                    <Alert variant="success">
                      Your feedback has been submitted successfully!
                    </Alert>
                  )}
                  
                  {submitError && (
                    <Alert variant="danger">
                      {submitError}
                    </Alert>
                  )}
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Your Rating (1-10)</Form.Label>
                    <Form.Control
                      type="range"
                      min="1"
                      max="10"
                      value={userRating}
                      onChange={(e) => setUserRating(parseInt(e.target.value))}
                    />
                    <div className="text-center">
                      <Badge bg="primary">{userRating}/10</Badge>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Platform</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., PC, PlayStation 5, Xbox Series X"
                      value={userPlatform}
                      onChange={(e) => setUserPlatform(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Your Review</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Share your thoughts about this game..."
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        {' '}Submitting...
                      </>
                    ) : 'Submit Feedback'}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        {/* Feedback List */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h4>User Reviews</h4>
            </Card.Header>
            <Card.Body>
              {feedback.length === 0 ? (
                <Alert variant="info">
                  No reviews yet. Be the first to leave a review!
                </Alert>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {feedback.map((item) => (
                    <Card key={item._id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">
                            {item.userId?.name || 'Anonymous User'}
                          </h6>
                          <Badge bg="primary">{item.rating}/10</Badge>
                        </div>
                        
                        {item.platform && (
                          <div className="mb-2">
                            <small className="text-muted">
                              Platform: {item.platform}
                            </small>
                          </div>
                        )}
                        
                        {item.review ? (
                          <p className="mb-1">{item.review}</p>
                        ) : (
                          <p className="text-muted mb-1">No written review</p>
                        )}
                        
                        <small className="text-muted">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </small>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GameDetail;
