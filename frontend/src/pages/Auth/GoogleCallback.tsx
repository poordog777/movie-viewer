import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress, Typography, Container, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Main = styled('main')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3, 0),
  backgroundColor: theme.palette.background.default
}));

const BackButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
}));

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      console.log('Raw URL params:', Object.fromEntries(urlParams.entries()));

      // 1. 檢查是否有錯誤
      const error = urlParams.get('error');
      if (error) {
        console.log('Login error from OAuth:', error);
        // 即使登入失敗也要嘗試使用 redirect 參數
        const redirectUrl = urlParams.get('redirect') || '/';
        console.log('Error case: redirecting to:', redirectUrl);
        return navigate(redirectUrl);
      }

      // 2. 解析回調參數
      const token = urlParams.get('token');
      const userId = urlParams.get('userId');
      const name = urlParams.get('name');
      const email = urlParams.get('email');
      const picture = urlParams.get('picture');

      try {
        if (token && userId && name && email) {
          console.log('Starting login process with:', { token, userId, name, email });
          
          // 3. 執行登入
          await login({
            token,
            user: {
              id: userId,
              name,
              email,
              picture: picture || undefined
            }
          });

          // 4. 驗證登入狀態
          const storedToken = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          console.log('Stored auth state:', { hasToken: !!storedToken, hasUser: !!storedUser });

          if (!storedToken || !storedUser) {
            throw new Error('Login failed - auth data not stored');
          }

          // 5. 確保狀態更新
          await new Promise(resolve => setTimeout(resolve, 500));

          // 6. 處理重定向
          const redirectFromUrl = urlParams.get('redirect');
          const redirectFromSession = sessionStorage.getItem('redirectUrl');
          const redirectUrl = redirectFromUrl || redirectFromSession || '/';
          
          console.log('Redirect URL from URL params:', redirectFromUrl);
          console.log('Redirect URL from session:', redirectFromSession);
          console.log('Final redirect URL:', redirectUrl);

          sessionStorage.removeItem('redirectUrl');
          navigate(redirectUrl);
        } else {
          throw new Error('Missing required login data');
        }
      } catch (error) {
        console.error('Login error:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, login]);

  const handleBack = () => {
    navigate('/', { replace: true });
  };

  return (
    <Main>
      <BackButton
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        variant="text"
        color="primary"
      >
        返回首頁
      </BackButton>
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
        >
          <CircularProgress color="primary" size={48} />
          <Typography variant="h6">
            處理登入中...
          </Typography>
        </Box>
      </Container>
    </Main>
  );
};

export default GoogleCallback;