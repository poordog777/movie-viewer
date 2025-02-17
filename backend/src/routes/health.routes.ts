import { Router } from 'express';
import { createSuccessResponse } from '../types/response';

const router = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: 檢查 API 服務狀態
 *     tags: [Health]
 *     description: 用於監控服務是否正常運作
 *     responses:
 *       200:
 *         description: 服務正常運行
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         uptime:
 *                           type: number
 *                           description: 服務運行時間(秒)
 *                           example: 123.45
 *                         timestamp:
 *                           type: string
 *                           description: 當前時間
 *                           example: "2024-01-01T00:00:00.000Z"
 *                     message:
 *                       type: string
 *                       example: 服務正常運行
 */
router.get('/', (req, res) => {
  res.json(
    createSuccessResponse({
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }, '服務正常運行')
  );
});

export default router;