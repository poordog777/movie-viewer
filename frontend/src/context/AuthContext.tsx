import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { AuthContextType, AuthState, User } from '../types/auth';
import { authAPI } from '../api/auth';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // 初始化：檢查本地存儲的認證信息
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          
          // 更新認證狀態
          setState({
            isAuthenticated: true,
            user,
            token
          });
        } catch (error) {
          // 如果解析失敗，清除本地存儲
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setState(initialState);
        }
      }
    };

    // 初始化認證狀態
    initializeAuth();

    // 添加storage事件監聽器，處理其他標籤頁的登入狀態變化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = useCallback(async (authData: { user: User; token: string }) => {
    try {
      const { user, token } = authData;
      console.log('Login called with:', { userId: user.id, hasToken: !!token });
      
      if (!token || !user.id) {
        throw new Error('Invalid login data');
      }
      
      // 先更新狀態
      setState({
        isAuthenticated: true,
        user,
        token
      });
      
      // 然後保存到本地存儲
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // 驗證存儲是否成功
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!storedToken || !storedUser) {
        throw new Error('Failed to store auth data');
      }
      
      console.log('Login successful:', { userId: user.id });
    } catch (error) {
      console.error('Login failed:', error);
      // 清理任何可能的部分狀態
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setState(initialState);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // 無論如何都清除本地數據
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setState(initialState);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};