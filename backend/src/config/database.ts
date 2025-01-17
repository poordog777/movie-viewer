import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import { env } from './env';

export const prisma = new PrismaClient();

const connectMongoDB = async (retries: number, maxRetries: number) => {
  try {
    await mongoose.connect(env.mongodbUri!);
    console.log('MongoDB 連接成功');
    return true;
  } catch (error) {
    console.error(`MongoDB 連接失敗 (嘗試 ${retries}/${maxRetries}):`, error);
    return false;
  }
};

const connectPostgreSQL = async (retries: number, maxRetries: number) => {
  try {
    // 執行測試查詢
    await prisma.$connect();
    
    // 執行測試查詢來確認連接和權限
    try {
      await prisma.$queryRaw`SELECT current_database() as db`;
      console.log('PostgreSQL 連接成功');
      return true;
    } catch (queryError) {
      throw new Error(`資料庫查詢失敗: ${queryError instanceof Error ? queryError.message : '未知錯誤'}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    console.error(`PostgreSQL 連接失敗 (嘗試 ${retries}/${maxRetries}): ${errorMessage}`);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('PostgreSQL 斷開連接時發生錯誤:', disconnectError);
    }
    
    return false;
  }
};

export const connectDatabases = async () => {
  const maxRetries = 3;
  let retries = 0;
  let mongoConnected = false;
  let postgresConnected = false;

  while (retries < maxRetries) {
    try {
      // 如果 MongoDB 還未連接，嘗試連接
      if (!mongoConnected) {
        mongoConnected = await connectMongoDB(retries + 1, maxRetries);
      }

      // 如果 PostgreSQL 還未連接，嘗試連接
      if (!postgresConnected) {
        postgresConnected = await connectPostgreSQL(retries + 1, maxRetries);
      }

      // 檢查是否兩個資料庫都連接成功
      if (mongoConnected && postgresConnected) {
        console.log('所有資料庫連接成功');
        return;
      }

      retries++;
      
      // 如果還有重試機會但未完全連接成功，等待後重試
      if (retries < maxRetries && (!mongoConnected || !postgresConnected)) {
        console.log(`等待 5 秒後重試...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else if (retries === maxRetries && (!mongoConnected || !postgresConnected)) {
        throw new Error('無法連接資料庫，超過最大重試次數');
      }
    } catch (error) {
      // 如果發生嚴重錯誤，確保清理所有連接
      if (mongoConnected) await mongoose.disconnect();
      if (postgresConnected) await prisma.$disconnect();
      throw error;
    }
  }
};

// 確保程式結束時關閉連接
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await mongoose.disconnect();
}); 