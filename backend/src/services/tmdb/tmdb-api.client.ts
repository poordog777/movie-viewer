import axios, { AxiosInstance } from 'axios';
import { TMDBError, TMDBErrorType } from './types/responses';

/**
 * TMDB API 客戶端類
 * 處理與 TMDB API 的直接通信
 */
export class TMDBApiClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly defaultParams: Record<string, string>;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('TMDB API 金鑰是必需的');
    }

    // 初始化 axios 實例
    this.axiosInstance = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      timeout: 10000, // 10秒超時
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // 設置默認查詢參數
    this.defaultParams = {
      api_key: apiKey,
      language: 'zh-TW',
      region: 'TW'
    };

    // 設置響應攔截器
    this.setupInterceptors();
  }

  /**
   * 發送 GET 請求到 TMDB API
   */
  async get<T>(path: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const { data } = await this.axiosInstance.get<T>(path, {
        params: {
          ...this.defaultParams,
          ...params
        }
      });
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 設置響應攔截器
   */
  private setupInterceptors(): void {
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => Promise.reject(this.handleError(error))
    );
  }

  /**
   * 錯誤處理
   */
  private handleError(error: unknown): TMDBError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.status_message || error.message;

      switch (status) {
        case 400:
          return {
            type: TMDBErrorType.INVALID_REQUEST,
            message: '無效的請求參數',
            statusCode: status
          };
        case 401:
          return {
            type: TMDBErrorType.INVALID_REQUEST,
            message: 'API金鑰無效',
            statusCode: status
          };
        case 404:
          return {
            type: TMDBErrorType.RESOURCE_NOT_FOUND,
            message: '找不到請求的資源',
            statusCode: status
          };
        case 429:
          return {
            type: TMDBErrorType.SERVER_ERROR,
            message: '已超過API請求限制',
            statusCode: status
          };
        default:
          return {
            type: TMDBErrorType.SERVER_ERROR,
            message: `服務器錯誤: ${message}`,
            statusCode: status
          };
      }
    }

    return {
      type: TMDBErrorType.SERVER_ERROR,
      message: error instanceof Error ? error.message : '發生未知錯誤',
      statusCode: 500
    };
  }
}