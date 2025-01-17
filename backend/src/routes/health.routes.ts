import { Router } from 'express';
import { createResponse } from '../types/response';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: 檢查 API 服務狀態
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 服務正常運行
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 服務正常運行
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       example: 123.45
 *                     timestamp:
 *                       type: string
 *                       example: "2024-01-01T00:00:00.000Z"
 */
router.get('/health', (req, res) => {
  res.json(
    createResponse('success', {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }, '服務正常運行')
  );
});

export default router; 