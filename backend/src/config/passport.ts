import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { prisma } from './database';
import { googleOAuthConfig } from './oauth';
import { BusinessError, ErrorCodes } from '../types/error';
import { env } from './env';
import { User } from '@prisma/client';
import { Request } from 'express';

interface JwtPayload {
  userId: number;
  email: string;
}

type DoneCallback<T = any> = (error: any, user?: T | false, info?: { message: string }) => void;

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET 必須填寫');
}

// JWT Strategy
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.jwtSecret
  },
  async (payload: JwtPayload, done: DoneCallback<User>) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          googleId: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: googleOAuthConfig.clientID,
      clientSecret: googleOAuthConfig.clientSecret,
      callbackURL: googleOAuthConfig.callbackURL,
      passReqToCallback: true
    },
    async (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: DoneCallback<User>) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new BusinessError(
            'Google 帳號缺少 email',
            ErrorCodes.AUTH_GOOGLE_ERROR,
            401
          ));
        }

        // 使用 transaction 來處理並發問題
        const result = await prisma.$transaction(async (tx) => {
          const existingUser = await tx.user.findFirst({
            where: {
              OR: [
                { googleId: profile.id },
                { email }
              ]
            }
          });

          if (existingUser) {
            if (!existingUser.googleId) {
              return await tx.user.update({
                where: { id: existingUser.id },
                data: { googleId: profile.id }
              });
            }
            return existingUser;
          }

          return await tx.user.create({
            data: {
              email,
              name: profile.displayName || 'Unknown',
              googleId: profile.id,
            }
          });
        });

        return done(null, result);
      } catch (error) {
        if (error instanceof BusinessError) {
          return done(error);
        }
        return done(new BusinessError(
          'Google 登入處理失敗',
          ErrorCodes.AUTH_GOOGLE_ERROR,
          401
        ));
      }
    }
  )
);

export default passport;