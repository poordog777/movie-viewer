import { Request, Response, NextFunction } from 'express';
import MovieService from '../services/movie.service';
import { AppError, ErrorCodes } from '../types/error';

class MovieController {
  /**
   * 取得近期熱門電影
   * GET /movies/popular
   */
  async getPopularMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await MovieService.getPopularMovies();
      res.json(result);
    } catch (error) {
      // 如果是已知的應用程式錯誤，直接傳遞
      if (error instanceof AppError) {
        next(error);
        return;
      }

      // 其他未知錯誤，包裝為內部伺服器錯誤
      next(new AppError(
        500,
        'Internal server error',
        ErrorCodes.INTERNAL_SERVER_ERROR
      ));
    }
  }
}

export default new MovieController();