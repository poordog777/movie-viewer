import { connectPostgreSQL } from './postgresql';

/**
 * 初始化資料庫連接
 */
export const initializeDatabases = async (): Promise<void> => {
  console.log('正在初始化數據庫連接...');
  
  // 連接到 PostgreSQL
  const pgConnected = await connectPostgreSQL();
  if (!pgConnected) {
    throw new Error('無法建立 PostgreSQL 連接');
  }
};