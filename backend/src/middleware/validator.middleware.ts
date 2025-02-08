import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { BusinessError } from '../types/error';

type ValidationType = 'body' | 'query' | 'params';

/**
 * 創建請求參數驗證中間件
 * @param schema Joi驗證模式
 * @param type 驗證的請求部分
 */
export const validateRequest = (schema: Schema, type: ValidationType = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[type], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      throw new BusinessError(
        errorMessage,
        'VALIDATION_ERROR'
      );
    }

    // 將驗證後的值賦回請求對象
    req[type] = value;
    next();
  };
};