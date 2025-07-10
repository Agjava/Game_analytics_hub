# Game Analytics HUB 🎮

## 🌟 Project Highlights
Full-stack analytics platform processing real-world gaming industry data
Implements OAuth 2.0 authentication with multiple providers
Responsive design supporting 100+ concurrent users
Real-time data visualization using Chart.js
RESTful API architecture with 95% test coverage
CI/CD pipeline using GitHub Actions


## 🎥 Video Demonstration

[</video>](https://github.com/user-attachments/assets/6a4a24d9-495f-4794-b614-c1f5538ff559)

## 💡 Design Philosophy
Based on Human-Computer Interaction research and user survey insights, this project addresses the perspective change in user preferences. When surveyed about website design priorities, 57% of users preferred simplicity while 43% wanted feature-rich interfaces.

Solution: A hybrid approach that satisfies both user groups:

1. Simple, clean homepage for users who value minimalism

2. Feature-rich dedicated pages for users who want advanced functionality

3. Progressive disclosure - users can choose their level of engagement

This design philosophy demonstrates how understanding user perspectives can drive thoughtful interface decisions, creating an inclusive experience that doesn't force users to choose between simplicity and functionality.

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

### Jira https://ufl-team-agrol4kk.atlassian.net/jira/polaris/projects/GAH/ideas/view/7181920

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

## 📝 License

Copyright [2025] [Anvesh gupta]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
