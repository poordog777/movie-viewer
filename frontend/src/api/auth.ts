import { LoginResponse } from '../types/auth';
import apiClient from './client';
import { routes } from './config';

export const authAPI = {
  /**
   * Google OAuth 登入
   * @param code - Google OAuth 授權碼
   */
  googleLogin: async (code: string): Promise<LoginResponse> => {
    return apiClient.post(routes.auth.google, { code });
  },

  /**
   * 登出
   */
  logout: async (): Promise<void> => {
    return apiClient.post(routes.auth.logout);
  }
};