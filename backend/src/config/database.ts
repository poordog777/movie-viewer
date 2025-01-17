import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import { env } from './env';

export const prisma = new PrismaClient();

const connectMongoDB = async (attempt: number, maxAttempts: number) => {
  try {
    await mongoose.connect(env.mongodbUri!);
    console.log('MongoDB 連接成功');
    return true;
  } catch (error) {
    console.error(`MongoDB 連接失敗 (嘗試 ${attempt}/${maxAttempts}):`, error);
    return false;
  }
};

const connectPostgreSQL = async (attempt: number, maxAttempts: number) => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL 連接成功');
    return true;
  } catch (error) {
    console.error(`PostgreSQL 連接失敗 (嘗試 ${attempt}/${maxAttempts}):`, error);
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