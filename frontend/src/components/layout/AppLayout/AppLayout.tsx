import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import { useAuth } from '../../../context/AuthContext';

const AppLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // 監聽路由變化，確保認證狀態同步
  useEffect(() => {
    const handleRouteChange = async () => {
      // 如果不是認證相關頁面，則驗證認證狀態
      if (!location.pathname.startsWith('/auth')) {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        // 如果沒有認證信息但顯示為已登入，重置狀態
        if ((!token || !userStr) && isAuthenticated) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
        }
      }
    };

    handleRouteChange();
  }, [location, isAuthenticated]);

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default AppLayout;