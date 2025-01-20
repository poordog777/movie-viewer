export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errorCode: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class BusinessError extends AppError {
  constructor(message: string, errorCode: string) {
    super(400, message, errorCode);
    this.name = 'BusinessError';
  }
}

export const ErrorCodes = {
  // 通用錯誤 (Common Errors)
  INVALID_REQUEST_BODY: 'INVALID_REQUEST_BODY',     // 請求格式錯誤
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',     // 電子郵件格式錯誤
  INVALID_PASSWORD_FORMAT: 'INVALID_PASSWORD_FORMAT', // 密碼格式錯誤
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',       // 請求次數超限
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',              // 找不到路徑
  
  // 認證相關業務錯誤 (Auth Business Errors)
  AUTH_MISSING_FIELDS: 'AUTH_MISSING_FIELDS',       // 缺少必要欄位
  AUTH_EMAIL_EXISTS: 'AUTH_EMAIL_EXISTS',           // 信箱已被註冊
  AUTH_ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',       // 帳號已被鎖定
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS', // 登入憑證錯誤
  AUTH_PASSWORD_EXPIRED: 'AUTH_PASSWORD_EXPIRED',    // 密碼已過期需要重設
  AUTH_ACCOUNT_INACTIVE: 'AUTH_ACCOUNT_INACTIVE',    // 帳號未啟用
  AUTH_TOO_MANY_ATTEMPTS: 'AUTH_TOO_MANY_ATTEMPTS', // 登入嘗試次數過多
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',    // 伺服器內部錯誤
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',         // 無效的認證令牌
} as const;

export interface ErrorResponse {
  status: 'error' | 'fail';
  message: string;
  errorCode: string;
  stack?: string;
} 