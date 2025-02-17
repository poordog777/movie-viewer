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

  // 初始化: 檢查本地存儲的 token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setState({
          isAuthenticated: true,
          user,
          token
        });
      } catch (error) {
        // 如果解析失敗，清除本地存儲
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = useCallback(async (code: string) => {
    try {
      const { user, token } = await authAPI.googleLogin(code);
      
      // 保存到本地存儲
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // 更新狀態
      setState({
        isAuthenticated: true,
        user,
        token
      });
    } catch (error) {
      console.error('Login failed:', error);
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