import { connectMongoDB, disconnectMongoDB, checkMongoDBConnection } from './mongodb';
import { connectPostgreSQL, disconnectPostgreSQL, checkPostgreSQLConnection } from './postgresql';

export interface ConnectionStatus {
  mongodb: boolean;
  postgresql: boolean;
}

/**
 * 連接所有資料庫
 * 每個資料庫獨立連接，如果連接失敗會拋出錯誤
 */
export const connectDatabases = async (): Promise<void> => {
  const errors: string[] = [];

  // MongoDB 連接
  const mongoResult = await connectMongoDB(1, 3);
  if (!mongoResult) {
    errors.push('MongoDB: 連接失敗');
  }

  // PostgreSQL 連接
  const postgresResult = await connectPostgreSQL(1, 3);
  if (!postgresResult) {
    errors.push('PostgreSQL: 連接失敗');
  }

  // 如果有任何錯誤，拋出包含詳細信息的錯誤
  if (errors.length > 0) {
    throw new Error(`資料庫連接錯誤:\n${errors.join('\n')}`);
  }
};

/**
 * 關閉所有資料庫連接
 * 即使其中一個失敗也會繼續嘗試關閉其他連接
 */
export const disconnectDatabases = async (): Promise<void> => {
  const errors: string[] = [];

  try {
    await disconnectMongoDB();
  } catch (error) {
    errors.push(`MongoDB: ${error instanceof Error ? error.message : '斷開連接失敗'}`);
  }

  try {
    await disconnectPostgreSQL();
  } catch (error) {
    errors.push(`PostgreSQL: ${error instanceof Error ? error.message : '斷開連接失敗'}`);
  }

  if (errors.length > 0) {
    console.error('斷開連接時發生錯誤:\n', errors.join('\n'));
  }
};

/**
 * 檢查所有資料庫連接狀態
 */
export const checkConnections = async (): Promise<ConnectionStatus> => {
  // 使用 Promise.all 並行檢查所有連接
  let mongoStatus = false;
  let postgresStatus = false;

  try {
    mongoStatus = await Promise.resolve(checkMongoDBConnection());
  } catch (error) {
    console.error('MongoDB 狀態檢查失敗:', error);
  }

  try {
    postgresStatus = await checkPostgreSQLConnection();
  } catch (error) {
    console.error('PostgreSQL 狀態檢查失敗:', error);
  }

  return {
    mongodb: mongoStatus,
    postgresql: postgresStatus
  };
};

// 確保程式結束時關閉所有連接
process.on('beforeExit', async () => {
  await disconnectDatabases();
});