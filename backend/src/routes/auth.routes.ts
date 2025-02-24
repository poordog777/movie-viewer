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
router.get('/google', (req: Request, res: Response, next) => {
  const returnTo = req.query.return_to as string;
  console.log('Return to path:', returnTo);
  
  // 將路徑保存到state
  const state = returnTo
    ? Buffer.from(returnTo).toString('base64')
    : '';
    
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state
  })(req, res, next);
});

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
router.get('/google/callback', (req: Request, res: Response, next) => {
  // 檢查是否有錯誤（例如用戶取消登入）
  if (req.query.error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    // 從state解析重定向路徑
    let redirectPath = '/';
    if (req.query.state) {
      try {
        redirectPath = Buffer.from(req.query.state as string, 'base64').toString();
        console.log('Error case: decoded redirect path:', redirectPath);
      } catch (error) {
        console.error('Error case: failed to decode redirect path:', error);
      }
    }
    
    // 構建完整的回調URL
    const callbackUrl = new URL(`${frontendUrl}/auth/callback/google`);
    callbackUrl.searchParams.append('error', req.query.error as string);
    callbackUrl.searchParams.append('redirect', redirectPath);
    
    console.log('Error case: redirecting to:', callbackUrl.toString());
    return res.redirect(callbackUrl.toString());
  }

  // 如果沒有錯誤，繼續 Passport 認證
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      return res.redirect(frontendUrl);
    }
    
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    // 1. 構建認證回調基礎URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const callbackUrl = new URL(`${frontendUrl}/auth/callback/google`);

    // 2. 設置認證參數
    const authParams = new URLSearchParams({
      token,
      userId: user.id.toString(),
      name: user.name,
      email: user.email,
      picture: user.picture || ''
    });

    // 3. 從state解析重定向路徑
    let redirectPath = '/';
    if (req.query.state) {
      try {
        redirectPath = Buffer.from(req.query.state as string, 'base64').toString();
        console.log('Decoded redirect path:', redirectPath);
      } catch (error) {
        console.error('Failed to decode redirect path:', error);
      }
    }

    // 4. 添加重定向路徑
    authParams.append('redirect', redirectPath);

    // 5. 設置最終URL
    callbackUrl.search = authParams.toString();
    console.log('Final redirect URL:', callbackUrl.toString());

    // 6. 執行重定向
    res.redirect(callbackUrl.toString());
  })(req, res, next);
});

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