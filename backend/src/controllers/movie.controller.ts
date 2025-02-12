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
      if (error instanceof AppError) {
        next(error);
        return;
      }
      next(new AppError(
        500,
        'Internal server error',
        ErrorCodes.INTERNAL_SERVER_ERROR
      ));
    }
  }

  /**
   * 搜尋電影
   * GET /movies/search?q=關鍵字
   */
  async searchMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q;
      
      // 驗證查詢參數
      if (!query || typeof query !== 'string') {
        throw new AppError(
          400,
          'Query parameter "q" is required',
          ErrorCodes.INVALID_REQUEST_BODY
        );
      }

      const result = await MovieService.searchMovies(query);
      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }
      next(new AppError(
        500,
        'Internal server error',
        ErrorCodes.INTERNAL_SERVER_ERROR
      ));
    }
  }
}

export default new MovieController();