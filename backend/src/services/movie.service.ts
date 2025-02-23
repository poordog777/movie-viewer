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

  // 電影詳情選填欄位
  budget?: number;
  revenue?: number;
  runtime?: number;
  homepage?: string;
  imdb_id?: string;
  status?: string;
  tagline?: string;
  genres?: Array<{
    id: number;
    name: string;
  }>;

  // 複雜資料結構
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  production_companies?: {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }[];
  production_countries?: {
    iso_3166_1: string;
    name: string;
  }[];
  spoken_languages?: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  origin_country?: string[];
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
  poster_path: string;
  release_date: string;
  popularity: number;
}

// 搜尋結果電影格式
interface SearchMovie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string;
  release_date: string;
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

      // 3. 快取過期，從 TMDB 獲取新資料 (兩頁)
      const [page1Response, page2Response] = await Promise.all([
        this.fetchTMDBPopularMovies(1),
        this.fetchTMDBPopularMovies(2)
      ]);

      // 4. 合併兩頁結果並過濾
      const allMovies = [...page1Response.results, ...page2Response.results];
      const validMovies = this.filterValidMovies(allMovies);

      // 5. 更新快取並返回結果
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
        original_title: movie.original_title!,
        poster_path: movie.poster_path,
        release_date: movie.release_date
      }));

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
      orderBy: { cached_at: 'desc' }
    });

    const isExpired = !mostRecent?.cached_at ||
      (new Date().getTime() - mostRecent.cached_at.getTime() > this.CACHE_DURATION);

    if (isExpired) {
      return { isExpired: true, movies: [] };
    }

    // 取得快取的熱門電影
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        title: true,
        poster_path: true,
        release_date: true,
        popularity: true,
        vote_average: true
      },
      orderBy: { popularity: 'desc' },
      take: 30
    });

    // 轉換成預期的格式
    const transformedMovies = movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      popularity: movie.popularity
    }));

    return {
      isExpired: false,
      movies: transformedMovies
    };
  }

  /**
   * 從 TMDB API 取得熱門電影
   */
  private async fetchTMDBPopularMovies(page: number = 1): Promise<TMDBResponse> {
    try {
      const response = await axios.get<TMDBResponse>(`${this.tmdbBaseUrl}/movie/popular`, {
        params: {
          api_key: this.tmdbApiKey,
          language: 'zh-TW',
          page: page,
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
      .filter(movie =>
        typeof movie.id === 'number' &&
        movie.title &&
        movie.poster_path &&
        movie.release_date &&
        typeof movie.popularity === 'number'
      )
      .sort((a, b) => b.popularity - a.popularity) // 按熱門程度排序
      .slice(0, 30); // 取前30部
  }

  /**
   * 轉換成首頁需要的格式
   */
  private transformToPopularMovie(movie: TMDBMovie): PopularMovie {
    return {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      popularity: movie.popularity
    };
  }

  /**
   * 取得電影詳細資訊
   */
  async getMovieById(movieId: number): Promise<TMDBMovie> {
    try {
      // 1. 檢查資料庫是否有快取
      const cachedMovie = await prisma.movie.findUnique({
        where: { id: movieId }
      });

      // 2. 如果有快取就轉換格式和中文類型後返回
      if (cachedMovie) {
        const genres = cachedMovie.genre_ids.map(id => ({
          id,
          name: MOVIE_GENRES[id] || '未知類型'
        }));

        const movieData: TMDBMovie = {
          id: cachedMovie.id,
          title: cachedMovie.title,
          poster_path: cachedMovie.poster_path,
          release_date: cachedMovie.release_date,
          popularity: cachedMovie.popularity,
          original_title: cachedMovie.original_title || null,
          original_language: cachedMovie.original_language || null,
          overview: cachedMovie.overview || null,
          backdrop_path: cachedMovie.backdrop_path || null,
          vote_average: cachedMovie.vote_average || null,
          vote_count: cachedMovie.vote_count || null,
          adult: cachedMovie.adult || false,
          video: cachedMovie.video || false,
          genre_ids: cachedMovie.genre_ids,
          genres,  // 加入中文類型
          budget: cachedMovie.budget ?? undefined,
          revenue: cachedMovie.revenue ?? undefined,
          runtime: cachedMovie.runtime ?? undefined,
          homepage: cachedMovie.homepage ?? undefined,
          imdb_id: cachedMovie.imdb_id ?? undefined,
          status: cachedMovie.status ?? undefined,
          tagline: cachedMovie.tagline ?? undefined,
          belongs_to_collection: cachedMovie.belongs_to_collection ? JSON.parse(cachedMovie.belongs_to_collection as string) : null,
          production_companies: cachedMovie.production_companies ? JSON.parse(cachedMovie.production_companies as string) : [],
          production_countries: cachedMovie.production_countries ? JSON.parse(cachedMovie.production_countries as string) : [],
          spoken_languages: cachedMovie.spoken_languages ? JSON.parse(cachedMovie.spoken_languages as string) : [],
          origin_country: cachedMovie.origin_country || []
        };

        return movieData;
      }

      // 3. 從 TMDB API 獲取電影詳情
      const response = await axios.get<TMDBMovie>(`${this.tmdbBaseUrl}/movie/${movieId}`, {
        params: {
          api_key: this.tmdbApiKey,
          language: 'zh-TW',
          append_to_response: 'credits,keywords'
        }
      });

      const tmdbMovie = response.data;

      // 4. 存入資料庫（保存原始資料）
      await this.cacheMovies([tmdbMovie]);

      // 5. 如果有 genres，轉換成中文
      if (tmdbMovie.genres) {
        tmdbMovie.genres = tmdbMovie.genres.map(genre => ({
          id: genre.id,
          name: MOVIE_GENRES[genre.id] || '未知類型'
        }));
      }

      // 6. 回傳轉換後的資料
      return tmdbMovie;
    } catch (error) {
      // 1. AppError 直接往上拋
      if (error instanceof AppError) {
        throw error;
      }

      // 2. API 錯誤處理
      if (axios.isAxiosError(error)) {
        // API 回應錯誤
        if (error.response) {
          switch (error.response.status) {
            case 404:
              throw new AppError(404, '找不到該電影', ErrorCodes.MOVIE_NOT_FOUND);
            case 401:
              throw new AppError(401, 'TMDB API 驗證失敗', ErrorCodes.EXTERNAL_API_ERROR);
            case 429:
              throw new AppError(429, 'TMDB API 請求次數超限', ErrorCodes.EXTERNAL_API_ERROR);
            default:
              throw new AppError(error.response.status || 500,
                `TMDB API 請求失敗: ${error.response.data?.status_message || error.message}`,
                ErrorCodes.EXTERNAL_API_ERROR
              );
          }
        }
        
        // 網路或其他請求錯誤
        throw new AppError(500,
          `TMDB API 請求失敗: ${error.message}`,
          ErrorCodes.EXTERNAL_API_ERROR
        );
      }

      // 3. 其他未預期的錯誤
      console.error('Failed to get movie details:', error);
      throw new AppError(500,
        '伺服器內部錯誤',
        ErrorCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 評分電影
   */
  async rateMovie(movieId: number, userId: number, score: number): Promise<{
    movie_id: number;
    score: number;
    average_score: number;
    total_votes: number;
  }> {
    try {
      // 1. 檢查電影是否存在
      const movie = await prisma.movie.findUnique({
        where: { id: movieId }
      });

      if (!movie) {
        throw new AppError(404, '電影不存在', ErrorCodes.MOVIE_NOT_FOUND);
      }

      // 2. 解析目前的評分數據
      const user_votes = movie.user_votes as Record<string, number>;
      const old_score = user_votes[userId];
      const is_new_vote = !old_score;

      // 3. 計算新的評分統計
      let new_vote_count = movie.vote_count || 0;
      let new_vote_average = movie.vote_average || 0;

      if (is_new_vote) {
        // 新評分
        new_vote_count++;
        new_vote_average = ((new_vote_average * (new_vote_count - 1)) + score) / new_vote_count;
      } else {
        // 更新評分
        new_vote_average = ((new_vote_average * new_vote_count) - old_score + score) / new_vote_count;
      }

      // 4. 更新電影資料
      const updated_movie = await prisma.movie.update({
        where: { id: movieId },
        data: {
          user_votes: {
            ...user_votes,
            [userId]: score
          },
          vote_average: new_vote_average,
          vote_count: new_vote_count
        }
      });

      // 5. 返回更新後的數據
      return {
        movie_id: updated_movie.id,
        score,
        average_score: updated_movie.vote_average || 0,
        total_votes: updated_movie.vote_count || 0
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Failed to rate movie:', error);
      throw new AppError(
        500,
        'Failed to rate movie',
        ErrorCodes.MOVIE_UPDATE_FAILED
      );
    }
  }

  private async cacheMovies(movies: TMDBMovie[]): Promise<void> {
    try {
      const now = new Date();
      await Promise.all(movies.map(movie => {
        // 處理genres和genre_ids
        const genre_ids = movie.genres
          ? movie.genres.map(g => g.id)
          : movie.genre_ids || [];

        const movie_data = {
          id: movie.id,
          title: movie.title,
          original_title: movie.original_title || undefined,
          original_language: movie.original_language || undefined,
          overview: movie.overview || undefined,
          tagline: movie.tagline || undefined,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path || undefined,
          release_date: movie.release_date,
          runtime: movie.runtime || undefined,
          genre_ids,
          popularity: movie.popularity,
          vote_average: movie.vote_average || undefined,
          vote_count: movie.vote_count || undefined,
          adult: movie.adult || false,
          video: movie.video || false,
          budget: movie.budget || undefined,
          revenue: movie.revenue || undefined,
          homepage: movie.homepage || undefined,
          imdb_id: movie.imdb_id || undefined,
          status: movie.status || undefined,
          belongs_to_collection: movie.belongs_to_collection
            ? JSON.stringify(movie.belongs_to_collection)
            : undefined,
          production_companies: movie.production_companies
            ? JSON.stringify(movie.production_companies)
            : undefined,
          production_countries: movie.production_countries
            ? JSON.stringify(movie.production_countries)
            : undefined,
          spoken_languages: movie.spoken_languages
            ? JSON.stringify(movie.spoken_languages)
            : undefined,
          origin_country: movie.origin_country || undefined,
          cached_at: now
        };

        return prisma.movie.upsert({
          where: { id: movie.id },
          update: movie_data,
          create: movie_data
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
