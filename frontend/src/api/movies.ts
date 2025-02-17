import { Movie, MovieDetail } from '../types/movie';
import apiClient from './client';
import { routes } from './config';

interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

interface RatingResponse {
  movieId: number;
  score: number;
  averageScore: number;
  totalVotes: number;
}

export const moviesAPI = {
  /**
   * 獲取熱門電影列表
   * @param page - 頁碼
   */
  getPopular: async (page: number = 1): Promise<MovieResponse> => {
    return apiClient.get(routes.movies.popular, {
      params: { page }
    });
  },

  /**
   * 搜尋電影
   * @param query - 搜尋關鍵字
   * @param page - 頁碼
   */
  search: async (query: string, page: number = 1): Promise<MovieResponse> => {
    return apiClient.get(routes.movies.search, {
      params: { query, page }
    });
  },

  /**
   * 獲取電影詳情
   * @param id - 電影ID
   */
  getDetail: async (id: number | string): Promise<MovieDetail> => {
    return apiClient.get(routes.movies.detail(id));
  },

  /**
   * 評分電影
   * @param id - 電影ID
   * @param score - 評分 (1-10)
   */
  rateMovie: async (id: number | string, score: number): Promise<RatingResponse> => {
    return apiClient.post(routes.movies.rate(id), { score });
  }
};