import { Router, Request, Response } from 'express';
import { prisma } from '../config/database/postgresql';
import { createResponse } from '../types/response';
import { BusinessError, ErrorCodes } from '../types/error';
import { catchAsync } from '../middleware/error.middleware';
import { validateRequest } from '../middleware/validator.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { User } from '@prisma/client';

const router = Router();

// JWT 認證中間件
const authenticate = passport.authenticate('jwt', { session: false });

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: 取得個人資料
 */
router.get('/profile',
  authenticate,
  catchAsync(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: (req.user as User).id },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      throw new BusinessError(
        '找不到用戶',
        ErrorCodes.USER_NOT_FOUND
      );
    }

    res.json(createResponse('success', { user }, '成功取得個人資料'));
  })
);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: 更新個人資料
 */
router.patch('/profile',
  authenticate,
  validateRequest(updateProfileSchema),
  catchAsync(async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const userId = (req.user as User).id;

    // 檢查新 email 是否已被使用
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        throw new BusinessError(
          '此信箱已被使用',
          ErrorCodes.USER_UPDATE_FAILED
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    res.json(createResponse('success', { user: updatedUser }, '個人資料更新成功'));
  })
);

/**
 * @swagger
 * /users/password:
 *   patch:
 *     summary: 變更密碼
 */
router.patch('/password',
  authenticate,
  validateRequest(changePasswordSchema),
  catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req.user as User).id;

    // 取得用戶資料
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new BusinessError(
        '找不到用戶',
        ErrorCodes.USER_NOT_FOUND
      );
    }

    // 檢查是否是 Google 登入用戶
    if (!user.password && user.googleId) {
      throw new BusinessError(
        'Google 登入用戶無法修改密碼',
        ErrorCodes.AUTH_GOOGLE_USER_EXISTS
      );
    }

    // 確保用戶有設置密碼
    if (!user.password) {
      throw new BusinessError(
        '用戶未設置密碼',
        ErrorCodes.AUTH_MISSING_FIELDS
      );
    }

    // 驗證當前密碼
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new BusinessError(
        '目前密碼不正確',
        ErrorCodes.AUTH_INVALID_PASSWORD
      );
    }

    // 更新密碼
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json(createResponse('success', null, '密碼更新成功'));
  })
);

export default router;