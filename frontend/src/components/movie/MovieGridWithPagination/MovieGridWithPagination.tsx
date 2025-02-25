import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Movie } from '../../../types/movie';
import MovieCard from '../MovieCard/MovieCard';
import InfiniteScroll from '../../common/InfiniteScroll/InfiniteScroll';

interface MovieGridWithPaginationProps {
  movies: Movie[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onMovieClick?: (movieId: number) => void;
}

const StyledGrid = styled(Grid)`
  padding: ${({ theme }) => theme.spacing(2, 0)};
  width: 100%;
`;

const MovieGridWithPagination: React.FC<MovieGridWithPaginationProps> = ({
  movies = [],
  loading,
  hasMore,
  onLoadMore,
  onMovieClick
}) => {
  if (!movies?.length && !loading) {
    return null;
  }

  return (
    <InfiniteScroll
      loading={loading}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
    >
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
    </InfiniteScroll>
  );
};

export default MovieGridWithPagination;