# Simple Game Analytics HUB - Architecture Design

## Overview
This document outlines the simplified architecture for the Game Analytics HUB project, focusing on the core MERN stack with Kaggle API integration and OAuth authentication.

## System Architecture

### Backend (Express.js + Node.js)
- **API Layer**: RESTful endpoints for game data and user feedback
- **Authentication**: OAuth integration with Passport.js
- **Data Access Layer**: Mongoose models for MongoDB interaction
- **External API Integration**: Kaggle API client for fetching gaming datasets

### Frontend (React.js)
- **Component Structure**: Functional components with hooks
- **Routing**: React Router for navigation
- **State Management**: React Context API (no Redux)
- **UI Framework**: Bootstrap or Material-UI for responsive design
- **Data Visualization**: Chart.js for simple metrics visualization

### Database (MongoDB)
- **Collections**:
  - Users: Store user information and authentication details
  - Games: Store game metadata and metrics
  - Feedback: Store user ratings and reviews

### Authentication Flow
1. User initiates login with OAuth provider (Google/GitHub)
2. Backend authenticates with provider and creates/updates user in MongoDB
3. JWT token issued to frontend for subsequent API calls
4. Protected routes check JWT validity

### Data Flow
1. Admin imports gaming datasets from Kaggle API
2. Users browse games and submit feedback/ratings
3. Frontend displays aggregated metrics and visualizations

## API Endpoints

### Authentication
- `POST /api/auth/google`: Google OAuth login
- `POST /api/auth/github`: GitHub OAuth login
- `GET /api/auth/logout`: Logout user
- `GET /api/auth/user`: Get current user info

### Games
- `GET /api/games`: Get all games (paginated)
- `GET /api/games/:id`: Get specific game details
- `POST /api/games`: Add new game (admin only)
- `PUT /api/games/:id`: Update game (admin only)
- `DELETE /api/games/:id`: Delete game (admin only)
- `GET /api/games/import`: Import games from Kaggle (admin only)

### Feedback
- `GET /api/feedback/game/:gameId`: Get all feedback for a game
- `POST /api/feedback`: Add new feedback
- `PUT /api/feedback/:id`: Update feedback
- `DELETE /api/feedback/:id`: Delete feedback

## Deployment Architecture
- **GitHub**: Source code repository
- **GitHub Actions**: CI/CD pipeline for automated testing and deployment
- **Render**: Hosting platform for both backend and frontend

## Simplifications
- No microservices architecture
- No complex caching mechanisms
- No advanced security features beyond OAuth
- No separate development/staging environments
- No containerization
