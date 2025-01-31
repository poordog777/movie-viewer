import { Router, Request, Response } from 'express';
import { prisma } from '../config/database/postgresql';
import { createResponse } from '../types/response';
import { BusinessError, ErrorCodes } from '../types/error';
import { generateToken } from '../utils/jwt.utils';
import { catchAsync } from '../middleware/error.middleware';
import bcrypt from 'bcrypt';
import { validateRequest } from '../middleware/validator.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

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
 *                 example: "user@example.com"
 *                 description: 必須是有效的電子郵件格式
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123"
 *                 description: 密碼長度至少 8 個字元
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
 *                   example: 請求資料格式錯誤：電子郵件格式不正確
 *                 errorCode:
 *                   type: string
 *                   example: INVALID_REQUEST_BODY
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
router.post('/login', 
  validateRequest(loginSchema),
  catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    // 查找用戶
    const user = await prisma.user.findUnique({ where: { email } });

    // 驗證密碼
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BusinessError(
        '電子郵件或密碼錯誤',
        ErrorCodes.AUTH_INVALID_CREDENTIALS
      );
    }

    // 生成令牌
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
  })
);

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
 *                 description: 使用者名稱不能為空
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "test@example.com"
 *                 description: 必須是有效的電子郵件格式
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123"
 *                 description: 密碼長度至少 8 個字元，必須包含大小寫字母和數字
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
 *                   example: 請求資料格式錯誤：密碼需包含大小寫字母和數字
 *                 errorCode:
 *                   type: string
 *                   example: INVALID_REQUEST_BODY
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

    // 生成令牌
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

export default router; 