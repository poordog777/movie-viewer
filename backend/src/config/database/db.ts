import { connectPostgreSQL } from './postgresql';

/**
 * 初始化 PostgreSQL 資料庫連接
 * @throws Error 當無法建立資料庫連接時拋出錯誤
 */
export const initializeDatabase = async (): Promise<void> => {
  console.log('正在初始化 PostgreSQL 連接...');
  
  const connected = await connectPostgreSQL();
  if (!connected) {
    throw new Error('無法建立 PostgreSQL 資料庫連接，請檢查配置和網絡狀態');
  }
};