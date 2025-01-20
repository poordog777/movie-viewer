import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError, ErrorCodes } from '../types/error';

interface TokenPayload {
  userId: number;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret!, {
    expiresIn: '7d'
  });
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.jwtSecret!) as TokenPayload;
  } catch (error) {
    throw new AppError(401, '無效的認證令牌', ErrorCodes.AUTH_INVALID_TOKEN);
  }
}; 