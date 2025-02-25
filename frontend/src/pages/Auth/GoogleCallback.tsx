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

      // 獲取重定向URL（無論成功或失敗都會使用）
      const redirectUrl = urlParams.get('redirect') || '/';
      console.log('Return URL:', redirectUrl);

      // 處理錯誤情況
      const error = urlParams.get('error');
      if (error) {
        console.log('Login error from OAuth:', error);
        return navigate(redirectUrl, { replace: true });
      }

      try {
        // 解析並驗證必要參數
        const token = urlParams.get('token');
        const userId = urlParams.get('userId');
        const name = urlParams.get('name');
        const email = urlParams.get('email');
        const picture = urlParams.get('picture');

        if (!token || !userId || !name || !email) {
          throw new Error('Missing required login data');
        }

        // 執行登入
        await login({
          token,
          user: {
            id: userId,
            name,
            email,
            picture: picture || undefined
          }
        });

        // 等待狀態更新
        await new Promise(resolve => setTimeout(resolve, 300));

        // 返回原始頁面
        navigate(redirectUrl, { replace: true });
      } catch (error) {
        console.error('Login error:', error);
        navigate(redirectUrl, { replace: true });
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