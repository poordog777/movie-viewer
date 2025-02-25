import express from 'express';
import cors, { CorsOptions } from 'cors';
import { setupConfig } from './config';
import { errorHandler, notFound } from './middleware/error.middleware';
import routes from './routes';
import passport from 'passport';

export const createApp = () => {
  const app = express();

  // 配置 CORS
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // 開發環境允許所有來源
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }
      
      // 生產環境檢查來源
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'https://movie-viewer.up.railway.app'
      ].filter(Boolean); // 過濾掉undefined
      
      // 檢查是否為Vercel應用
      const isVercelApp = origin ? /\.vercel\.app$/.test(origin) : false;
      
      if (!origin || allowedOrigins.includes(origin) || isVercelApp) {
        callback(null, true);
      } else {
        callback(new Error('不允許的來源'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(passport.initialize());

  setupConfig(app);

  // 註冊 API 路由
  app.use(routes);

  // 處理 404 錯誤
  app.use(notFound);

  // 全域錯誤處理
  app.use(errorHandler);

  return app;
};

// 創建應用實例
export const app = createApp();