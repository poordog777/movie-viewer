import { useState, useCallback, useEffect } from 'react';
import { Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import MovieGrid from '../../components/movie/MovieGrid/MovieGrid';
import { Movie } from '../../types/movie';
import { moviesAPI } from '../../api/movies';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setError(null);
        const response = await moviesAPI.getPopular();
        if (response?.results) {
          console.log('Loaded movies:', response.results);
          setMovies(response.results);
        } else {
          console.error('No results in response:', response);
          setError('無法載入電影資料');
        }
      } catch (error) {
        console.error('Failed to load movies:', error);
        setError('載入電影資料時發生錯誤');
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const handleMovieClick = useCallback((movieId: number) => {
    navigate(`/movie/${movieId}`);
  }, [navigate]);

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        熱門電影
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <MovieGrid
        movies={movies}
        loading={loading}
        onMovieClick={handleMovieClick}
      />
    </PageContainer>
  );
};

export default Home;