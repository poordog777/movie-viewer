import { Router, Request, Response, NextFunction } from 'express';
import { validateRequest } from '../middleware/validator.middleware';
import { movieValidators } from '../validators/movie.validator';
import { TMDBService } from '../services/tmdb/tmdb.service';
import { catchAsync } from '../middleware/error.middleware';
import { createResponse } from '../types/response';
import { env } from '../config/env';

const router = Router();
const tmdbService = new TMDBService(env.tmdbApiKey || '');

/**
 * @swagger
 * /api/v1/movies/popular:
 *   get:
 *     tags: [Movies]
 *     summary: 獲取熱門電影列表
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *     responses:
 *       200:
 *         description: 成功
 *       400:
 *         description: 無效的請求參數
 */
router.get('/popular', 
  validateRequest(movieValidators.pageQuery),
  catchAsync(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const result = await tmdbService.getPopularMovies({ page });
    res.json(createResponse('success', result.data));
  })
);

/**
 * @swagger
 * /api/v1/movies/now-playing:
 *   get:
 *     tags: [Movies]
 *     summary: 獲取正在上映的電影
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *     responses:
 *       200:
 *         description: 成功
 *       400:
 *         description: 無效的請求參數
 */
router.get('/now-playing',
  validateRequest(movieValidators.pageQuery),
  catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const result = await tmdbService.getNowPlayingMovies({ page });
    res.json(createResponse('success', result.data));
  })
);

/**
 * @swagger
 * /api/v1/movies/upcoming:
 *   get:
 *     tags: [Movies]
 *     summary: 獲取即將上映的電影
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *     responses:
 *       200:
 *         description: 成功
 *       400:
 *         description: 無效的請求參數
 */
router.get('/upcoming',
  validateRequest(movieValidators.pageQuery),
  catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const result = await tmdbService.getUpcomingMovies({ page });
    res.json(createResponse('success', result.data));
  })
);

/**
 * @swagger
 * /api/v1/movies/{id}:
 *   get:
 *     tags: [Movies]
 *     summary: 獲取電影詳情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 電影ID
 *     responses:
 *       200:
 *         description: 成功
 *       404:
 *         description: 電影不存在
 */
/**
 * @swagger
 * /api/v1/movies/search:
 *   get:
 *     tags: [Movies]
 *     summary: 搜索電影
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: 搜索關鍵詞
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *     responses:
 *       200:
 *         description: 成功
 *       400:
 *         description: 無效的請求參數
 */
router.get('/search',
  validateRequest(movieValidators.searchQuery, 'query'),
  catchAsync(async (req: Request, res: Response) => {
    const query = String(req.query.query);
    const page = Number(req.query.page) || 1;
    const result = await tmdbService.searchMovies({ query, page });
    res.json(createResponse('success', result.data));
  })
);

/**
 * @swagger
 * /api/v1/movies/{id}:
 *   get:
 *     tags: [Movies]
 *     summary: 獲取電影詳情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 電影ID
 *     responses:
 *       200:
 *         description: 成功
 *       404:
 *         description: 電影不存在
 */
router.get('/:id',
  validateRequest(movieValidators.movieId, 'params'),
  catchAsync(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await tmdbService.getMovieDetails({ id });
    res.json(createResponse('success', result.data));
  })
);

export default router;