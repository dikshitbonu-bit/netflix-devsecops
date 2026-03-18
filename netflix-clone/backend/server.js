// ========== FIXED server.js ==========

// 1. SET TEST DEFAULTS FIRST (before anything else runs)
if (process.env.NODE_ENV === 'test') {
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/netflix_test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-min-32-chars-long!!';
  process.env.TMDB_API_KEY = process.env.TMDB_API_KEY || 'fake-tmdb-key-for-testing';
  process.env.PORT = process.env.PORT || '0'; // Random port to avoid conflicts
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
require('dotenv').config();

const movieRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');

const app = express();
const PORT = process.env.PORT || 3000;

// 2. ONLY connect to MongoDB if URI exists (with error handling)
if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not defined');
  if (process.env.NODE_ENV !== 'test') process.exit(1);
} else {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res,) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 3. CONDITIONAL SERVER START (only if NOT test)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;