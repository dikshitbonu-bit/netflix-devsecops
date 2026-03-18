import  { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './MovieDetails.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchMovieDetails();
    if (isAuthenticated) 
      checkWatchlist();
    
  }, [id, isAuthenticated]);

  const fetchMovieDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/movies/${id}`);
      setMovie(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setLoading(false);
    }
  };

  const checkWatchlist = async () => {
    try {
      const response = await axios.get(`${API_URL}/watchlist/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInWatchlist(response.data.inWatchlist);
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };

  const toggleWatchlist = async () => {
    if (!isAuthenticated) {
      alert('Please login to add to watchlist');
      return;
    }

    try {
      if (inWatchlist) {
        await axios.delete(`${API_URL}/watchlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInWatchlist(false);
      } else {
        await axios.post(
          `${API_URL}/watchlist`,
          {
            movieId: parseInt(id),
            title: movie.title,
            posterPath: movie.poster_path
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      alert('Failed to update watchlist');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!movie) {
    return <div className="error">Movie not found</div>;
  }

  return (
    <div className="movie-details">
      <div 
        className="backdrop"
        style={{
          backgroundImage: `url(${IMAGE_BASE_URL}${movie.backdrop_path})`
        }}
      >
        <div className="backdrop-overlay"></div>
      </div>
      
      <div className="details-content">
        <img
          src={`${IMAGE_BASE_URL}${movie.poster_path}`}
          alt={movie.title}
          className="poster"
        />
        <div className="info">
          <h1>{movie.title}</h1>
          <div className="meta">
            <span className="rating">⭐ {movie.vote_average?.toFixed(1)}</span>
            <span className="year">{movie.release_date?.split('-')[0]}</span>
            <span className="runtime">{movie.runtime} min</span>
          </div>
          <p className="overview">{movie.overview}</p>
          <div className="genres">
            {movie.genres?.map(genre => (
              <span key={genre.id} className="genre">{genre.name}</span>
            ))}
          </div>
          {isAuthenticated && (
            <button 
              className={`watchlist-btn ${inWatchlist ? 'in-watchlist' : ''}`}
              onClick={toggleWatchlist}
            >
              {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
