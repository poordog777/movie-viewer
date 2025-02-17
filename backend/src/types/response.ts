/**
 * API 響應格式
 */
export interface ApiResponse<T = any> {
  status: 'success' | 'fail';  // 只需要成功/失敗兩種狀態
  message?: string;            // 可選的訊息（錯誤訊息或成功提示）
  data?: T;                    // 響應數據
  errorCode?: string;          // 錯誤代碼（只在失敗時出現）
}

/**
 * 創建成功響應
 */
export const createSuccessResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => ({
  status: 'success',
  data,
  message
});

/**
 * 創建失敗響應
 */
export const createFailResponse = (
  message: string,
  errorCode: string
): ApiResponse => ({
  status: 'fail',
  message,
  errorCode
});