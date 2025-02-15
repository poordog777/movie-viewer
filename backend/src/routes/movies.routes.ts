import { Router } from 'express';
import MovieController from '../controllers/movie.controller';
import { validateRequest } from '../middleware/validator.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { movieValidators } from '../validators/movie.validator';

const router = Router();

/**
 * @swagger
 * /api/v1/movies/popular:
 *   get:
 *     summary: 取得近期熱門電影
 *     tags: [Movies]
 *     description: 取得按上映日期排序的前 30 部熱門電影
 *     responses:
 *       200:
 *         description: 成功取得電影列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PopularMovie'
 */
router.get('/popular', MovieController.getPopularMovies);

/**
 * @swagger
 * /api/v1/movies/search:
 *   get:
 *     summary: 搜尋電影
 *     tags: [Movies]
 *     description: 根據關鍵字搜尋電影
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: 搜尋關鍵字
 *         example: "蜘蛛人"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 1
 *         required: false
 *         description: 頁碼
 *     responses:
 *       200:
 *         description: 成功取得搜尋結果
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SearchMovie'
 *                     total_pages:
 *                       type: integer
 *                       example: 5
 *                     total_results:
 *                       type: integer
 *                       example: 100
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/search',
  validateRequest(movieValidators.searchQuery, 'query'),
  MovieController.searchMovies
);

/**
 * @swagger
 * /api/v1/movies/{movieId}:
 *   get:
 *     summary: 取得電影詳細資訊
 *     tags: [Movies]
 *     description: 取得指定電影的詳細資訊
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 電影ID
 *         example: 634649
 *     responses:
 *       200:
 *         description: 成功取得電影詳情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/MovieDetail'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/MovieNotFound'
 */
router.get('/:movieId',
  validateRequest(movieValidators.movieId, 'params'),
  MovieController.getMovieById
);

/**
 * @swagger
 * /api/v1/movies/{movieId}/rating:
 *   post:
 *     summary: 評分電影
 *     tags: [Movies]
 *     security:
 *       - BearerAuth: []
 *     description: 為指定電影評分（需要JWT認證）
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 電影ID
 *         example: 634649
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: 評分(1-10分)
 *                 example: 8
 *     responses:
 *       200:
 *         description: 評分成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/RatingResponse'
 *                 message:
 *                   type: string
 *                   example: 評分成功
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/MovieNotFound'
 */
router.post(
  '/:movieId/rating',
  authenticate,
  validateRequest(movieValidators.movieId, 'params'),
  validateRequest(movieValidators.movieRating, 'body'),
  MovieController.rateMovie
);

export default router;