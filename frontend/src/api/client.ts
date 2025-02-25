import axios from 'axios';
import { API_BASE_URL } from './config';

// 創建 axios 實例
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// 請求攔截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
apiClient.interceptors.response.use(
  (response) => {
    // 返回整個響應，讓具體的 API 方法處理數據結構
    return response;
  },
  (error) => {
    // 處理認證相關錯誤
    if (error.response?.status === 401) {
      // 清除認證信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 如果不是在登入相關頁面，則跳轉到首頁
      const isAuthPage = window.location.pathname.startsWith('/auth');
      if (!isAuthPage) {
        // 保存當前頁面路徑
        sessionStorage.setItem('redirectUrl', window.location.pathname);
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;