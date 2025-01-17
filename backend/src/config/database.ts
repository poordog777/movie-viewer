import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import { env } from './env';

export const prisma = new PrismaClient();

export const connectDatabases = async () => {
  try {
    // 檢測 MongoDB 連接
    if (!env.mongodbUri) {
      throw new Error('MongoDB URI is not defined');
    }
    await mongoose.connect(env.mongodbUri);
    console.log('MongoDB 連接成功');

    // 檢測 PostgreSQL 連接
    if (!env.databaseUrl) {
        throw new Error('PostgreSQL URI is not defined');
      }

    await prisma.$connect();
    console.log('PostgreSQL 連接成功');
    
  } catch (error) {
    console.error('資料庫連接失敗:', error);
    process.exit(1);
  }
};

// 確保程式結束時關閉連接
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await mongoose.disconnect();
}); 