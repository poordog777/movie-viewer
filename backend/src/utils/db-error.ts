import { Prisma } from '@prisma/client';
import { MongooseError } from 'mongoose';

export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: any,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const handlePrismaError = (error: any): DatabaseError => {
  // 處理連接相關錯誤
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new DatabaseError('資料庫連接初始化失敗', error, 'INIT_ERROR');
  }
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new DatabaseError('資料庫連接意外中斷', error, 'CONNECTION_PANIC');
  }

  // 處理操作相關錯誤
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new DatabaseError('唯一性約束衝突', error, 'UNIQUE_CONSTRAINT');
      case 'P2025':
        return new DatabaseError('找不到記錄', error, 'NOT_FOUND');
      case 'P2014':
        return new DatabaseError('關聯約束違反', error, 'RELATION_VIOLATION');
      case 'P2003':
        return new DatabaseError('外鍵約束違反', error, 'FOREIGN_KEY_VIOLATION');
      default:
        return new DatabaseError('資料庫操作錯誤', error, 'UNKNOWN');
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new DatabaseError('資料驗證錯誤', error, 'VALIDATION');
  }
  return new DatabaseError('未預期的錯誤', error, 'UNEXPECTED');
};

export const handleMongooseError = (error: any): DatabaseError => {
  // 處理連接相關錯誤
  if (error.name === 'MongoServerSelectionError') {
    return new DatabaseError('無法連接到 MongoDB 伺服器', error, 'CONNECTION_ERROR');
  }
  if (error.name === 'MongoNetworkError') {
    return new DatabaseError('MongoDB 網路連接錯誤', error, 'NETWORK_ERROR');
  }

  // 處理操作相關錯誤
  if (error instanceof MongooseError) {
    if (error.name === 'ValidationError') {
      return new DatabaseError('資料驗證錯誤', error, 'VALIDATION');
    }
    if (error.name === 'CastError') {
      return new DatabaseError('資料類型錯誤', error, 'CAST_ERROR');
    }
  }
  if (error.code === 11000) {
    return new DatabaseError('唯一性約束衝突', error, 'DUPLICATE_KEY');
  }
  return new DatabaseError('資料庫操作錯誤', error, 'UNKNOWN');
};