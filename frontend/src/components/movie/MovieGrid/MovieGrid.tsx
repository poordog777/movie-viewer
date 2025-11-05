import { CircularProgress, Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Movie } from '../../../types/movie';
import MovieCard from '../MovieCard/MovieCard';

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  onMovieClick?: (movieId: number) => void;
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  width: '100%'
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(3)
}));

const MovieGrid: React.FC<MovieGridProps> = ({
  movies = [],
  loading,
  onMovieClick
}) => {
  if (loading) {
    return (
      <LoadingContainer data-testid="loading-indicator">
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (!movies?.length) {
    return null;
  }

  return (
    <StyledGrid container spacing={2} data-testid="movie-grid">
      {movies.map((movie) => (
        <Grid item xs={12} sm={6} md={3} lg={2.4} key={movie.id}>
          <MovieCard
            movie={movie}
            onClick={onMovieClick}
          />
        </Grid>
      ))}
    </StyledGrid>
  );
};

export default MovieGrid;