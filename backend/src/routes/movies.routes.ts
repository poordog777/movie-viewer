import { Router } from 'express';
import MovieController from '../controllers/movie.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: 電影相關的 API
 */

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
 *               required:
 *                 - movies
 *                 - total
 *               properties:
 *                 movies:
 *                   type: array
 *                   description: 熱門電影列表
 *                   items:
 *                     type: object
 *                     required:
 *                       - id
 *                       - title
 *                       - posterPath
 *                       - releaseDate
 *                       - popularity
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: 電影 ID
 *                         example: 12345
 *                       title:
 *                         type: string
 *                         description: 電影標題
 *                         example: "玩具總動員 4"
 *                       posterPath:
 *                         type: string
 *                         nullable: true
 *                         description: 海報圖片路徑
 *                         example: "/9TXzaOhPy1ub2OfzdyQJ0V5IEY7.jpg"
 *                       releaseDate:
 *                         type: string
 *                         format: date
 *                         description: 上映日期
 *                         example: "2024-01-01"
 *                       popularity:
 *                         type: number
 *                         format: float
 *                         description: 熱門程度
 *                         example: 123.45
 *                 total:
 *                   type: integer
 *                   description: 回傳的電影總數
 *                   example: 30
 */
router.get('/popular', MovieController.getPopularMovies);

export default router;