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
        const genres = cachedMovie.genreIds.map(id => ({
          id,
          name: MOVIE_GENRES[id] || '未知類型'
        }));

        const movieData: TMDBMovie = {
          id: cachedMovie.id,
          title: cachedMovie.title,
          poster_path: cachedMovie.posterPath,
          release_date: cachedMovie.releaseDate,
          popularity: cachedMovie.popularity,
          original_title: cachedMovie.originalTitle || null,
          original_language: cachedMovie.originalLanguage || null,
          overview: cachedMovie.overview || null,
          backdrop_path: cachedMovie.backdropPath || null,
          vote_average: cachedMovie.voteAverage || null,
          vote_count: cachedMovie.voteCount || null,
          adult: cachedMovie.adult || false,
          video: cachedMovie.video || false,
          genre_ids: cachedMovie.genreIds,
          genres,  // 加入中文類型
          budget: cachedMovie.budget ?? undefined,
          revenue: cachedMovie.revenue ?? undefined,
          runtime: cachedMovie.runtime ?? undefined,
          homepage: cachedMovie.homepage ?? undefined,
          imdb_id: cachedMovie.imdbId ?? undefined,
          status: cachedMovie.status ?? undefined,
          tagline: cachedMovie.tagline ?? undefined,
          belongs_to_collection: cachedMovie.belongsToCollection ? JSON.parse(cachedMovie.belongsToCollection as string) : null,
          production_companies: cachedMovie.productionCompanies ? JSON.parse(cachedMovie.productionCompanies as string) : [],
          production_countries: cachedMovie.productionCountries ? JSON.parse(cachedMovie.productionCountries as string) : [],
          spoken_languages: cachedMovie.spokenLanguages ? JSON.parse(cachedMovie.spokenLanguages as string) : [],
          origin_country: cachedMovie.originCountry || []
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
    movieId: number;
    score: number;
    averageScore: number;
    totalVotes: number;
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
      const userVotes = movie.userVotes as Record<string, number>;
      const oldScore = userVotes[userId];
      const isNewVote = !oldScore;

      // 3. 計算新的評分統計
      let newVoteCount = movie.voteCount || 0;
      let newVoteAverage = movie.voteAverage || 0;

      if (isNewVote) {
        // 新評分
        newVoteCount++;
        newVoteAverage = ((newVoteAverage * (newVoteCount - 1)) + score) / newVoteCount;
      } else {
        // 更新評分
        newVoteAverage = ((newVoteAverage * newVoteCount) - oldScore + score) / newVoteCount;
      }

      // 4. 更新電影資料
      const updatedMovie = await prisma.movie.update({
        where: { id: movieId },
        data: {
          userVotes: {
            ...userVotes,
            [userId]: score
          },
          voteAverage: newVoteAverage,
          voteCount: newVoteCount
        }
      });

      // 5. 返回更新後的數據
      return {
        movieId: updatedMovie.id,
        score,
        averageScore: updatedMovie.voteAverage || 0,
        totalVotes: updatedMovie.voteCount || 0
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
        // 處理genres和genreIds
        const genreIds = movie.genres
          ? movie.genres.map(g => g.id)
          : movie.genre_ids || [];

        const movieData = {
          // 基本資訊
          id: movie.id,
          title: movie.title,
          originalTitle: movie.original_title || undefined,
          originalLanguage: movie.original_language || undefined,
          overview: movie.overview || undefined,
          tagline: movie.tagline || undefined,
          
          // 視覺元素
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path || undefined,
          
          // 時間和分類資訊
          releaseDate: movie.release_date,
          runtime: movie.runtime || undefined,
          genreIds,
          
          // 統計數據
          popularity: movie.popularity,
          voteAverage: movie.vote_average || undefined,
          voteCount: movie.vote_count || undefined,
          
          // 其他資訊
          adult: movie.adult || false,
          video: movie.video || false,
          
          // 製作資訊
          budget: movie.budget || undefined,
          revenue: movie.revenue || undefined,
          homepage: movie.homepage || undefined,
          imdbId: movie.imdb_id || undefined,
          status: movie.status || undefined,
          
          // 複雜資料結構
          belongsToCollection: movie.belongs_to_collection
            ? JSON.stringify(movie.belongs_to_collection)
            : undefined,
          productionCompanies: movie.production_companies
            ? JSON.stringify(movie.production_companies)
            : undefined,
          productionCountries: movie.production_countries
            ? JSON.stringify(movie.production_countries)
            : undefined,
          spokenLanguages: movie.spoken_languages
            ? JSON.stringify(movie.spoken_languages)
            : undefined,
          originCountry: movie.origin_country || undefined,
          
          // 快取時間
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
