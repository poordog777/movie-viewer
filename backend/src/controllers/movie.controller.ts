import { Request, Response, NextFunction } from 'express';
import MovieService from '../services/movie.service';
import { AppError, ErrorCodes } from '../types/error';
import type { User } from '@prisma/client';

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
   * GET /movies/search?query=關鍵字&page=1
   */
  async searchMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, page } = req.query;
      const result = await MovieService.searchMovies(
        query as string,
        Number(page)
      );
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
   * 取得電影詳細資訊
   * GET /movies/:movieId
   */
  async getMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movieId = Number(req.params.movieId);
      const movie = await MovieService.getMovieById(movieId);
      res.json(movie);
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
   * 評分電影
   * POST /movies/:movieId/rating
   */
  async rateMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movieId = Number(req.params.movieId);
      const userId = (req.user as User).id;
      const { score } = req.body;

      const result = await MovieService.rateMovie(movieId, userId, score);
      
      res.json({
        message: '評分成功',
        data: result
      });
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