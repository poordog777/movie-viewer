import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { createResponse } from '../types/response';
import { BusinessError, ErrorCodes } from '../types/error';
import { catchAsync } from '../middleware/error.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validator.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator';
import bcrypt from 'bcrypt';

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: 取得個人資料
 *     description: 取得當前登入用戶的個人資料
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得個人資料
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: 成功取得個人資料
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/profile',
  authenticate,
  catchAsync(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
 *     description: 更新當前登入用戶的個人資料，可以選擇性地更新名稱或電子郵件
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "新用戶名稱"
 *                 description: 2-50個字元
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "new@example.com"
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     status:
 *                       example: success
 *                     message:
 *                       example: 個人資料更新成功
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/profile',
  authenticate,
  validateRequest(updateProfileSchema),
  catchAsync(async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const userId = req.user!.id;

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
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/password',
  authenticate,
  validateRequest(changePasswordSchema),
  catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    // 取得用戶資料（含密碼）
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // 驗證當前密碼
    if (!(await bcrypt.compare(currentPassword, user!.password))) {
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