export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const POSTER_SIZES = {
  small: 'w185',
  medium: 'w342',
  large: 'w500'
} as const;

export const getPosterUrl = (path: string | null, size: keyof typeof POSTER_SIZES = 'medium'): string => {
  if (!path) return '/placeholder.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES[size]}${path}`;
};

export const routes = {
  auth: {
    google: '/auth/google',
    logout: '/auth/logout'
  },
  movies: {
    popular: '/movies/popular',
    search: '/movies/search',
    detail: (id: number | string) => `/movies/${id}`,
    rate: (id: number | string) => `/movies/${id}/rating`
  }
} as const;