import { Card, CardMedia, CardContent, Typography, Rating } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Movie } from '../../../types/movie';
import { getPosterUrl } from '../../../api/config';

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

  return (
    <StyledCard onClick={handleClick}>
      <CardMedia
        component="img"
        image={getPosterUrl(movie.posterPath)}
        alt={movie.title}
      />
      <CardContent>
        <MovieTitle variant="subtitle1">
          {movie.title}
        </MovieTitle>
        <Typography variant="body2" color="text.secondary">
          {new Date(movie.releaseDate).getFullYear()}
        </Typography>
        <Rating
          value={movie.voteAverage / 2}
          precision={0.5}
          readOnly
          size="small"
        />
        <Typography variant="caption" color="text.secondary">
          {movie.voteAverage.toFixed(1)} / 10
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default MovieCard;