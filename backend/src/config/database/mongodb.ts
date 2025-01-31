import mongoose from 'mongoose';
import { env } from '../env';
import { handleMongooseError } from '../../utils/db-error';

/**
 * MongoDB 連接配置
 */
export const mongoConfig = {
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 30000,
};

/**
 * 連接到 MongoDB
 * @param attempt 當前嘗試次數
 * @param maxAttempts 最大重試次數
 * @returns 連接是否成功
 */
export const connectMongoDB = async (attempt: number, maxAttempts: number): Promise<boolean> => {
  try {
    if (!env.mongodbUri) {
      console.error('MongoDB URI 未設置');
      return false;
    }

    // 如果已經連接，先斷開
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    await mongoose.connect(env.mongodbUri, mongoConfig);
    
    // 驗證連接是否真的成功
    if (mongoose.connection.readyState !== 1) {
      throw new Error('連接狀態檢查失敗');
    }

    console.log('MongoDB 連接成功');
    return true;
  } catch (error) {
    const dbError = handleMongooseError(error);
    console.error(`MongoDB 連接失敗 (嘗試 ${attempt}/${maxAttempts}):`, dbError.message);
    return false;
  }
};

/**
 * 關閉 MongoDB 連接
 */
export const disconnectMongoDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (error) {
    const dbError = handleMongooseError(error);
    console.error('MongoDB 斷開連接時發生錯誤:', dbError.message);
  }
};

/**
 * 檢查 MongoDB 連接狀態
 */
export const checkMongoDBConnection = (): boolean => {
  return mongoose.connection.readyState === 1;
};