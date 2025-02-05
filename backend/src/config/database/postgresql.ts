import { PrismaClient } from '@prisma/client';
import { handlePrismaError } from '../../utils/db-error';

const prisma = new PrismaClient();

/**
 * 連接到 PostgreSQL 數據庫
 * @param currentRetry 當前重試次數
 * @param maxRetries 最大重試次數
 * @returns 連接是否成功
 */
export const connectPostgreSQL = async (currentRetry = 1, maxRetries = 3): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL: 連接成功');
    return true;
  } catch (error) {
    console.error('PostgreSQL: 連接錯誤 -', handlePrismaError(error).message);
    
    if (currentRetry < maxRetries) {
      console.log(`PostgreSQL: 嘗試重新連接 (${currentRetry}/${maxRetries})`);
      // 等待 2 秒後重試
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectPostgreSQL(currentRetry + 1, maxRetries);
    }
    
    return false;
  }
};

export { prisma };