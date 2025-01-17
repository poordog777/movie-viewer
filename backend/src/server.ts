import express from 'express';
import cors from 'cors';
import { setupConfig } from './config';
import { env } from './config/env';
import { connectDatabases } from './config/database';
import { errorHandler, notFound } from './middleware/error.middleware';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

setupConfig(app);

// 註冊 API 路由
app.use(routes);

// 處理 404 錯誤
app.use(notFound);

// 全域錯誤處理
app.use(errorHandler);

const PORT = env.port;

const startServer = async () => {
  try {
    await connectDatabases();
    
    app.listen(PORT, () => {
      console.log(`伺服器運行於 port ${PORT}`);
    });
  } catch (error) {
    console.error('伺服器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();