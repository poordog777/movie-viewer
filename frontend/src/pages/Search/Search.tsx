import { useState, useCallback, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import MovieGridWithPagination from '../../components/movie/MovieGridWithPagination/MovieGridWithPagination';
import { Movie } from '../../types/movie';
import { moviesAPI } from '../../api/movies';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

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
      {query.trim() && (
        <Typography variant="h5" gutterBottom>
          搜尋結果: {query}
        </Typography>
      )}

      {movies.length > 0 ? (
        <MovieGridWithPagination
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