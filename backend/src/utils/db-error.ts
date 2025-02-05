import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

export interface DatabaseError {
  code: string;
  message: string;
  type: 'validation' | 'constraint' | 'connection' | 'unknown';
}

/**
 * 處理 Prisma 資料庫錯誤
 * @param error 原始錯誤物件
 * @returns 格式化後的資料庫錯誤
 */
export function handlePrismaError(error: unknown): DatabaseError {
  // Prisma 已知請求錯誤
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          code: 'UNIQUE_CONSTRAINT',
          message: '資料已存在，違反唯一性約束',
          type: 'constraint'
        };
      case 'P2003':
        return {
          code: 'FOREIGN_KEY_CONSTRAINT',
          message: '外鍵約束違反',
          type: 'constraint'
        };
      case 'P2025':
        return {
          code: 'NOT_FOUND',
          message: '找不到要操作的記錄',
          type: 'validation'
        };
      default:
        return {
          code: error.code,
          message: error.message,
          type: 'unknown'
        };
    }
  }
  
  // Prisma 驗證錯誤
  if (error instanceof PrismaClientValidationError) {
    return {
      code: 'VALIDATION_ERROR',
      message: error.message,
      type: 'validation'
    };
  }

  // 一般錯誤
  if (error instanceof Error) {
    if (error.message.includes('connection')) {
      return {
        code: 'CONNECTION_ERROR',
        message: error.message,
        type: 'connection'
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      type: 'unknown'
    };
  }

  // 未知錯誤
  return {
    code: 'UNKNOWN_ERROR',
    message: '未知的資料庫錯誤',
    type: 'unknown'
  };
}
