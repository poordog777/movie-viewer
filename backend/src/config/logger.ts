import morgan from 'morgan';
import { Express } from 'express';
import { env } from './env';

export const setupLogger = (app: Express) => {
  // 開發環境使用詳細日誌
  if (env.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    // 生產環境使用簡潔日誌
    app.use(
      morgan('combined', {
        skip: (req, res) => res.statusCode < 400 // 只記錄錯誤請求
      })
    );
  }
}; 