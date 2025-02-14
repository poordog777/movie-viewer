import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { AppError, ErrorCodes } from '../types/error';
import { MOVIE_GENRES, getGenreNames } from '../utils/movie-genres';

const prisma = new PrismaClient();

// TMDB API 回傳格式
interface TMDBMovie {
  // 必填欄位
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  popularity: number;

  // 選填欄位
  original_title: string | null;
  original_language: string | null;
  overview: string | null;
  backdrop_path: string | null;
  vote_average: number | null;
  vote_count: number | null;
  adult: boolean;
  video: boolean;
  genre_ids: number[];
}

// TMDB API 回傳的分頁格式
interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// 首頁電影格式
interface PopularMovie {
  id: number;
  title: string;
  posterPath: string;
  releaseDate: string;
  popularity: number;
}

// 搜尋結果電影格式
interface SearchMovie {
  id: number;
  title: string;
  originalTitle: string;
  posterPath: string;
  releaseDate: string;
}

interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

class MovieService {
  private tmdbApiKey: string;
  private tmdbBaseUrl: string;
  private CACHE_DURATION = 3 * 60 * 60 * 1000; // 3小時的毫秒數

  constructor() {
    this.tmdbApiKey = process.env.TMDB_API_KEY || '';
    this.tmdbBaseUrl = 'https://api.themoviedb.org/3';

    if (!this.tmdbApiKey) {
      throw new AppError(500, 'TMDB API key is not configured', ErrorCodes.EXTERNAL_API_ERROR);
    }
  }

  /**
   * 取得近期熱門電影
   */
  async getPopularMovies(): Promise<PaginatedResponse<PopularMovie>> {
    try {
      // 1. 檢查快取
      const { isExpired, movies } = await this.checkCache();

      // 2. 如果快取有效，直接返回
      if (!isExpired && movies.length > 0) {
        return {
          page: 1,
          results: movies,
          total_pages: 1,
          total_results: movies.length
        };
      }

      // 3. 快取過期，從 TMDB 獲取新資料
      const response = await this.fetchTMDBPopularMovies();
      const validMovies = this.filterValidMovies(response.results);

      // 4. 更新快取並返回結果
      await this.cacheMovies(validMovies);
      const results = validMovies.map(this.transformToPopularMovie);

      return {
        page: 1,
        results,
        total_pages: 1,
        total_results: results.length
      };
    } catch (error) {
      console.error('Failed to fetch popular movies:', error);
      throw new AppError(
        500,
        'Failed to fetch popular movies',
        ErrorCodes.MOVIE_UPDATE_FAILED
      );
    }
  }

  /**
   * 搜尋電影
   */
  async searchMovies(query: string, page: number = 1): Promise<PaginatedResponse<SearchMovie>> {
    if (!query.trim()) {
      return {
        page,
        results: [],
        total_pages: 0,
        total_results: 0
      };
    }

    try {
      // 1. 從 TMDB 搜尋電影
      const response = await axios.get<TMDBResponse>(`${this.tmdbBaseUrl}/search/movie`, {
        params: {
          api_key: this.tmdbApiKey,
          query: query.trim(),
          language: 'zh-TW',
          region: 'TW',
          include_adult: false,
          page: page
        }
      });

      const movies = response.data.results;

      // 2. 過濾有效的電影資料
      const validMovies = movies.filter(movie =>
        typeof movie.id === 'number' &&
        movie.title &&
        movie.original_title &&
        movie.poster_path &&
        movie.release_date &&
        typeof movie.popularity === 'number'
      ) as TMDBMovie[];

      // 3. 存到 DB 做為紀錄
      await this.cacheMovies(validMovies);

      // 4. 轉換成搜尋結果格式
      const results = validMovies.map(movie => ({
        id: movie.id,
        title: movie.title,
        originalTitle: movie.original_title!,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date
      }));

      // 4. 返回結果
      return {
        page: response.data.page,
        results,
        total_pages: response.data.total_pages,
        total_results: response.data.total_results
      };
    } catch (error) {
      console.error('Failed to search movies:', error);
      throw new AppError(
        500,
        'Failed to search movies',
        ErrorCodes.EXTERNAL_API_ERROR
      );
    }
  }

  /**
   * 檢查快取狀態並返回快取的電影
   */
  private async checkCache(): Promise<{ isExpired: boolean; movies: PopularMovie[] }> {
    // 檢查最新快取時間
    const mostRecent = await prisma.movie.findFirst({
      orderBy: { cachedAt: 'desc' }
    });

    const isExpired = !mostRecent?.cachedAt ||
      (new Date().getTime() - mostRecent.cachedAt.getTime() > this.CACHE_DURATION);

    if (isExpired) {
      return { isExpired: true, movies: [] };
    }

    // 取得快取的熱門電影
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        title: true,
        posterPath: true,
        releaseDate: true,
        popularity: true,
      },
      orderBy: { popularity: 'desc' },
      take: 30
    });

    return {
      isExpired: false,
      movies
    };
  }

  /**
   * 從 TMDB API 取得熱門電影
   */
  private async fetchTMDBPopularMovies(): Promise<TMDBResponse> {
    try {
      const response = await axios.get<TMDBResponse>(`${this.tmdbBaseUrl}/movie/popular`, {
        params: {
          api_key: this.tmdbApiKey,
          language: 'zh-TW',
          page: 1,
          region: 'TW'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch TMDB popular movies:', error);
      throw new AppError(
        500,
        'Failed to fetch movies from TMDB',
        ErrorCodes.EXTERNAL_API_ERROR
      );
    }
  }

  /**
   * 過濾出有效的電影資料
   */
  private filterValidMovies(movies: TMDBMovie[]): TMDBMovie[] {
    return movies
      .slice(0, 50) // 先取前50部
      .filter(movie =>
        typeof movie.id === 'number' &&
        movie.title &&
        movie.poster_path &&
        movie.release_date &&
        typeof movie.popularity === 'number'
      )
      .slice(0, 30); // 最後只要30部
  }

  /**
   * 轉換成首頁需要的格式
   */
  private transformToPopularMovie(movie: TMDBMovie): PopularMovie {
    return {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,  // 移除 ! 因為已經在 filter 中確保存在
      releaseDate: movie.release_date,
      popularity: movie.popularity
    };
  }

  /**
   * 將電影資料存入資料庫
   */
  private async cacheMovies(movies: TMDBMovie[]): Promise<void> {
    try {
      const now = new Date();
      await Promise.all(movies.map(movie => {
        const movieData = {
          id: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          releaseDate: movie.release_date,
          popularity: movie.popularity,
          originalTitle: movie.original_title || undefined,
          originalLanguage: movie.original_language || undefined,
          overview: movie.overview || undefined,
          backdropPath: movie.backdrop_path || undefined,
          voteAverage: movie.vote_average || undefined,
          voteCount: movie.vote_count || undefined,
          adult: movie.adult || false,
          video: movie.video || false,
          genreIds: movie.genre_ids,
          cachedAt: now
        };

        return prisma.movie.upsert({
          where: { id: movie.id },
          update: movieData,
          create: movieData
        });
      }));
    } catch (error) {
      console.error('Failed to cache movies:', error);
      throw new AppError(
        500,
        'Failed to cache movies',
        ErrorCodes.DATABASE_ERROR
      );
    }
  }
}

export default new MovieService();
