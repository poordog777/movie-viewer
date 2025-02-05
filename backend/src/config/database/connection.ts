import { connectPostgreSQL, disconnectPostgreSQL, checkPostgreSQLConnection } from './postgresql';

/**
 * 初始化所有數據庫連接
 */
export const initializeDatabases = async (): Promise<void> => {
  console.log('正在初始化數據庫連接...');
  
  // 連接到 PostgreSQL
  const pgConnected = await connectPostgreSQL();
  if (!pgConnected) {
    throw new Error('無法建立 PostgreSQL 連接');
  }
};

/**
 * 關閉所有數據庫連接
 */
export const closeDatabases = async (): Promise<void> => {
  console.log('正在關閉數據庫連接...');
  
  // 關閉 PostgreSQL 連接
  await disconnectPostgreSQL();
};

/**
 * 檢查所有數據庫連接狀態
 * @returns 所有數據庫的連接狀態
 */
export const checkDatabaseConnections = async (): Promise<{
  postgresql: boolean;
}> => {
  return {
    postgresql: await checkPostgreSQLConnection()
  };
};

// 處理程序結束時的清理工作
process.on('SIGINT', async () => {
  console.log('\n收到 SIGINT 信號，正在清理...');
  await closeDatabases();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n收到 SIGTERM 信號，正在清理...');
  await closeDatabases();
  process.exit(0);
});