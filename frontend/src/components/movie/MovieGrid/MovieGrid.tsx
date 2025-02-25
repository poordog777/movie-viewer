import { CircularProgress, Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Movie } from '../../../types/movie';
import MovieCard from '../MovieCard/MovieCard';

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  onMovieClick?: (movieId: number) => void;
}

const StyledGrid = styled(Grid)`
  padding: ${({ theme }) => theme.spacing(2, 0)};
  width: 100%;
`;

const LoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const MovieGrid: React.FC<MovieGridProps> = ({
  movies = [],
  loading,
  onMovieClick
}) => {
  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (!movies?.length) {
    return null;
  }

  return (
    <StyledGrid container spacing={2}>
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