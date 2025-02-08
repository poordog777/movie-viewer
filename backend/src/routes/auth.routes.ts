import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { createResponse } from '../types/response';
import { BusinessError, ErrorCodes } from '../types/error';
import { catchAsync } from '../middleware/error.middleware';
import { validateRequest } from '../middleware/validator.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import passport from 'passport';
import { StateManager } from '../config/oauth';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { generateToken } from '../utils/jwt.utils';

interface AuthError extends Error {
  status?: number;
}

interface AuthInfo {
  message: string;
}

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用戶登入
 */
router.post('/login', 
  validateRequest(loginSchema),
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', { session: false }, (err: AuthError | null, user: User | false, info: AuthInfo | undefined) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        throw new BusinessError(
          info?.message || '登入失敗',
          ErrorCodes.AUTH_INVALID_CREDENTIALS
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
            email: user.email,
            name: user.name
          }
        }, '登入成功')
      );
    })(req, res, next);
  }
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - 認證
 *     summary: 用戶註冊
 *     description: 創建新用戶帳號並返回 JWT Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: 使用者名稱
 *                 example: "測試用戶"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件地址
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密碼（至少8字元，需包含大小寫字母和數字）
 *                 example: "Password123"
 *     responses:
 *       201:
 *         description: 註冊成功
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
 *                       description: JWT Token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "註冊成功"
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "密碼需包含大小寫字母和數字"
 *                 errorCode:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       409:
 *         description: 電子郵件已存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "此信箱已被註冊"
 *                 errorCode:
 *                   type: string
 *                   example: "AUTH_EMAIL_EXISTS"
 */
router.post('/register',
  validateRequest(registerSchema),
  catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // 檢查信箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new BusinessError(
        '此信箱已被註冊',
        ErrorCodes.AUTH_EMAIL_EXISTS
      );
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 創建用戶
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    // 生成 JWT
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.status(201).json(
      createResponse('success', {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }, '註冊成功')
    );
  })
);

// Google OAuth 登入
router.get('/google', (req: Request, res: Response) => {
  const state = StateManager.generateState();
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state
  })(req, res);
});

// Google OAuth 回調處理
router.get('/google/callback',
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