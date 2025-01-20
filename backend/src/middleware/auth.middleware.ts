import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes } from '../types/error';
import { verifyToken } from '../utils/jwt.utils';
import { prisma } from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
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

    // 確認用戶存在
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      throw new AppError(401, '用戶不存在', ErrorCodes.AUTH_INVALID_CREDENTIALS);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}; 