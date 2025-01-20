import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse, ErrorCodes } from '../types/error';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let errorResponse: ErrorResponse = {
    status: 'error',
    message: '伺服器內部錯誤',
    errorCode: ErrorCodes.INTERNAL_SERVER_ERROR
  };

  // 處理已知的操作錯誤
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorResponse = {
      status: statusCode >= 500 ? 'error' : 'fail',
      message: err.message,
      errorCode: err.errorCode
    };
  }

  // 在開發環境下顯示錯誤堆疊
  if (env.nodeEnv === 'development') {
    errorResponse.stack = err.stack;
    console.error('錯誤詳情:', {
      statusCode,
      ...errorResponse,
      stack: err.stack
    });
  }

  res.status(statusCode).json(errorResponse);
};

// 捕捉非同步錯誤的包裝函數
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 處理 404 錯誤
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `找不到路徑: ${req.originalUrl}`, ErrorCodes.ROUTE_NOT_FOUND));
}; 