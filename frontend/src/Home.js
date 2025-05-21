import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from './api';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './App.css';

// List of exactly 8 featured games to display
const FEATURED_TITLES = [
  'Overwatch',
  'Yokai watch 3',
  'Dark souls 3',
  "No man's sky",
  'Doom 2016',
  'Resident Evil Zero',
  'Quantum Break',
  'MLB 16 : The show'
];

// Helper to normalize titles for matching - more lenient matching
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '')
    .replace(/\s+/g, '')
    .replace(/[0-9]+$/, ''); // Remove trailing numbers (e.g., "2016" from "Doom 2016")
}

const Home = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const findMatchingGame = (games, searchTitle) => {
    const normalizedSearchTitle = normalizeTitle(searchTitle);
    console.log(`Looking for: "${searchTitle}" (normalized: "${normalizedSearchTitle}")`);
    
    // First try exact match after normalization
    const exactMatch = games.find(game => 
      normalizeTitle(game.title) === normalizedSearchTitle
    );
    
    if (exactMatch) {
      console.log(`Found exact match: ${exactMatch.title}`);
      return exactMatch;
    }

    // If no exact match, try includes
    const includesMatch = games.find(game => 
      normalizeTitle(game.title).includes(normalizedSearchTitle) ||
      normalizedSearchTitle.includes(normalizeTitle(game.title))
    );

    if (includesMatch) {
      console.log(`Found partial match: ${includesMatch.title}`);
      return includesMatch;
    }

    console.log(`No match found for: ${searchTitle}`);
    return null;
  };

  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all games
        console.log('Fetching games from API...');
        // Fetch a larger number of games to increase the chance of finding all featured titles
        const response = await api.get('/games?limit=300'); 
        const allGames = response.data.games;
        console.log(`Fetched ${allGames.length} total games from API`);

        // Log all game titles for debugging
        console.log('Available games:', allGames.map(g => g.title).join(', '));

        // Find matches for each featured title
        const featured = FEATURED_TITLES
          .map(title => {
            const match = findMatchingGame(allGames, title);
            return match;
          })
          .filter(Boolean);

        console.log(`Found ${featured.length} out of ${FEATURED_TITLES.length} featured games`);
        featured.forEach(game => console.log(`Found: ${game.title}`));

        if (featured.length === 0) {
          setError('No featured games were found in the database.');
        } else {
          setFeaturedGames(featured);

          // Fetch missing images
          await Promise.all(
            featured.map(async (game) => {
              if (!game.imageUrl) {
                try {
                  const imgResponse = await api.get(`/games/image-search?title=${encodeURIComponent(game.title)}`);
                  if (imgResponse.data && imgResponse.data.imageUrl) {
                    setFeaturedGames(prevGames =>
                      prevGames.map(g =>
                        g._id === game._id ? { ...g, imageUrl: imgResponse.data.imageUrl } : g
                      )
                    );
                  }
                } catch (err) {
                  console.error(`Failed to fetch image for ${game.title}:`, err);
                }
              }
            })
          );
        }
      } catch (err) {
        console.error('Error fetching featured games:', err);
        setError('Failed to load featured games: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedGames();
  }, []);

  return (
    <Container>
      {/* Hero Section */}
      <div className="hero-section text-white p-5 mb-4 rounded" style={{
        backgroundImage: `url('https://img.freepik.com/premium-photo/2d-hero-battle-pvp-arena-background-casual-game-art-design-ai-generative_977463-125.jpg')`, // Replace with your image URL
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
          zIndex: 1,
        }}></div>
        <div style={{ zIndex: 2 }}>
          <h1 className="display-3 fw-bold">Game Analytics HUB</h1>
          <p className="lead mb-4">
            Explore gaming industry metrics and share your feedback on your favorite games.
          </p>
          <Button as={Link} to="/games" variant="primary" size="lg" className="shadow-lg">
            Browse Games
          </Button>
        </div>
      </div>

      {/* Featured Games */}
      <h2 className="mb-4">Featured Games</h2>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          {featuredGames.length === 0 && (
            <Alert variant="info">No featured games found.</Alert>
          )}
          <Row xs={1} sm={2} md={4} lg={4} className="g-4">
            <TransitionGroup component={null}>
              {featuredGames.map((game, idx) => (
                <CSSTransition key={game._id} timeout={300 + idx * 30} classNames="fade-slide">
                  <Col>
                    <Card className="h-100 shadow-sm border-0 game-card" style={{ borderRadius: '1.5rem', overflow: 'hidden', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' }}>
                      <div className="overflow-hidden" style={{height: '200px', background: '#f8f9fa'}}>
                        <Card.Img
                          variant="top"
                          src={(game.imageUrl && (game.imageUrl.startsWith('http') || game.imageUrl.startsWith('https'))) 
                            ? game.imageUrl 
                            : `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(game.title)}`}
                          alt={game.title}
                          style={{ height: '200px', objectFit: 'cover', borderRadius: '0', transition: 'transform 0.3s ease-in-out' }}
                          className="game-img"
                          onError={e => {
                            console.log(`Image error for ${game.title}: ${game.imageUrl}`);
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(game.title)}`;
                          }}
                        />
                      </div>
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <Card.Title className="fw-bold fs-5 mb-2 text-truncate" title={game.title}>
                            {game.title}
                          </Card.Title>
                          <Card.Text>
                            <small className="text-muted">
                              {Array.isArray(game.genres) && game.genres.length > 0 ? game.genres.join(', ') : 'Unknown'} | {game.releaseDate ? new Date(game.releaseDate).getFullYear() : '?'}
                            </small>
                          </Card.Text>
                        </div>
                        <Button
                          as={Link}
                          to={`/games/${game._id}`}
                          variant="outline-primary"
                          size="sm"
                          className="rounded-pill fw-semibold px-3"
                        >
                          View Details
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </Row>
        </>
      )}

    </Container>
  );
};

export default Home;
