export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export const createResponse = <T>(
  status: ApiResponse['status'] = 'success',
  data?: T,
  message?: string,
  meta?: ApiResponse['meta']
): ApiResponse<T> => {
  return {
    status,
    message,
    data,
    meta
  };
}; 