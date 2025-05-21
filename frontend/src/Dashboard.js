import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Tab, Tabs } from 'react-bootstrap';
import { Bar, Pie, Line } from 'react-chartjs-2';
import api from './api';
import { useAuth } from './AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [games, setGames] = useState([]);
  const [userFeedback, setUserFeedback] = useState([]);
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch games
        const gamesResponse = await api.get('/games?limit=100');
        setGames(gamesResponse.data.games);
        
        // Fetch user feedback
        const feedbackResponse = await api.get('/feedback/user');
        setUserFeedback(feedbackResponse.data);
        
        // Get recent games (last 5)
        setRecentGames(gamesResponse.data.games.slice(0, 5));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const prepareGenreDistribution = () => {
    // Count games by genre
    const genreCounts = {};
    
    games.forEach(game => {
      if (game.genres && game.genres.length > 0) {
        game.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });
    
    // Sort by count and take top 5
    const sortedGenres = Object.keys(genreCounts)
      .sort((a, b) => genreCounts[b] - genreCounts[a])
      .slice(0, 5);
    
    return {
      labels: sortedGenres,
      datasets: [
        {
          label: 'Games by Genre',
          data: sortedGenres.map(genre => genreCounts[genre]),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const preparePlatformDistribution = () => {
    // Count games by platform
    const platformCounts = {};
    
    games.forEach(game => {
      if (game.platforms && game.platforms.length > 0) {
        game.platforms.forEach(platform => {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });
      }
    });
    
    // Sort by count and take top 5
    const sortedPlatforms = Object.keys(platformCounts)
      .sort((a, b) => platformCounts[b] - platformCounts[a])
      .slice(0, 5);
    
    return {
      labels: sortedPlatforms,
      datasets: [
        {
          label: 'Games by Platform',
          data: sortedPlatforms.map(platform => platformCounts[platform]),
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

  const prepareRatingTrend = () => {
    // Group games by year and calculate average rating
    const yearlyRatings = {};
    
    games.forEach(game => {
      if (game.releaseDate && game.userScore) {
        const year = new Date(game.releaseDate).getFullYear();
        if (!yearlyRatings[year]) {
          yearlyRatings[year] = { sum: 0, count: 0 };
        }
        yearlyRatings[year].sum += game.userScore;
        yearlyRatings[year].count += 1;
      }
    });
    
    // Calculate averages and sort by year
    const years = Object.keys(yearlyRatings)
      .sort()
      .filter(year => year >= 2010); // Filter for recent years
    
    const averages = years.map(year => 
      yearlyRatings[year].sum / yearlyRatings[year].count
    );
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Average User Score by Year',
          data: averages,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        }
      ]
    };
  };

  const prepareTopGamesBySales = () => {
    if (!games || games.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Top 10 Games by Global Sales',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      };
    }

    const sortedGames = [...games]
      .filter(game => game.globalSales && game.globalSales > 0) // Ensure globalSales is positive
      .sort((a, b) => b.globalSales - a.globalSales) // Sorts descending (highest sales first)
      .slice(0, 10)
      .reverse(); // Reverses the array, so lowest of the top 10 is first (rendered at top)

    return {
      labels: sortedGames.map(game => game.title),
      datasets: [
        {
          label: 'Global Sales (Millions)',
          data: sortedGames.map(game => game.globalSales),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
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
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="mb-4 h-100">
            <Card.Body>
              <Card.Title>Welcome, {user?.name}!</Card.Title>
              <Card.Text>
                This dashboard provides an overview of gaming industry metrics and your personal feedback history.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4 h-100">
            <Card.Body>
              <Card.Title>Your Stats</Card.Title>
              <div className="d-flex justify-content-between mb-2">
                <span>Reviews Submitted:</span>
                <strong>{userFeedback.length}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Games in Database:</span>
                <strong>{games.length}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Last Login:</span>
                <strong>{new Date(user?.lastLogin).toLocaleDateString()}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4 h-100">
            <Card.Body>
              <Card.Title>Quick Links</Card.Title>
              <ul className="list-unstyled">
                <li><a href="/games">Browse All Games</a></li>
                <li><a href="/profile">Your Profile</a></li>
                {userFeedback.length > 0 && (
                  <li>
                    <a href={`/games/${userFeedback[0].gameId}`}>
                      Your Latest Review
                    </a>
                  </li>
                )}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Gaming Industry Analytics</h4>
            </Card.Header>
            <Card.Body>
              <Tabs defaultActiveKey="genres" className="mb-3">
                <Tab eventKey="genres" title="Popular Genres">
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={prepareGenreDistribution()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Games'
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
                <Tab eventKey="trends" title="Rating Trends">
                  <div style={{ height: '300px' }}>
                    <Line 
                      data={prepareRatingTrend()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            min: 0,
                            max: 10,
                            title: {
                              display: true,
                              text: 'Average User Score'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </Tab>
                <Tab eventKey="topSales" title="Top Games by Sales">
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={prepareTopGamesBySales()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y', // Optional: to make it a horizontal bar chart if preferred
                        scales: {
                          x: { // Note: x and y are swapped if indexAxis is 'y'
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Global Sales (Millions)'
                            }
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'Game Title'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false // Sales data is clear from axis label
                          }
                        }
                      }}
                    />
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Recent Games</h4>
            </Card.Header>
            <Card.Body>
              {recentGames.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {recentGames.map(game => (
                    <Card key={game._id} className="mb-2">
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <a href={`/games/${game._id}`} className="text-decoration-none">
                              <h6 className="mb-0">{game.title}</h6>
                            </a>
                            <small className="text-muted">
                              {game.developer} | {new Date(game.releaseDate).getFullYear()}
                            </small>
                          </div>
                          {game.userScore > 0 && (
                            <span className="badge bg-success">
                              {game.userScore.toFixed(1)}/10
                            </span>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert variant="info">No games available</Alert>
              )}
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h4>Your Recent Feedback</h4>
            </Card.Header>
            <Card.Body>
              {userFeedback.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {userFeedback.slice(0, 5).map(feedback => (
                    <Card key={feedback._id} className="mb-2">
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <a href={`/games/${feedback.gameId}`} className="text-decoration-none">
                            <h6 className="mb-0">{feedback.gameId?.title || 'Game'}</h6>
                          </a>
                          <span className="badge bg-primary">
                            {feedback.rating}/10
                          </span>
                        </div>
                        <small className="text-muted">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </small>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert variant="info">
                  You haven't submitted any feedback yet.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
