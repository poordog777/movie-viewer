import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes } from '../types/error';
import { verifyToken } from '../utils/jwt.utils';
import { prisma } from '../config/database';
import type { User } from '@prisma/client';

// 定義請求中的用戶型別
declare global {
  namespace Express {
    interface Request {
      user?: User;  // 使用 Prisma 的 User 型別
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, '請提供認證令牌', ErrorCodes.AUTH_INVALID_TOKEN);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true,
        name: true,
        google_id: true 
      }
    });

    if (!user) {
      throw new AppError(401, '用戶不存在', ErrorCodes.AUTH_INVALID_CREDENTIALS);
    }

    req.user = user as User;  // 明確的型別轉換
    next();
  } catch (error) {
    next(error);
  }
};