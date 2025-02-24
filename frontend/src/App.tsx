import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';

// 布局
import AppLayout from './components/layout/AppLayout/AppLayout';

// 頁面
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import Movie from './pages/Movie/Movie';
import GoogleCallback from './pages/Auth/GoogleCallback';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* 認證相關路由 */}
            <Route path="/auth/callback/google" element={<GoogleCallback />} />
            
            {/* 主應用路由 */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/movie/:id" element={<Movie />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
