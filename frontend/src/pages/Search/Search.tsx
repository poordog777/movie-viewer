import { useState, useCallback, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import MovieGrid from '../../components/movie/MovieGrid/MovieGrid';
import SearchInput from '../../components/common/SearchInput/SearchInput';
import { Movie } from '../../types/movie';
import { moviesAPI } from '../../api/movies';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 重置搜尋結果
  const resetSearch = useCallback(() => {
    setMovies([]);
    setHasMore(true);
    setPage(1);
  }, []);

  // 搜尋電影
  const searchMovies = useCallback(async (searchQuery: string, currentPage: number) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await moviesAPI.search(searchQuery, currentPage);
      if (currentPage === 1) {
        setMovies(response.results);
      } else {
        setMovies(prev => [...prev, ...response.results]);
      }
      setHasMore(response.page < response.total_pages);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Search failed:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // 處理搜尋提交
  const handleSearch = useCallback(() => {
    if (query.trim()) {
      setSearchParams({ query: query.trim() });
      resetSearch();
      searchMovies(query.trim(), 1);
    }
  }, [query, setSearchParams, resetSearch, searchMovies]);

  // 處理電影卡片點擊
  const handleMovieClick = useCallback((movieId: number) => {
    navigate(`/movie/${movieId}`);
  }, [navigate]);

  // 從 URL 參數加載初始搜尋
  useEffect(() => {
    const queryParam = searchParams.get('query');
    if (queryParam) {
      setQuery(queryParam);
      searchMovies(queryParam, 1);
    }
  }, [searchParams, searchMovies]);

  return (
    <PageContainer>
      <SearchInput
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        placeholder="搜尋電影..."
      />
      
      {query.trim() && (
        <Typography variant="h5" gutterBottom>
          搜尋結果: {query}
        </Typography>
      )}

      {movies.length > 0 ? (
        <MovieGrid
          movies={movies}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={() => searchMovies(query, page)}
          onMovieClick={handleMovieClick}
        />
      ) : !loading && query.trim() && (
        <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
          找不到相關電影
        </Typography>
      )}
    </PageContainer>
  );
};

export default Search;