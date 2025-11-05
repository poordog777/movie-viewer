import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Movie } from '../../../types/movie';
import { TMDB_IMAGE_BASE_URL, POSTER_SIZES } from '../../../api/config';

interface MovieCardProps {
  movie: Movie;
  onClick?: (movieId: number) => void;
}

const StyledCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows[4]};
  }

  .MuiCardMedia-root {
    height: 350px;
    background-color: ${({ theme }) => theme.palette.grey[200]};
  }
  
  .MuiCardContent-root {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(2)};
  }

  .movie-info {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(0.5)};
  }

  .rating-container {
    margin-top: ${({ theme }) => theme.spacing(1)};
  }
`;

const MovieTitle = styled(Typography)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 48px;
`;

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const handleClick = () => {
    onClick?.(movie.id);
  };

  // 構建圖片 URL
  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES.medium}${
        movie.poster_path.startsWith('/') ? movie.poster_path : `/${movie.poster_path}`
      }`
    : 'https://via.placeholder.com/342x513?text=No+Image';

  return (
    <StyledCard onClick={handleClick} data-testid="movie-card">
      <CardMedia
        component="img"
        image={posterUrl}
        alt={movie.title}
      />
      <CardContent>
        <div className="movie-info">
          <MovieTitle variant="subtitle1" data-testid="movie-title">
            {movie.title}
          </MovieTitle>
          {movie.original_title && movie.original_title !== movie.title && (
            <Typography variant="body2" color="text.secondary">
              {movie.original_title}
            </Typography>
          )}
          {movie.release_date && (
            <Typography variant="body2" color="text.secondary">
              {new Date(movie.release_date).toLocaleDateString('zh-TW')}
            </Typography>
          )}
        </div>
      </CardContent>
    </StyledCard>
  );
};

export default MovieCard;