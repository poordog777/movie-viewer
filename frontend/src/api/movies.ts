import { Movie, MovieDetail } from '../types/movie';
import apiClient from './client';
import { routes } from './config';
import { AxiosError } from 'axios';

// API 響應的類型定義
interface PopularMovie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  original_title: string | null;
  backdrop_path: string | null;
  overview: string | null;
}

interface PopularMovieResponse {
  page: number;
  results: PopularMovie[];
  total_pages: number;
  total_results: number;
}

interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

interface ApiResponse<T> {
  status: 'success' | 'fail';
  data: T;
  message?: string;
}

export const moviesAPI = {
  /**
   * 獲取熱門電影列表（固定返回30部）
   */
  getPopular: async (): Promise<MovieResponse> => {
    try {
      console.log('Fetching popular movies...');
      const { data: apiResponse } = await apiClient.get<ApiResponse<PopularMovieResponse>>(routes.movies.popular);
      console.log('API Response:', apiResponse);
      const response = apiResponse.data;
      
      // 轉換 API 返回的格式，正確保留 popularity 字段
      return {
        page: response.page,
        total_pages: response.total_pages,
        total_results: response.total_results,
        results: response.results.map((movie: PopularMovie) => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average || 0,
          vote_count: movie.vote_count || 0,
          popularity: movie.popularity,
          original_title: movie.original_title || movie.title,
          backdrop_path: movie.backdrop_path,
          overview: movie.overview || ''
        }))
      };
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * 搜尋電影
   */
  search: async (query: string, page: number = 1): Promise<MovieResponse> => {
    const { data: apiResponse } = await apiClient.get<ApiResponse<MovieResponse>>(routes.movies.search, {
      params: { query, page }
    });
    return apiResponse.data;
  },

  /**
   * 獲取電影詳情
   */
  getDetail: async (id: number | string): Promise<MovieDetail> => {
    try {
      console.log('Fetching movie detail, auth header present:', !!localStorage.getItem('token'));
      const { data: apiResponse } = await apiClient.get<ApiResponse<MovieDetail>>(routes.movies.detail(id));
      console.log('Movie detail response:', apiResponse);
      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching movie detail:', error);
      if (error instanceof AxiosError) {
        console.error('API Error response:', error.response?.data);
      }
      throw error;
    }
  },

  /**
   * 評分電影
   */
  rateMovie: async (id: number | string, score: number) => {
    const { data: apiResponse } = await apiClient.post<ApiResponse<{ 
      movie_id: number; 
      score: number; 
      average_score: number; 
      total_votes: number; 
    }>>(routes.movies.rate(id), { score });
    return apiResponse.data;
  }
};