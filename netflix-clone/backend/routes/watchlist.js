const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user's watchlist
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('watchlist');
    res.json({ watchlist: user.watchlist });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Add movie to watchlist
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, title, posterPath } = req.body;
    
    if (!movieId) {
      return res.status(400).json({ error: 'Movie ID required' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check if already in watchlist
    const exists = user.watchlist.some(item => item.movieId === movieId);
    if (exists) {
      return res.status(400).json({ error: 'Movie already in watchlist' });
    }
    
    user.watchlist.push({ movieId, title, posterPath });
    await user.save();
    
    res.status(201).json({ 
      message: 'Added to watchlist',
      watchlist: user.watchlist 
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Remove movie from watchlist
router.delete('/:movieId', auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.watchlist = user.watchlist.filter(
      item => item.movieId !== parseInt(movieId)
    );
    await user.save();
    
    res.json({ 
      message: 'Removed from watchlist',
      watchlist: user.watchlist 
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

// Check if movie is in watchlist
router.get('/check/:movieId', auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user._id);
    
    const inWatchlist = user.watchlist.some(
      item => item.movieId === parseInt(movieId)
    );
    
    res.json({ inWatchlist });
  } catch (error) {
    console.error('Error checking watchlist:', error);
    res.status(500).json({ error: 'Failed to check watchlist' });
  }
});

module.exports = router;
