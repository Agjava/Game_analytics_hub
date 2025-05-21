import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Pagination, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from './api'; // Your API helper
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './App.css'; // Your custom styles
import { CSSTransition, TransitionGroup } from 'react-transition-group';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// List of titles for "special" pages
const specialPageGameTitles = [
  // Page 1
  "Dying Light", "Dark Cavern", "Reactor", "The Elder Scrolls Online",
  "Forza Motorsport 6", "Donkey Kong", "Mario Party 10", "Just Dance 2016",
  "Fallout 4", "Quantum Break", "Final Fantasy Type-0", "Astroblast",
  // Page 2
  "Laser Blast", "Airlock", "Carnival", "Atlantis",
  "Freeway", "Missile Command", "Bridge", "Front Line", "Checkers", "Donkey Kong",
  "Frogger", "Demon Attack", 
  // Page 3 (Last page of this list)
  "Megamania", "Astroblast", "Frogs And Flies", "King Kong",
  "Pac-Man", "Polaris", "Mario Bros.", "X-Man", "Mahjong", "Donkey Kong Jr.", 
  "4 Nin uchi Mahjong", "Gradius", 
  // Page 4 (Remaining)
  "Castlevania II: Simon's Quest", "Mega Man 2", 
  "Final Fantasy II", "Dragon Warrior IV"
];

const GAMES_PER_PAGE = 12;

// Helper to create a slug from a title
const createSlug = (title) => {
  if (!title) return '';
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '');
};

