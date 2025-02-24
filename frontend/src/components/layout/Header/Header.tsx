import { AppBar, Toolbar, Button, Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SearchInput from '../../common/SearchInput/SearchInput';
import { useState } from 'react';
import { routes, API_BASE_URL } from '../../../api/config';

const StyledAppBar = styled(AppBar)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.primary};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LogoButton = styled(Button)`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.primary.main};
  padding: ${({ theme }) => theme.spacing(1, 2)};
`;

const SearchBox = styled(Box)`
  flex-grow: 1;
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(0, 2)};
`;

const UserBox = styled(Box)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogin = () => {
    // 保存當前頁面 URL
    const currentPath = window.location.pathname;
    sessionStorage.setItem('redirectUrl', currentPath);
    
    // 重定向到 Google 登入頁面
    const callbackUrl = `${window.location.origin}/auth/callback/google`;
    const state = window.location.pathname;
    
    // 將重定向 URL 和當前路徑傳給後端
    window.location.href = `${API_BASE_URL}${routes.auth.google}?redirect_uri=${encodeURIComponent(callbackUrl)}&return_to=${encodeURIComponent(state)}`;
  };

  const handleLogoClick = () => {
    navigate('/');
    setSearchQuery('');
  };

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        <LogoButton onClick={handleLogoClick}>
          Movie Viewer
        </LogoButton>
        
        <SearchBox>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </SearchBox>

        {isAuthenticated ? (
          <UserBox>
            <Avatar
              src={user?.picture}
              alt={user?.name}
              sx={{ width: 32, height: 32 }}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={logout}
            >
              登出
            </Button>
          </UserBox>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
          >
            登入
          </Button>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;