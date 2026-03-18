# Netflix Clone

A full-stack Netflix clone application with user authentication, watchlist functionality, and TMDB API integration.

## Tech Stack

**Frontend:**
- React 18
- React Router
- Axios
- CSS3

**Backend:**
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- TMDB API integration
- Helmet (security)
- Compression

**Database:**
- MongoDB (user accounts, watchlists)

## Features

- User authentication (register/login with JWT)
- Browse popular and trending movies
- Search movies
- View movie details
- Add/remove movies to watchlist
- Persistent watchlist per user
- Responsive Netflix-style UI
- Secure password hashing (bcrypt)
- Protected API routes

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- TMDB API Key (get from https://www.themoviedb.org/settings/api)

## Local Development

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add:
# - TMDB_API_KEY
# - MONGODB_URI
# - JWT_SECRET
npm start
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3001`

## Environment Variables

### Backend (.env)
```
PORT=3000
TMDB_API_KEY=your_tmdb_api_key_here
MONGODB_URI=mongodb://localhost:27017/netflix
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3000/api
```

## API Endpoints

### Movies
- `GET /health` - Health check
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/search?query=term` - Search movies
- `GET /api/movies/:id` - Get movie details

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Watchlist (Protected Routes)
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add movie to watchlist
- `DELETE /api/watchlist/:movieId` - Remove from watchlist
- `GET /api/watchlist/check/:movieId` - Check if in watchlist

## Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Project Structure

```
.
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── backend/
    ├── models/
    │   └── User.js
    ├── routes/
    │   ├── movies.js
    │   ├── auth.js
    │   └── watchlist.js
    ├── middleware/
    │   └── auth.js
    ├── tests/
    │   ├── api.test.js
    │   ├── auth.test.js
    │   └── watchlist.test.js
    ├── server.js
    └── package.json
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes with middleware
- Helmet security headers
- CORS configuration
- Input validation (express-validator)
- Environment variable management


