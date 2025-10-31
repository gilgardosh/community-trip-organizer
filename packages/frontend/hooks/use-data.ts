import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

interface UseDataOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setData: (data: T | null) => void;
}

export function useData<T>(
  fetcher: () => Promise<T>,
  options: UseDataOptions<T> = {},
): UseDataResult<T> {
  const {
    initialData = null,
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showError, showSuccess } = useNotification();
  const isMounted = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef({
    onSuccess,
    onError,
    showErrorToast,
    showSuccessToast,
    successMessage,
    showError,
    showSuccess,
  });

  // Update refs when dependencies change - using no deps to run on every render
  useEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = {
      onSuccess,
      onError,
      showErrorToast,
      showSuccessToast,
      successMessage,
      showError,
      showSuccess,
    };
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetcherRef.current();

      if (isMounted.current) {
        setData(result);
        optionsRef.current.onSuccess?.(result);
        if (
          optionsRef.current.showSuccessToast &&
          optionsRef.current.successMessage
        ) {
          optionsRef.current.showSuccess(optionsRef.current.successMessage);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');

      if (isMounted.current) {
        setError(error);
        optionsRef.current.onError?.(error);
        if (optionsRef.current.showErrorToast) {
          optionsRef.current.showError(error.message);
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Single effect for initial fetch and auto-refresh
  useEffect(() => {
    isMounted.current = true;

    fetchData();

    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, refreshInterval);
    }

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // Only depend on stable fetchData, autoRefresh, and refreshInterval
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    setData,
  };
}

interface UseMutationOptions<T, V> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T | null>;
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}

export function useMutation<T, V>(
  mutator: (variables: V) => Promise<T>,
  options: UseMutationOptions<T, V> = {},
): UseMutationResult<T, V> {
  const {
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = true,
    successMessage = 'הפעולה בוצעה בהצלחה',
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showError, showSuccess } = useNotification();

  const mutate = useCallback(
    async (variables: V): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await mutator(variables);
        setData(result);
        onSuccess?.(result);
        if (showSuccessToast) {
          showSuccess(successMessage);
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
        if (showErrorToast) {
          showError(error.message);
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [
      mutator,
      onSuccess,
      onError,
      showErrorToast,
      showSuccessToast,
      successMessage,
      showError,
      showSuccess,
    ],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    isLoading,
    error,
    data,
    reset,
  };
}

// Hook for managing paginated data
interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

interface UsePaginationResult {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationResult {
  const { initialPage = 1, pageSize: initialPageSize = 10 } = options;
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  return {
    page,
    pageSize,
    setPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}
