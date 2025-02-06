import express from 'express';
import cors from 'cors';
import { setupConfig } from './config';
import { errorHandler, notFound } from './middleware/error.middleware';
import routes from './routes';
import passport from 'passport';

export const createApp = () => {
  const app = express();

  app.use(cors());
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