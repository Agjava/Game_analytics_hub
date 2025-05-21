import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Assuming this path is correct

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar 
      expand="lg" 
      className="mb-4 navbar-custom-cyan" // Added custom class
      // variant="dark" // Keep this if you want generally light text, or try "light" for dark text
    >
      <Container>
        {/* Optional: Add your Navbar.Brand here if you have one */}
        {/* <Navbar.Brand as={Link} to="/">Game HUB</Navbar.Brand> */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/games">Games</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Navbar.Text className="me-3 signed-in-text">
                  Signed in as: {user?.name}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout} className="logout-button">Logout</Button>
              </>
            ) : (
              <Button variant="light" as={Link} to="/login" className="login-button">Login</Button>
              // Changed to variant="light" for the login button, assuming dark text on light button bg
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;