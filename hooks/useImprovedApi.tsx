/**
 * Custom hook for using the improved API service with React
 * Provides proper cleanup, error handling, and loading states
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, ApiRequestOptions, ApiResponse, ApiError } from '@/services/api/improvedApiService';

export interface UseApiOptions extends ApiRequestOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  onFinally?: () => void;
}

export interface UseApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  cancel: () => void;
}

/**
 * Hook for making API requests with proper React integration
 */
export function useApi<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiState<T> {
  const {
    enabled = true,
    onSuccess,
    onError,
    onFinally,
    ...apiOptions
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const makeRequest = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<T> = await apiService.get<T>(endpoint, {
        ...apiOptions,
        signal: abortControllerRef.current.signal,
      });

      if (isMountedRef.current) {
        setData(response.data);
        onSuccess?.(response.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      
      // Don't set error for aborted requests
      if (!apiError.isAbortError && isMountedRef.current) {
        setError(apiError);
        onError?.(apiError);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        onFinally?.();
      }
    }
  }, [endpoint, enabled, onSuccess, onError, onFinally, ...Object.values(apiOptions)]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Effect to make request when dependencies change
  useEffect(() => {
    makeRequest();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [makeRequest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: makeRequest,
    cancel,
  };
}

/**
 * Hook for making POST requests
 */
export function useApiPost<T = any, D = any>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  const {
    enabled = true,
    onSuccess,
    onError,
    onFinally,
    ...apiOptions
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const post = useCallback(async (postData: D) => {
    if (!enabled) return;

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<T> = await apiService.post<T>(endpoint, postData, {
        ...apiOptions,
        signal: abortControllerRef.current.signal,
      });

      if (isMountedRef.current) {
        setData(response.data);
        onSuccess?.(response.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      
      // Don't set error for aborted requests
      if (!apiError.isAbortError && isMountedRef.current) {
        setError(apiError);
        onError?.(apiError);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        onFinally?.();
      }
    }
  }, [endpoint, enabled, onSuccess, onError, onFinally, ...Object.values(apiOptions)]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    post,
    cancel,
  };
}

/**
 * Hook for making multiple API requests
 */
export function useApiMultiple<T = any>(
  requests: Array<{ endpoint: string; options?: UseApiOptions }>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const abortControllersRef = useRef<AbortController[]>([]);
  const isMountedRef = useRef(true);

  const makeRequests = useCallback(async () => {
    // Cancel previous requests
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current = [];

    try {
      setLoading(true);
      setError(null);

      const promises = requests.map(async ({ endpoint, options = {} }) => {
        const controller = new AbortController();
        abortControllersRef.current.push(controller);

        return apiService.get<T>(endpoint, {
          ...options,
          signal: controller.signal,
        });
      });

      const responses = await Promise.all(promises);

      if (isMountedRef.current) {
        setData(responses.map(response => response.data));
      }
    } catch (err) {
      const apiError = err as ApiError;
      
      if (!apiError.isAbortError && isMountedRef.current) {
        setError(apiError);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [requests]);

  const cancel = useCallback(() => {
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current = [];
  }, []);

  // Effect to make requests when dependencies change
  useEffect(() => {
    makeRequests();

    return () => {
      abortControllersRef.current.forEach(controller => controller.abort());
    };
  }, [makeRequests]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllersRef.current.forEach(controller => controller.abort());
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: makeRequests,
    cancel,
  };
}
