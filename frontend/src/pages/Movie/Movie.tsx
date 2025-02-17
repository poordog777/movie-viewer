import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Rating,
  Button,
  Paper,
  Skeleton,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import { MovieDetail } from '../../types/movie';
import { moviesAPI } from '../../api/movies';
import { getPosterUrl } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

const PosterImage = styled('img')`
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows[4]};
`;

const MovieInfo = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(3)};
  height: 100%;
`;

const Movie: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  // 加載電影詳情
  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const data = await moviesAPI.getDetail(id);
        setMovie(data);
        setUserRating(data.userRating || null);
      } catch (error) {
        console.error('Failed to load movie:', error);
        setError('無法載入電影資訊');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // 提交評分
  const handleRate = useCallback(async (value: number | null) => {
    if (!id || !value || ratingLoading) return;

    setRatingLoading(true);
    try {
      const response = await moviesAPI.rateMovie(id, value);
      setUserRating(response.score);
      if (movie) {
        setMovie({
          ...movie,
          voteAverage: response.averageScore,
          userRating: response.score
        });
      }
    } catch (error) {
      console.error('Rating failed:', error);
      setError('評分失敗，請稍後再試');
    } finally {
      setRatingLoading(false);
    }
  }, [id, movie, ratingLoading]);

  if (loading) {
    return (
      <PageContainer>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={600} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={600} />
          </Grid>
        </Grid>
      </PageContainer>
    );
  }

  if (error || !movie) {
    return (
      <PageContainer>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || '找不到電影資訊'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          返回
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        返回
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <PosterImage
            src={getPosterUrl(movie.posterPath, 'large')}
            alt={movie.title}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <MovieInfo>
            <Typography variant="h4" gutterBottom>
              {movie.title}
            </Typography>
            
            {movie.tagline && (
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {movie.tagline}
              </Typography>
            )}

            <Box sx={{ my: 2 }}>
              <Typography variant="body1" paragraph>
                {movie.overview}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                上映日期：{new Date(movie.releaseDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                片長：{movie.runtime} 分鐘
              </Typography>
              <Typography variant="body2" color="text.secondary">
                類型：{movie.genres.map(g => g.name).join(', ')}
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                平均評分：{movie.voteAverage.toFixed(1)} / 10
              </Typography>
              <Rating
                value={movie.voteAverage / 2}
                readOnly
                precision={0.5}
              />
              <Typography variant="body2" color="text.secondary">
                ({movie.voteCount} 票)
              </Typography>
            </Box>

            {isAuthenticated && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  我的評分
                </Typography>
                <Rating
                  value={userRating}
                  onChange={(_, value) => handleRate(value)}
                  disabled={ratingLoading}
                  max={10}
                />
              </Box>
            )}
          </MovieInfo>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Movie;