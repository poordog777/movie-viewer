import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError, ErrorCodes } from '../types/error';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      throw new AppError(
        400,
        `請求資料格式錯誤: ${errorMessage}`,
        ErrorCodes.INVALID_REQUEST_BODY
      );
    }

    next();
  };
}; 