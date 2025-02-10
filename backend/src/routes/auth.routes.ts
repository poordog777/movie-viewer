import { Router, Request, Response, NextFunction } from 'express';
import { createResponse } from '../types/response';
import { BusinessError, ErrorCodes } from '../types/error';
import { validateRequest } from '../middleware/validator.middleware';
import { googleCallbackSchema } from '../validators/auth.validator';
import passport from 'passport';
import { StateManager } from '../config/oauth';
import { User } from '@prisma/client';
import { generateToken } from '../utils/jwt.utils';

interface AuthError extends Error {
  status?: number;
}

const router = Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags:
 *       - 認證
 *     summary: Google OAuth 登入
 *     description: 重定向到 Google 登入頁面進行身份認證
 *     responses:
 *       302:
 *         description: 重定向到 Google 登入頁面
 */
router.get('/google', (req: Request, res: Response) => {
  const state = StateManager.generateState();
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state
  })(req, res);
});

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags:
 *       - 認證
 *     summary: 處理 Google OAuth 回調
 *     description: 處理 Google 登入回調，驗證用戶身份並返回 JWT Token
 *     parameters:
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth state 參數
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth authorization code
 *     responses:
 *       200:
 *         description: 登入成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT Token，有效期 3 個月
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                 message:
 *                   type: string
 *                   example: "Google 登入成功"
 *       401:
 *         description: 驗證失敗
 *       400:
 *         description: 請求參數錯誤
 */
router.get('/google/callback',
  validateRequest(googleCallbackSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { state } = req.query;
    
    if (!state || !StateManager.verifyState(state as string)) {
      throw new BusinessError(
        '無效的狀態參數',
        ErrorCodes.AUTH_GOOGLE_STATE_INVALID
      );
    }
    
    passport.authenticate('google', { session: false }, (err: AuthError | null, user: User | false) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        throw new BusinessError(
          'Google 登入失敗',
          ErrorCodes.AUTH_GOOGLE_ERROR
        );
      }

      // 生成 JWT
      const token = generateToken({
        userId: user.id,
        email: user.email
      });

      res.json(
        createResponse('success', {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        }, 'Google 登入成功')
      );
    })(req, res, next);
  }
);

export default router;