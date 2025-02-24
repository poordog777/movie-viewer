export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const POSTER_SIZES = {
  small: 'w185',
  medium: 'w342',
  large: 'w500'
} as const;

export const getPosterUrl = (path: string | null, size: keyof typeof POSTER_SIZES = 'medium'): string => {
  if (!path) return 'https://via.placeholder.com/342x513?text=No+Image';
  if (!path.startsWith('/')) path = '/' + path;
  return `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES[size]}${path}`;
};

export const routes = {
  auth: {
    google: '/api/v1/auth/google',
    logout: '/api/v1/auth/logout',
    callback: '/api/v1/auth/google/callback'
  },
  movies: {
    popular: '/api/v1/movies/popular',
    search: '/api/v1/movies/search',
    detail: (id: number | string) => `/api/v1/movies/${id}`,
    rate: (id: number | string) => `/api/v1/movies/${id}/rating`
  }
} as const;