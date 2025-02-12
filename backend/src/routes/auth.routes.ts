import { Router, Request, Response } from 'express';
import { createResponse } from '../types/response';
import { validateRequest } from '../middleware/validator.middleware';
import { googleCallbackSchema } from '../validators/auth.validator';
import passport from 'passport';
import { User } from '@prisma/client';
import { generateToken } from '../utils/jwt.utils';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google 回調路由
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req: Request, res: Response) => {
    const user = req.user as User;
    
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
  }
);

// 登出路由
router.post('/logout', authenticate, (req: Request, res: Response) => {
  res.json(createResponse('success', null, '登出成功'));
});

export default router;