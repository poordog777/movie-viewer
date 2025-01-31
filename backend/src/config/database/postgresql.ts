import { PrismaClient } from '@prisma/client';
import { handlePrismaError } from '../../utils/db-error';

/**
 * PostgreSQL 客戶端配置
 */
export const prisma = new PrismaClient({
  errorFormat: 'minimal',
  log: ['error', 'warn']
});

/**
 * 連接到 PostgreSQL
 * @param attempt 當前嘗試次數
 * @param maxAttempts 最大重試次數
 * @returns 連接是否成功
 */
export const connectPostgreSQL = async (attempt: number, maxAttempts: number): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL 連接成功');
    return true;
  } catch (error) {
    const dbError = handlePrismaError(error);
    console.error(`PostgreSQL 連接失敗 (嘗試 ${attempt}/${maxAttempts}):`, dbError.message);
    return false;
  }
};

/**
 * 關閉 PostgreSQL 連接
 */
export const disconnectPostgreSQL = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    const dbError = handlePrismaError(error);
    console.error('PostgreSQL 斷開連接時發生錯誤:', dbError.message);
  }
};

/**
 * 檢查 PostgreSQL 連接狀態
 */
export const checkPostgreSQLConnection = async (): Promise<boolean> => {
  try {
    // 嘗試執行一個簡單的查詢來檢查連接
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Server has closed the connection')) {
      await prisma.$disconnect(); // 確保斷開舊的連接
    }
    return false;
  }
};

// 確保程式結束時關閉連接
process.on('beforeExit', async () => {
  await disconnectPostgreSQL();
});