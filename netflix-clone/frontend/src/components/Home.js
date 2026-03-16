import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Home() {
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPopularMovies();
    fetchTrendingMovies();
  }, []);

  const fetchPopularMovies = async () => {
    try {
      const response = await axios.get(`${API_URL}/movies/popular`);
      setMovies(response.data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setLoading(false);
    }
  };

  const fetchTrendingMovies = async () => {
    try {
      const response = await axios.get(`${API_URL}/movies/trending`);
      setTrending(response.data.results);
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      const response = await axios.get(`${API_URL}/movies/search?query=${searchQuery}`);
      setMovies(response.data.results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <div className="hero">
        <h1>Unlimited movies, TV shows, and more</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <section className="movie-section">
        <h2>Trending Now</h2>
        <div className="movie-grid">
          {trending.slice(0, 6).map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section className="movie-section">
        <h2>Popular on Netflix</h2>
        <div className="movie-grid">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
