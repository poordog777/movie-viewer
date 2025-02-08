import { PrismaClient } from '@prisma/client';
import { handlePrismaError } from '../utils/db-error';

const prisma = new PrismaClient();

/**
 * 初始化資料庫連接
 * @throws Error 當無法建立資料庫連接時拋出錯誤
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL: 連接成功');
  } catch (error) {
    console.error('PostgreSQL: 連接錯誤 -', handlePrismaError(error).message);
    throw error;
  }
};

export { prisma };