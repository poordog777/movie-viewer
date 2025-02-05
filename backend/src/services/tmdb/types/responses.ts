/**
 * TMDB API 錯誤類型枚舉
 */
export enum TMDBErrorType {
  INVALID_REQUEST = 'invalid_request',
  RESOURCE_NOT_FOUND = 'resource_not_found',
  SERVER_ERROR = 'server_error'
}

/**
 * TMDB API 錯誤響應
 */
export interface TMDBError {
  type: TMDBErrorType;
  message: string;
  statusCode: number;
}

/**
 * 電影基本資訊
 */
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

/**
 * 電影類型
 */
export interface Genre {
  id: number;
  name: string;
}

/**
 * 電影詳細資訊
 */
export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  runtime: number | null;
  genres: Genre[];
}

/**
 * 分頁電影列表響應
 */
export interface MovieListResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

/**
 * API 成功響應格式
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * API 錯誤響應格式
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}