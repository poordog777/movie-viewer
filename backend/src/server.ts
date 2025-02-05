import express from 'express';
import cors from 'cors';
import { setupConfig } from './config';
import { env } from './config/env';
import { initializeDatabases } from './config/database/connection';
import { errorHandler, notFound } from './middleware/error.middleware';
import routes from './routes';
import passport from 'passport';

export const app = express();

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

const PORT = env.port;

export const startServer = async () => {
  try {
    console.log('正在啟動伺服器...');
    
    console.log('正在連接資料庫...');
    await initializeDatabases();
    console.log('資料庫連接成功');
    
    // 啟動 HTTP 伺服器
    const server = app.listen(PORT, () => {
      console.log(`伺服器運行於 port ${PORT}`);
      console.log('API 文檔可於 http://localhost:'+PORT+'/api-docs 查看');
    });

    // 設定 HTTP 伺服器錯誤處理
    server.on('error', (error: Error) => {
      console.error('HTTP 伺服器錯誤:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('伺服器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();