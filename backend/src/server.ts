import { app } from './app';
import { env } from './config/env';
import { initializeDatabase } from './config/database';

const PORT = env.port;

export const startServer = async () => {
  try {
    console.log('正在啟動伺服器...');
    
    console.log('正在連接資料庫...');
    await initializeDatabase();
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

// 只在直接執行此文件時啟動服務器
if (require.main === module) {
  startServer();
}