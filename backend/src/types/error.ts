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
  constructor(message: string, errorCode: string, statusCode: number = 400) {
    super(statusCode, message, errorCode);
    this.name = 'BusinessError';
  }
}

export enum ErrorCodes {
  // 系統錯誤 (System Errors)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',    // 伺服器內部錯誤
  DATABASE_ERROR = 'DATABASE_ERROR',                  // 資料庫錯誤
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',          // 外部 API 錯誤
  
  // 通用錯誤 (Common Errors)
  INVALID_REQUEST_BODY = 'INVALID_REQUEST_BODY',      // 請求格式錯誤
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',      // 電子郵件格式錯誤
  INVALID_PASSWORD_FORMAT = 'INVALID_PASSWORD_FORMAT', // 密碼格式錯誤
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',        // 請求次數超限
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',               // 找不到路徑
  UNAUTHORIZED = 'UNAUTHORIZED',                      // 未授權訪問
  FORBIDDEN = 'FORBIDDEN',                           // 禁止訪問
  
  // 認證相關錯誤 (Auth Errors)
  AUTH_MISSING_FIELDS = 'AUTH_MISSING_FIELDS',        // 缺少必要欄位
  AUTH_EMAIL_EXISTS = 'AUTH_EMAIL_EXISTS',            // 信箱已被註冊
  AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED',        // 帳號已被鎖定
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS', // 登入憑證錯誤
  AUTH_PASSWORD_EXPIRED = 'AUTH_PASSWORD_EXPIRED',     // 密碼已過期需要重設
  AUTH_ACCOUNT_INACTIVE = 'AUTH_ACCOUNT_INACTIVE',     // 帳號未啟用
  AUTH_TOO_MANY_ATTEMPTS = 'AUTH_TOO_MANY_ATTEMPTS',  // 登入嘗試次數過多
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',          // 無效的認證令牌
  AUTH_INVALID_PASSWORD = 'AUTH_INVALID_PASSWORD',     // 密碼錯誤
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',          // 認證令牌已過期
  AUTH_TOKEN_REFRESH_FAILED = 'AUTH_TOKEN_REFRESH_FAILED', // 令牌刷新失敗
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',       // 使用者會話已過期
  AUTH_GOOGLE_ERROR = 'AUTH_GOOGLE_ERROR',            // Google 登入處理失敗
  AUTH_GOOGLE_STATE_INVALID = 'AUTH_GOOGLE_STATE_INVALID', // Google OAuth state 無效
  AUTH_GOOGLE_USER_EXISTS = 'AUTH_GOOGLE_USER_EXISTS', // Google 帳號已被其他用戶使用
  AUTH_GOOGLE_EMAIL_MISMATCH = 'AUTH_GOOGLE_EMAIL_MISMATCH', // Google 帳號信箱不匹配
  
  // 使用者相關錯誤 (User Errors)
  USER_NOT_FOUND = 'USER_NOT_FOUND',                 // 找不到使用者
  USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',         // 更新使用者資料失敗
  USER_DELETE_FAILED = 'USER_DELETE_FAILED',         // 刪除使用者失敗
  USER_INVALID_OPERATION = 'USER_INVALID_OPERATION', // 無效的使用者操作
  
  // 電影相關錯誤 (Movie Errors)
  MOVIE_NOT_FOUND = 'MOVIE_NOT_FOUND',              // 找不到電影
  MOVIE_ALREADY_EXISTS = 'MOVIE_ALREADY_EXISTS',     // 電影已存在
  MOVIE_UPDATE_FAILED = 'MOVIE_UPDATE_FAILED',       // 更新電影資訊失敗
  MOVIE_DELETE_FAILED = 'MOVIE_DELETE_FAILED',       // 刪除電影失敗
  
  // 評論相關錯誤 (Review Errors)
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',            // 找不到評論
  REVIEW_ALREADY_EXISTS = 'REVIEW_ALREADY_EXISTS',   // 評論已存在
  REVIEW_UPDATE_FAILED = 'REVIEW_UPDATE_FAILED',     // 更新評論失敗
  REVIEW_DELETE_FAILED = 'REVIEW_DELETE_FAILED',     // 刪除評論失敗
  
  // 評分相關錯誤 (Rating Errors)
  RATING_INVALID_SCORE = 'RATING_INVALID_SCORE',     // 無效的評分
  RATING_NOT_FOUND = 'RATING_NOT_FOUND',            // 找不到評分
  RATING_UPDATE_FAILED = 'RATING_UPDATE_FAILED',     // 更新評分失敗
  
  // 收藏相關錯誤 (Favorite Errors)
  FAVORITE_ALREADY_EXISTS = 'FAVORITE_ALREADY_EXISTS', // 已加入收藏
  FAVORITE_NOT_FOUND = 'FAVORITE_NOT_FOUND',         // 找不到收藏記錄
  FAVORITE_UPDATE_FAILED = 'FAVORITE_UPDATE_FAILED'   // 更新收藏失敗
}

export interface ErrorResponse {
  status: 'error' | 'fail';
  message: string;
  errorCode: string;
  stack?: string;
}