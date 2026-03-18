// ========== FINAL server.js ==========

// 1. TEST DEFAULTS FIRST (before any imports run)
if (process.env.NODE_ENV === 'test') {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-min-32-chars-long!!';
  process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
  process.env.TMDB_API_KEY = process.env.TMDB_API_KEY || 'fake-tmdb-key-for-testing';
  process.env.PORT = process.env.PORT || '0';
  // Note: MONGODB_URI is NOT set here - tests handle their own database
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

// 2. DATABASE CONNECTION (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  if (!process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is not defined');
    process.exit(1);
  }
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

// 3. MIDDLEWARE
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// 4. HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 5. ROUTES
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);

// 6. 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 7. ERROR HANDLER
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 8. SERVER START (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;