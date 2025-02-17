import { useState, useCallback } from 'react';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import MovieGrid from '../../components/movie/MovieGrid/MovieGrid';
import { Movie } from '../../types/movie';
import { moviesAPI } from '../../api/movies';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMovies = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await moviesAPI.getPopular(page);
      setMovies(prev => [...prev, ...response.results]);
      setHasMore(response.page < response.total_pages);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load movies:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  const handleMovieClick = useCallback((movieId: number) => {
    navigate(`/movie/${movieId}`);
  }, [navigate]);

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        熱門電影
      </Typography>
      <MovieGrid
        movies={movies}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMovies}
        onMovieClick={handleMovieClick}
      />
    </PageContainer>
  );
};

export default Home;