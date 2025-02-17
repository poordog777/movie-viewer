# 前端實現細節

## 一、架構設計

### 1. 目錄結構
```
src/
├── components/          # 共用組件
│   ├── common/         # 基礎組件
│   ├── movie/          # 電影相關組件
│   └── layout/         # 布局組件
│
├── pages/              # 頁面組件
│   ├── Home.tsx       
│   ├── Search.tsx     
│   └── MovieDetail.tsx
│
├── context/            # Context
│   └── AuthContext.tsx # 認證狀態
│
├── api/                # API 請求
│   ├── auth.ts        
│   └── movies.ts      
│
├── types/              # TypeScript 類型
│
└── utils/              # 工具函數
```

### 2. 核心技術
- React 18 + TypeScript
- Material UI
- React Router
- React Context

## 二、組件設計

### 1. 通用組件
```typescript
// InfiniteScroll 組件
interface InfiniteScrollProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  loading,
  hasMore,
  onLoadMore,
  children
}) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <>
      {children}
      {(hasMore || loading) && (
        <div ref={observerTarget}>
          {loading && <LoadingSpinner />}
        </div>
      )}
    </>
  );
};

// MovieCard 組件
interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    posterPath: string | null;
    releaseDate: string;
    voteAverage: number;
  };
  onClick?: (movieId: number) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  return (
    <Card onClick={() => onClick?.(movie.id)}>
      <CardMedia
        component="img"
        height="350"
        image={movie.posterPath ? 
          `https://image.tmdb.org/t/p/w500${movie.posterPath}` : 
          '/placeholder.jpg'}
        alt={movie.title}
      />
      <CardContent>
        <Typography variant="h6">{movie.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(movie.releaseDate).getFullYear()}
        </Typography>
        <Rating value={movie.voteAverage / 2} readOnly />
      </CardContent>
    </Card>
  );
};
```

## 三、狀態管理

### 1. 認證狀態
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });
  
  const login = useCallback(async (code: string) => {
    try {
      const data = await authAPI.googleLogin(code);
      setState({
        isAuthenticated: true,
        user: data.user,
        token: data.token
      });
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. 電影列表狀態
```typescript
const useMovieList = () => {
  const [state, setState] = useState({
    movies: [],
    loading: false,
    hasMore: true,
    page: 1
  });
  
  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      const data = await moviesAPI.getPopular(state.page);
      setState(prev => ({
        movies: [...prev.movies, ...data.results],
        hasMore: data.page < data.total_pages,
        page: prev.page + 1,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false
      }));
    }
  }, [state.loading, state.hasMore, state.page]);

  return {
    ...state,
    loadMore
  };
};
```

## 四、路由設計

### 1. 基本路由
```typescript
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </Router>
  );
}
```

### 2. 頁面組件
```typescript
// Home 頁面
const Home: React.FC = () => {
  const { movies, loading, hasMore, loadMore } = useMovieList();

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        熱門電影
      </Typography>
      <MovieList
        movies={movies}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </Container>
  );
};

// Search 頁面
const Search: React.FC = () => {
  const { 
    results, 
    loading, 
    hasMore, 
    query, 
    setQuery, 
    search 
  } = useMovieSearch();

  return (
    <Container>
      <SearchInput
        value={query}
        onChange={setQuery}
        onSearch={() => search()}
      />
      <MovieList
        movies={results}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={() => search()}
      />
    </Container>
  );
};
```

## 五、樣式設計

### 1. 主題配置
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }
        }
      }
    }
  }
});
```

### 2. 組件樣式
```typescript
const MovieGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing(2)}px;
`;

const LoadingContainer = styled('div')`
  display: flex;
  justify-content: center;
  padding: ${props => props.theme.spacing(4)}px 0;
`;