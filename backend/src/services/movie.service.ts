import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { AppError, ErrorCodes } from '../types/error';

const prisma = new PrismaClient();

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  popularity: number;
  overview: string;
  vote_average: number;
  vote_count: number;
}

interface Movie {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  popularity: number;
}

interface SearchMovie {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
}

interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

interface SearchMovieResponse {
  page: number;
  results: SearchMovie[];
  total_pages: number;
  total_results: number;
}

class MovieService {
  private tmdbApiKey: string;
  private tmdbBaseUrl: string;

  constructor() {
    this.tmdbApiKey = process.env.TMDB_API_KEY || '';
    this.tmdbBaseUrl = 'https://api.themoviedb.org/3';

    if (!this.tmdbApiKey) {
      throw new AppError(500, 'TMDB API key is not configured', ErrorCodes.EXTERNAL_API_ERROR);
    }
  }

  /**
   * 取得近期熱門電影（按上映日期排序）
   */
  async getPopularMovies(): Promise<MovieResponse> {
    try {
      // 取得兩頁資料以確保有足夠的電影可以篩選
      const [page1, page2] = await Promise.all([
        this.fetchTMDBPopularMovies(1),
        this.fetchTMDBPopularMovies(2)
      ]);

      // 合併兩頁的電影資料
      const allMovies = [...page1.results, ...page2.results];

      // 過濾掉沒有上映日期的電影，並按上映日期排序
      const sortedMovies = allMovies
        .filter(movie => movie.release_date)
        .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
        .slice(0, 30);  // 取前 30 部

      // 將電影資料快取到資料庫
      await this.cacheMovies(sortedMovies);

      const results = sortedMovies.map(this.transformToMovie);
      
      // 回傳符合 TMDB API 規格的資料
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
  async searchMovies(query: string, page: number = 1): Promise<SearchMovieResponse> {
    if (!query.trim()) {
      return {
        page,
        results: [],
        total_pages: 0,
        total_results: 0
      };
    }

    try {
      // 從 TMDB 搜尋電影
      const response = await axios.get(`${this.tmdbBaseUrl}/search/movie`, {
        params: {
          api_key: this.tmdbApiKey,
          query: query.trim(),
          language: 'zh-TW',
          region: 'TW',
          include_adult: false,  // 過濾成人內容
          page: page
        }
      });

      const movies = response.data.results as TMDBMovie[];

      // 將搜尋結果快取到資料庫
      await this.cacheMovies(movies);

      // 回傳符合 TMDB API 規格的資料
      return {
        page,
        results: movies.map(this.transformToSearchMovie),
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
   * 從 TMDB API 取得熱門電影
   */
  private async fetchTMDBPopularMovies(page: number) {
    try {
      const response = await axios.get(`${this.tmdbBaseUrl}/movie/popular`, {
        params: {
          api_key: this.tmdbApiKey,
          language: 'zh-TW',
          page,
          region: 'TW'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch TMDB popular movies page ${page}:`, error);
      throw new AppError(
        500,
        'Failed to fetch movies from TMDB',
        ErrorCodes.EXTERNAL_API_ERROR
      );
    }
  }

  /**
   * 將電影資料快取到資料庫
   */
  private async cacheMovies(movies: TMDBMovie[]): Promise<void> {
    try {
      await Promise.all(movies.map(movie => 
        prisma.movie.upsert({
          where: { id: movie.id },
          update: {
            title: movie.title,
            overview: movie.overview,
            posterPath: movie.poster_path,
            releaseDate: new Date(movie.release_date),
            popularity: movie.popularity,
            voteAverage: movie.vote_average,
            voteCount: movie.vote_count,
            cachedAt: new Date()
          },
          create: {
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            posterPath: movie.poster_path,
            releaseDate: new Date(movie.release_date),
            popularity: movie.popularity,
            voteAverage: movie.vote_average,
            voteCount: movie.vote_count
          }
        })
      ));
    } catch (error) {
      console.error('Failed to cache movies:', error);
      throw new AppError(
        500,
        'Failed to cache movies',
        ErrorCodes.DATABASE_ERROR
      );
    }
  }

  /**
   * 將 TMDB 電影資料轉換為標準格式（用於熱門電影列表）
   */
  private transformToMovie(movie: TMDBMovie): Movie {
    return {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      popularity: movie.popularity
    };
  }

  /**
   * 將 TMDB 電影資料轉換為搜尋結果格式
   */
  private transformToSearchMovie(movie: TMDBMovie): SearchMovie {
    return {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date
    };
  }
}

export default new MovieService();