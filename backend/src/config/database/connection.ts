import { connectPostgreSQL, disconnectPostgreSQL, checkPostgreSQLConnection } from './postgresql';

export interface ConnectionStatus {
  postgresql: boolean;
}

/**
 * 連接資料庫
 * 如果連接失敗會拋出錯誤
 */
export const connectDatabases = async (): Promise<void> => {
  const postgresResult = await connectPostgreSQL(1, 3);
  if (!postgresResult) {
    throw new Error('PostgreSQL: 連接失敗');
  }
};

/**
 * 關閉資料庫連接
 */
export const disconnectDatabases = async (): Promise<void> => {
  try {
    await disconnectPostgreSQL();
  } catch (error) {
    console.error(`PostgreSQL: ${error instanceof Error ? error.message : '斷開連接失敗'}`);
  }
};

/**
 * 檢查資料庫連接狀態
 */
export const checkConnections = async (): Promise<ConnectionStatus> => {
  let postgresStatus = false;

  try {
    postgresStatus = await checkPostgreSQLConnection();
  } catch (error) {
    console.error('PostgreSQL 狀態檢查失敗:', error);
  }

  return {
    postgresql: postgresStatus
  };
};

// 確保程式結束時關閉所有連接
process.on('beforeExit', async () => {
  await disconnectDatabases();
});