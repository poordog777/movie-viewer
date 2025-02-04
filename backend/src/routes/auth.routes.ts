import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database/postgresql';
import { createResponse } from '../types/response';
import { BusinessError, ErrorCodes } from '../types/error';
import { catchAsync } from '../middleware/error.middleware';
import { validateRequest } from '../middleware/validator.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import passport from 'passport';
import { StateManager } from '../config/oauth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '@prisma/client';

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
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        env.jwtSecret || 'your-secret-key',
        { expiresIn: '24h' }
      );

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
 *     summary: 用戶註冊
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
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.jwtSecret || 'your-secret-key',
      { expiresIn: '24h' }
    );

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
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        env.jwtSecret || 'your-secret-key',
        { expiresIn: '24h' }
      );

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