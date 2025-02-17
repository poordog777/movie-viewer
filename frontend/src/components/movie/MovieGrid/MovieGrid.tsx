import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Movie } from '../../../types/movie';
import MovieCard from '../MovieCard/MovieCard';
import InfiniteScroll from '../../common/InfiniteScroll/InfiniteScroll';

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onMovieClick?: (movieId: number) => void;
}

const GridContainer = styled(Grid)`
  padding: ${({ theme }) => theme.spacing(2, 0)};
`;

const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  loading,
  hasMore,
  onLoadMore,
  onMovieClick
}) => {
  return (
    <InfiniteScroll
      loading={loading}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
    >
      <GridContainer container spacing={2}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
            <MovieCard
              movie={movie}
              onClick={onMovieClick}
            />
          </Grid>
        ))}
      </GridContainer>
    </InfiniteScroll>
  );
};

export default MovieGrid;