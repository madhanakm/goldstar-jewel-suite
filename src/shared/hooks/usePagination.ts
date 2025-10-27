import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export const usePagination = (options: UsePaginationOptions = {}) => {
  const { initialPage = 1, pageSize = 10 } = options;
  
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
  }, [initialPage]);

  const updateHasMore = useCallback((totalPages: number) => {
    setHasMore(page < totalPages);
  }, [page]);

  return {
    page,
    pageSize,
    hasMore,
    nextPage,
    resetPagination,
    updateHasMore,
  };
};