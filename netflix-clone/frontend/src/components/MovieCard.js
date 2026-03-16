import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieCard.css';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function MovieCard({ movie }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <img
        src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.jpg'}
        alt={movie.title}
      />
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <span className="rating">⭐ {movie.vote_average?.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default MovieCard;
