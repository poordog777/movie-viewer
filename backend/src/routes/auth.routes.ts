import { Router, Request, Response } from 'express';
import { createSuccessResponse } from '../types/response';
import { validateRequest } from '../middleware/validator.middleware';
import { googleCallbackSchema } from '../validators/auth.validator';
import passport from 'passport';
import { User } from '@prisma/client';
import { generateToken } from '../utils/jwt.utils';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Google OAuth 登入
 *     tags: [Auth]
 *     description: |
 *       重定向到 Google 登入頁面啟動 OAuth 流程
 *       
 *       使用方式：
 *       1. 在新分頁開啟此 URL
 *       2. 完成 Google 登入
 *       3. 登入成功後會獲得 JWT token
 *       
 *       注意：此 API 不支援在 Swagger UI 中直接測試
 *     responses:
 *       302:
 *         description: 重定向到 Google 登入頁面
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth 回調處理
 *     tags: [Auth]
 *     description: |
 *       處理 Google OAuth 回調，生成 JWT token
 *       
 *       注意：此端點由系統在 OAuth 流程中自動調用
 *     responses:
 *       200:
 *         description: 登入成功
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
 *                         token:
 *                           type: string
 *                           example: eyJhbGciOiJIUzI1NiIs...
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: 測試用戶
 *                             email:
 *                               type: string
 *                               example: test@example.com
 *                     message:
 *                       type: string
 *                       example: Google 登入成功
 */
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req: Request, res: Response) => {
    const user = req.user as User;
    
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.json(
      createSuccessResponse({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }, 'Google 登入成功')
    );
  }
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: 登出
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     description: 登出用戶（需要 JWT 認證）
 *     responses:
 *       200:
 *         description: 登出成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 登出成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/logout', authenticate, (req: Request, res: Response) => {
  res.json(createSuccessResponse(null, '登出成功'));
});

export default router;