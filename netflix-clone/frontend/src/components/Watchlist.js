import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MovieCard from './MovieCard';
import './Watchlist.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get(`${API_URL}/watchlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchlist(response.data.watchlist);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      await axios.delete(`${API_URL}/watchlist/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchlist(watchlist.filter(item => item.movieId !== movieId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (watchlist.length === 0) {
    return (
      <div className="watchlist-empty">
        <h2>Your watchlist is empty</h2>
        <p>Add movies to your watchlist to watch later!</p>
      </div>
    );
  }

  return (
    <div className="watchlist">
      <h1>My Watchlist</h1>
      <div className="movie-grid">
        {watchlist.map(item => (
          <div key={item.movieId} className="watchlist-item">
            <MovieCard 
              movie={{ 
                id: item.movieId, 
                title: item.title, 
                poster_path: item.posterPath 
              }} 
            />
            <button 
              className="remove-btn"
              onClick={() => removeFromWatchlist(item.movieId)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Watchlist;
