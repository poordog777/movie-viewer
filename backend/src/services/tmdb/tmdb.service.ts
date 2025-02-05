import { TMDBApiClient } from './tmdb-api.client';
import { MovieListParams, MovieDetailsParams, SearchMoviesParams } from './types/params';
import { MovieListResponse, MovieDetails, SuccessResponse } from './types/responses';

/**
 * TMDB 服務類
 * 提供電影相關的高層次服務方法
 */
export class TMDBService {
  private readonly apiClient: TMDBApiClient;

  constructor(apiKey: string) {
    this.apiClient = new TMDBApiClient(apiKey);
  }

  /**
   * 獲取熱門電影列表
   */
  async getPopularMovies(params: MovieListParams = {}): Promise<SuccessResponse<MovieListResponse>> {
    const data = await this.apiClient.get<MovieListResponse>('/movie/popular', params);
    return {
      success: true,
      data
    };
  }

  /**
   * 獲取正在上映的電影
   */
  async getNowPlayingMovies(params: MovieListParams = {}): Promise<SuccessResponse<MovieListResponse>> {
    const data = await this.apiClient.get<MovieListResponse>('/movie/now_playing', params);
    return {
      success: true,
      data
    };
  }

  /**
   * 獲取即將上映的電影
   */
  async getUpcomingMovies(params: MovieListParams = {}): Promise<SuccessResponse<MovieListResponse>> {
    const data = await this.apiClient.get<MovieListResponse>('/movie/upcoming', params);
    return {
      success: true,
      data
    };
  }

  /**
   * 獲取電影詳情
   */
  async getMovieDetails(params: MovieDetailsParams): Promise<SuccessResponse<MovieDetails>> {
    const data = await this.apiClient.get<MovieDetails>(`/movie/${params.id}`);
    return {
      success: true,
      data
    };
  }

  /**
   * 搜索電影
   */
  async searchMovies(params: SearchMoviesParams): Promise<SuccessResponse<MovieListResponse>> {
    const data = await this.apiClient.get<MovieListResponse>('/search/movie', params);
    return {
      success: true,
      data
    };
  }

  /**
   * 構建完整的圖片URL
   */
  static buildImageUrl(path: string | null, size: 'original' | 'w500' = 'w500'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}