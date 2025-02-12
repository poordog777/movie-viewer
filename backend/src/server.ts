import { app } from './app';
import { env } from './config/env';
import { initializeDatabase } from './config/database';
import { prisma } from './config/database';

const PORT = Number(env.port);

export const startServer = async () => {
  try {
    console.log('正在啟動伺服器...');

    // 初始化資料庫
    await initializeDatabase();
    console.log('資料庫連線成功');
    
    // 啟動 HTTP 伺服器
    const server = app.listen(PORT, () => {
      console.log(`伺服器運行於連接埠 ${PORT}`);
      console.log('API 文件可於 http://localhost:'+PORT+'/api-docs 檢視');
    });

    // 註冊關閉處理程序
    const shutdown = async () => {
      console.log('正在關閉服務...');
      
      server.close();
      await prisma.$disconnect();
      
      console.log('服務已完全關閉');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('伺服器啟動失敗:', error);
    process.exit(1);
  }
};

// 只在直接執行此檔案時啟動伺服器
if (require.main === module) {
  startServer();
}