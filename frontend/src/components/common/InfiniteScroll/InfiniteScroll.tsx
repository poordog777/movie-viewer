import { useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface InfiniteScrollProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
}

const LoaderContainer = styled(Box)`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)} 0;
`;

const ScrollTrigger = styled('div')`
  height: 20px;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  loading,
  hasMore,
  onLoadMore,
  children
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    const currentTarget = observerTarget.current;
    
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <>
      {children}
      {(hasMore || loading) && (
        <ScrollTrigger ref={observerTarget}>
          {loading && (
            <LoaderContainer>
              <CircularProgress size={32} />
            </LoaderContainer>
          )}
        </ScrollTrigger>
      )}
    </>
  );
};

export default InfiniteScroll;