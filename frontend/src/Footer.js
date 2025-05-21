import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-4">
      <Container className="text-center">
        <p className="mb-0">Game Analytics HUB &copy; {new Date().getFullYear()}</p>
        <p className="small mb-0">Built with MongoDB, Express.js, React.js, Node.js, and Kaggle API</p>
      </Container>
    </footer>
  );
};

export default Footer;