const getTitlesForSpecialPage = (pageNumber, totalApiPages, searchTerm) => {
  if (searchTerm && searchTerm.trim() !== "") return null;

  let startIndex = -1, endIndex = -1;

  if (pageNumber === 1) {
    startIndex = 0;
    endIndex = GAMES_PER_PAGE;
  } else if (pageNumber === 2) {
    startIndex = GAMES_PER_PAGE;
    endIndex = GAMES_PER_PAGE * 2;
  } else if (pageNumber === totalApiPages && totalApiPages > 2) { 
    const thirdPageStartIndex = GAMES_PER_PAGE * 2;
    if (specialPageGameTitles.length > thirdPageStartIndex) {
        if (pageNumber === 3 && specialPageGameTitles.length > thirdPageStartIndex) {
             startIndex = thirdPageStartIndex;
             endIndex = thirdPageStartIndex + GAMES_PER_PAGE;
        } else if (pageNumber === 4 && specialPageGameTitles.length > thirdPageStartIndex + GAMES_PER_PAGE) {
            startIndex = GAMES_PER_PAGE * 3;
            endIndex = GAMES_PER_PAGE * 4;
        } else if (pageNumber >= 3 && specialPageGameTitles.length > thirdPageStartIndex) {
            startIndex = thirdPageStartIndex;
            endIndex = thirdPageStartIndex + GAMES_PER_PAGE;
        }
    }
  }
  
  if (startIndex !== -1) {
    return specialPageGameTitles.slice(startIndex, Math.min(endIndex, specialPageGameTitles.length));
  }
  return null;
};

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [csvGames, setCsvGames] = useState([]);
  const [csvLoading, setCsvLoading] = useState(true);
  const [csvError, setCsvError] = useState(null);

  const fetchCsvGames = useCallback(async () => {
    try {
      setCsvLoading(true);
      const response = await api.get('/games/csv');
      setCsvGames(response.data);
    } catch (err) {
      setCsvError('Failed to load CSV game data');
    } finally {
      setCsvLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCsvGames();
  }, [fetchCsvGames]);

  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        // Fetch total pages based on search term for accurate pagination
        const countResponse = await api.get(`/games?page=1&limit=1&search=${encodeURIComponent(searchTerm)}`);
        setTotalPages(countResponse.data?.pagination?.pages || 1);
      } catch (err) {
        console.error("Error fetching total pages:", err);
        setTotalPages(1); // Default to 1 page on error
      }
    };
    fetchTotalPages();
  }, [searchTerm]);

  const fetchGamesData = useCallback(async (page, totalPagesContext) => {
    setLoading(true);
    setError(null);

    const titlesForPage = getTitlesForSpecialPage(page, totalPagesContext, searchTerm);

    if (titlesForPage && titlesForPage.length > 0) {
      try {
        const gamePromises = titlesForPage.map(async (title) => {
          try {
            const slug = createSlug(title);
            const response = await api.get(`/games/${slug}`); // Use the slugified title
            return { ...response.data, imageUrl: response.data.imageUrl || null };
          } catch (err) {
            console.warn(`Failed to fetch game by title '${title}' (slug: ${createSlug(title)}):`, err.response?.data?.message || err.message);
            // Return a placeholder if specific fetch fails
            return { 
              _id: `placeholder-${createSlug(title)}`, 
              title: title, 
              developer: 'N/A', 
              releaseDate: new Date().toISOString(), 
              imageUrl: 'IMAGE_UNAVAILABLE' 
            };
          }
        });

        const resolvedGames = await Promise.all(gamePromises);
        setGames(resolvedGames);

        // Secondary pass to fetch images for games that were found but might be missing an image URL
        const gamesToFetchImagesFor = resolvedGames.filter(g => g._id && !g._id.startsWith('placeholder-') && !g.imageUrl);
        
        if (gamesToFetchImagesFor.length > 0) {
          await Promise.all(
            gamesToFetchImagesFor.map(async (game) => {
              try {
                const imgResponse = await api.get(`/games/image-search?title=${encodeURIComponent(game.title)}`);
                if (imgResponse.data && imgResponse.data.imageUrl && imgResponse.data.imageUrl.startsWith('http')) {
                  setGames(prevGames =>
                    prevGames.map(g => (g._id === game._id ? { ...g, imageUrl: imgResponse.data.imageUrl } : g))
                  );
                } else {
                   setGames(prevGames =>
                    prevGames.map(g => (g._id === game._id ? { ...g, imageUrl: 'IMAGE_UNAVAILABLE' } : g))
                  );
                }
              } catch (err) {
                console.error(`Image fetch failed for ${game.title} (after initial fetch):`, err);
                setGames(prevGames =>
                  prevGames.map(g => (g._id === game._id ? { ...g, imageUrl: 'IMAGE_UNAVAILABLE' } : g))
                );
              }
            })
          );
        }
      } catch (err) {
        console.error('Error fetching special page games:', err);
        setError('Failed to load games for this page.');
        setGames([]);
      } finally {
        setLoading(false);
      }
    } else { // Standard pagination / search
      try {
        const response = await api.get(`/games?page=${page}&limit=${GAMES_PER_PAGE}&search=${encodeURIComponent(searchTerm)}`);
        const fetchedGames = response.data.games.map(g => ({...g, imageUrl: g.imageUrl || null }));
        setGames(fetchedGames);
        
        if (response.data.pagination && response.data.pagination.pages && totalPages !== response.data.pagination.pages) {
             setTotalPages(response.data.pagination.pages);
        }
        
        const gamesNeedingImages = fetchedGames.filter(g => !g.imageUrl);
        if (gamesNeedingImages.length > 0) {
          await Promise.all(
            gamesNeedingImages.map(async (game) => {
              try {
                const imgResponse = await api.get(`/games/image-search?title=${encodeURIComponent(game.title)}`);
                if (imgResponse.data && imgResponse.data.imageUrl && imgResponse.data.imageUrl.startsWith('http')) {
                  setGames(prevGames =>
                    prevGames.map(g => (g._id === game._id ? { ...g, imageUrl: imgResponse.data.imageUrl } : g))
                  );
                } else {
                   setGames(prevGames =>
                    prevGames.map(g => (g._id === game._id ? { ...g, imageUrl: 'IMAGE_UNAVAILABLE' } : g))
                  );
                }
              } catch (err) {
                console.error(`Image fetch failed for API game ${game.title}:`, err);
                 setGames(prevGames =>
                    prevGames.map(g => (g._id === game._id ? { ...g, imageUrl: 'IMAGE_UNAVAILABLE' } : g))
                  );
              }
            })
          );
        }
      } catch (err) {
        console.error('Error fetching paginated/searched games:', err);
        setError('Failed to load games.');
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
  }, [searchTerm, totalPages]);

  useEffect(() => {
    if (totalPages > 0) { // Ensure totalPages is determined before fetching
      fetchGamesData(currentPage, totalPages);
    }
  }, [currentPage, totalPages, fetchGamesData]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1 on new search
    // totalPages will be refetched by its own useEffect due to searchTerm change
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= 1) return [];

    items.push(<Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />);
    items.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />);

    if (totalPages <= maxPagesToShow + 2) {
      for (let number = 1; number <= totalPages; number++) {
        items.push(<Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>{number}</Pagination.Item>);
      }
    } else {
      items.push(<Pagination.Item key={1} active={1 === currentPage} onClick={() => handlePageChange(1)}>{1}</Pagination.Item>);
      if (currentPage > halfPagesToShow + 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      }
      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);
      if (currentPage <= halfPagesToShow + 1) endPage = Math.min(totalPages - 1, maxPagesToShow);
      if (currentPage >= totalPages - halfPagesToShow) startPage = Math.max(2, totalPages - maxPagesToShow + 1);
      startPage = Math.max(2, startPage);
      endPage = Math.min(totalPages - 1, endPage);
      for (let number = startPage; number <= endPage; number++) {
        items.push(<Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>{number}</Pagination.Item>);
      }
      if (currentPage < totalPages - halfPagesToShow - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      }
      items.push(<Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>);
    }

    items.push(<Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />);
    items.push(<Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />);
    return items;
  };

  return (
    <Container>
      <h1 className="mb-4 fw-bold display-4 text-center" style={{ letterSpacing: '1px' }}>Game Library</h1>
      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="g-2">
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow-sm rounded-pill px-4 py-2"
            />
          </Col>
          <Col md={4}>
            <Button type="submit" variant="primary" className="w-100 rounded-pill fw-bold py-2 fs-5 shadow">
              <span role="img" aria-label="search">🔍</span> Search
            </Button>
          </Col>
        </Row>
      </Form>

      <h2 className="mb-3 mt-5 fw-semibold text-primary">All Games</h2>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary"><span className="visually-hidden">Loading...</span></Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : games.length === 0 && !loading ? (
        <Alert variant="info">No games found for the current selection.</Alert>
      ) : (
        <>
          <Row xs={1} sm={2} md={3} lg={4} xl={4} className="g-4">
            <TransitionGroup component={null}>
              {games.map((game, idx) => (
                <CSSTransition key={game._id || `game-${idx}-${game.title}`} timeout={300 + idx * 30} classNames="fade-slide">
                  <Col>
                    <Card className="h-100 shadow-sm border-0 game-card" style={{ borderRadius: '1rem', overflow: 'hidden', transition: 'transform 0.2s ease-in-out' }}>
                      <div className="overflow-hidden" style={{ height: '200px', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {game.imageUrl && (game.imageUrl.startsWith('http') || game.imageUrl.startsWith('https')) ? (
                          <Card.Img
                            variant="top"
                            src={game.imageUrl}
                            alt={game.title}
                            style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: '0' }}
                            className="game-img"
                            onError={e => { 
                              console.log(`Image error for ${game.title}: ${game.imageUrl}`);
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(game.title + ' (Img Error)')}`;
                            }}
                          />
                        ) : game.imageUrl === null && !loading && game._id && !game._id.startsWith('placeholder-') ? ( 
                           <div className="image-placeholder-text" style={{ textAlign: 'center', color: '#6c757d', padding: 10 }}>
                            {game.title} <br /> <Spinner animation="grow" size="sm" as="span" variant="secondary" />
                            <div style={{ fontSize: '0.7rem' }}>(Fetching image...)</div>
                          </div>
                        ) : ( 
                          <Card.Img
                            variant="top"
                            src={`https://via.placeholder.com/300x200.png?text=${encodeURIComponent(game.title)}`}
                            alt={game.title}
                            style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: '0' }}
                            className="game-img-placeholder"
                          />
                        )}
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <div style={{ flexGrow: 1 }}>
                          <Card.Title className="fw-bold fs-6 mb-1 text-truncate text-center" title={game.title}>
                            {game.title}
                          </Card.Title>
                          <Card.Text className="mb-2 d-flex justify-content-between">
                            <small className="text-muted">
                              {Array.isArray(game.genres) && game.genres.length > 0 ? game.genres.join(', ') : 'Unknown Genre'}
                            </small>
                            <small className="text-muted">
                              {game.releaseDate ? new Date(game.releaseDate).getFullYear() : 'N/A'}
                            </small>
                          </Card.Text>
                        </div>
                        <div className="d-flex justify-content-center mt-auto pt-2">
                          <Button
                            as={Link}
                            to={`/games/${(game._id && !game._id.startsWith('placeholder-')) ? game._id : createSlug(game.title)}`}
                            variant="outline-primary"
                            size="sm"
                            className="rounded-pill fw-semibold px-3"
                            disabled={game._id && game._id.startsWith('placeholder-')} // Disable if it's a placeholder
                          >
                            View Details
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </Row>
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4 pt-2">
              <Pagination>{getPaginationItems()}</Pagination>
            </div>
          )}
        </>
      )}

      {/* Chart Visualization */}
      {csvLoading ? (
        <div className="text-center my-4"><Spinner animation="border" role="status"><span className="visually-hidden">Loading chart...</span></Spinner></div>
      ) : csvError ? (
        <Alert variant="danger" className="mt-5">{csvError}</Alert>
      ) : csvGames && csvGames.length > 0 ? (
        <Card className="mb-4 mt-5">
          <Card.Body>
            <Card.Title>Top 10 Games by Global Sales</Card.Title>
            <div style={{ height: '400px', position: 'relative' }}> {/* Wrapper for chart size control */}
              <Bar
                data={{
                  labels: csvGames.sort((a, b) => parseFloat(b.Global_Sales) - parseFloat(a.Global_Sales)).slice(0, 10).map(g => g.Name),
                  datasets: [{
                    label: 'Global Sales (millions)',
                    data: csvGames.sort((a, b) => parseFloat(b.Global_Sales) - parseFloat(a.Global_Sales)).slice(0, 10).map(g => parseFloat(g.Global_Sales)),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' }, title: { display: true, text: 'Top 10 Games by Global Sales' } },
                  scales: {
                    x: { ticks: { maxRotation: 90, minRotation: 45, autoSkip: false, padding: 10 } },
                    y: { beginAtZero: true, title: { display: true, text: 'Sales (in millions)' } }
                  }
                }}
              />
            </div>
          </Card.Body>
        </Card>
      ) : (<Alert variant="info" className="mt-5">CSV game data for chart is unavailable or empty.</Alert>)}
    </Container>
  );
};

export default Games;
