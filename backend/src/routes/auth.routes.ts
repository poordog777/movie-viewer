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

router.get('/google', (req: Request, res: Response) => {
  const state = StateManager.generateState();
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state
  })(req, res);
});

router.get('/google/callback',
  validateRequest(googleCallbackSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { state } = req.query;
    
    if (!state || !StateManager.verifyState(state as string)) {
      throw new BusinessError(
        '登入流程已過期，請重新點擊登入按鈕重試',
        ErrorCodes.AUTH_GOOGLE_STATE_INVALID,
        401
      );
    }
    
    passport.authenticate('google', { session: false }, (err: AuthError | null, user: User | false) => {
      if (err) {
        if (!err.status) {
          err.status = 401;
        }
        return next(err);
      }
      
      if (!user) {
        return next(new BusinessError(
          'Google 登入發生問題，請確認您的 Google 帳號正常後重試',
          ErrorCodes.AUTH_GOOGLE_ERROR,
          401
        ));
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
    });
  }
);

export default router;