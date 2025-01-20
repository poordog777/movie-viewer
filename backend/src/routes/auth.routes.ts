import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { createResponse } from '../types/response';
import { AppError, BusinessError, ErrorCodes } from '../types/error';
import { generateToken } from '../utils/jwt.utils';
import { catchAsync } from '../middleware/error.middleware';
import bcrypt from 'bcrypt';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用戶登入
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
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
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 登入成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                         email:
 *                           type: string
 *       400:
 *         description: 請求錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: 請提供電子郵件和密碼
 *       401:
 *         description: 認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: 電子郵件或密碼錯誤
 *       500:
 *         description: 伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: 伺服器內部錯誤
 */
router.post('/login', catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BusinessError(
      '請提供電子郵件和密碼',
      ErrorCodes.AUTH_MISSING_FIELDS
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new BusinessError(
      '電子郵件或密碼錯誤',
      ErrorCodes.AUTH_INVALID_CREDENTIALS
    );
  }

  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  res.json(
    createResponse('success', {
      token,
      user: {
        id: user.id,
        email: user.email
      }
    }, '登入成功')
  );
}));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 用戶註冊
 *     tags: [Auth]
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
 *                 example: "Test User"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
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
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 註冊成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: 請求錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: 此信箱已被註冊
 */
router.post('/register', catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BusinessError(
      '請提供完整的註冊資訊',
      ErrorCodes.AUTH_MISSING_FIELDS
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new BusinessError(
      '此信箱已被註冊',
      ErrorCodes.AUTH_EMAIL_EXISTS
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  });

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
}));

export default router; 