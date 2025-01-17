import helmet from 'helmet';
import { Express } from 'express';

export const setupSecurity = (app: Express) => {
  app.use(helmet());
  
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