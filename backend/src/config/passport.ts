import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './database/postgresql';
import { googleOAuthConfig } from './oauth';
import { BusinessError, ErrorCodes } from '../types/error';
import { env } from './env';
import bcrypt from 'bcrypt';

interface JwtPayload {
  userId: number;
  email: string;
}

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ 
        where: { email } 
      });

      if (!user || !user.password) {
        return done(null, false, { message: '帳號或密碼錯誤' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: '帳號或密碼錯誤' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// JWT Strategy
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.jwtSecret || 'your-secret-key' // 提供預設值避免 undefined
  },
  async (payload: JwtPayload, done: any) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          googleId: true
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
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // 檢查用戶是否已存在
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: profile.id },
              { email: profile.emails?.[0]?.value }
            ]
          }
        });

        if (existingUser) {
          // 如果用戶存在但沒有 googleId，更新它
          if (!existingUser.googleId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { googleId: profile.id }
            });
          }
          return done(null, existingUser);
        }

        // 創建新用戶
        const newUser = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value!,
            name: profile.displayName,
            googleId: profile.id,
            password: '' // Google 登入用戶不需要密碼
          }
        });

        return done(null, newUser);
      } catch (error) {
        if (error instanceof BusinessError) {
          return done(error);
        }
        return done(new BusinessError(
          'Google 登入處理失敗',
          ErrorCodes.AUTH_GOOGLE_ERROR
        ));
      }
    }
  )
);

// 序列化用戶資訊到 session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// 從 session 中反序列化用戶
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;