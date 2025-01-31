import helmet from 'helmet';
import { Express } from 'express';
import rateLimit from 'express-rate-limit';

export const setupSecurity = (app: Express) => {
  // 設置基本安全頭
  app.use(helmet());
  
  // 設置 rate limit
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 分鐘
    max: 100 // 每個 IP 限制請求 100 次
  });
  app.use(limiter);
  
  // 設置 CORS 選項
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
  
  // 設置 CSP
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.themoviedb.org"]
      }
    })
  );
}; 