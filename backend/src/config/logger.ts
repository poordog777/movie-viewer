import morgan from 'morgan';
import { Express } from 'express';

export const setupLogger = (app: Express) => {
  // 使用開發環境的詳細日誌格式
  app.use(morgan('dev'));
};