# Game Analytics HUB 🎮

A full-stack web application for visualizing gaming industry metrics, managing game libraries, and collecting user feedback. Built with modern web technologies and featuring a responsive, user-friendly interface.

## 🎥 Video Demonstration

[Coming Soon] A comprehensive walkthrough of the application's features and functionality will be added here.

## ⚡ Core Features

- **User Authentication & Authorization**
  - Google and GitHub OAuth integration
  - Secure user sessions
  - Role-based access control (Admin/User)

- **Game Library Management**
  - Browse extensive game collection
  - Advanced search and filtering
  - Detailed game information pages
  - Dynamic image loading with fallback support

- **User Interaction**
  - Personal game ratings and reviews
  - User profiles with gaming history
  - Customizable user avatars

- **Data Visualization**
  - Interactive charts for gaming metrics
  - Global sales statistics
  - Genre distribution analysis
  - Platform popularity trends

- **Responsive Design**
  - Mobile-first approach
  - Smooth transitions and animations
  - Intuitive navigation
  - Cross-browser compatibility

## 🛠 Technology Stack

### Frontend
- **React.js** - UI development
- **React Bootstrap** - Responsive components
- **Chart.js** - Data visualization
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - API communication
- **CSS3** - Custom styling and animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Authentication
- **JWT** - Token-based authorization
- **Kaggle API** - Data integration

### Development & Deployment
- **Git** - Version control
- **GitHub Actions** - CI/CD pipeline
- **Render** - Backend hosting
- **Netlify** - Frontend hosting
- **MongoDB Atlas** - Cloud database

## 🔄 Application Workflow

1. **User Authentication**
   - OAuth login via Google/GitHub
   - Session management
   - Secure route protection

2. **Game Discovery**
   - Browse game library
   - Search and filter options
   - View detailed game information
   - Dynamic image loading

3. **User Interaction**
   - Rate and review games
   - Update profile information
   - View personal gaming history
   - Manage feedback

4. **Data Analysis**
   - View gaming industry trends
   - Analyze sales data
   - Explore platform statistics
   - Track user engagement

5. **Admin Functions**
   - Manage game database
   - Import Kaggle datasets
   - Monitor user activity
   - System maintenance

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB
- Kaggle API credentials
- OAuth credentials (Google/GitHub)

### Environment Setup
1. Clone the repository
2. Set up environment variables
3. Install dependencies
4. Start development servers

Detailed setup instructions in the sections below.

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your values.

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your values.

4. Start the development server:
   ```
   npm start
   ```

## Deployment

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command to `cd backend && npm install`
4. Set the start command to `cd backend && npm start`
5. Add all environment variables from your backend `.env` file
6. Deploy the service

### Frontend Deployment (Netlify)

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Set the build command to `cd frontend && npm install && npm run build`
4. Set the publish directory to `frontend/build`
5. Add the `REACT_APP_API_URL` environment variable pointing to your deployed backend
6. Deploy the site

## GitHub Actions CI/CD

The repository includes GitHub Actions workflows for both backend and frontend:

- `.github/workflows/backend.yml`: Tests and deploys the backend to Render
- `.github/workflows/frontend.yml`: Builds and deploys the frontend to Netlify

To use these workflows, you need to add the following secrets to your GitHub repository:

- `RENDER_SERVICE_ID`: Your Render service ID
- `RENDER_API_KEY`: Your Render API key
- `NETLIFY_AUTH_TOKEN`: Your Netlify authentication token
- `NETLIFY_SITE_ID`: Your Netlify site ID
- `REACT_APP_API_URL`: URL of your deployed backend API

## Kaggle API Integration

To use the Kaggle API integration:

1. Create a Kaggle account at https://www.kaggle.com/
2. Generate API credentials in your account settings
3. Add your Kaggle username and key to the backend `.env` file
4. Use the admin interface to import gaming datasets

## OAuth Setup

### Google OAuth

1. Create a project in the Google Developer Console
2. Configure the OAuth consent screen
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs (e.g., `http://localhost:5000/api/auth/google/callback` for development)
5. Add your client ID and secret to the backend `.env` file

### GitHub OAuth

1. Create a new OAuth application in GitHub Developer Settings
2. Set the homepage URL to your frontend URL
3. Set the callback URL to your backend auth callback (e.g., `http://localhost:5000/api/auth/github/callback` for development)
4. Add your client ID and secret to the backend `.env` file

## 📈 Future Enhancements

- Real-time game statistics
- User achievement system
- Social features and friend lists
- Advanced analytics dashboard
- Mobile application
- Game recommendation engine

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Kaggle for providing gaming datasets
- React and Node.js communities
- Bootstrap team for responsive components
- Chart.js for visualization tools
- All contributors and testers
