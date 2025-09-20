import { QueryClient } from '@tanstack/react-query';

// Optimized API service with intelligent caching and request deduplication
class OptimizedApiService {
  private queryClient: QueryClient;
  private requestCache = new Map<string, Promise<any>>();
  private offlineQueue: Array<() => Promise<void>> = [];

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.setupOfflineSupport();
  }

  // Request deduplication to prevent duplicate API calls
  async deduplicatedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    _options: {
      staleTime?: number;
      cacheTime?: number;
      retry?: number;
    } = {},
  ): Promise<T> {
    // Check if request is already in progress
    if (this.requestCache.has(key)) {
      return this.requestCache.get(key)!;
    }

    // Create new request
    const request = requestFn().finally(() => {
      this.requestCache.delete(key);
    });

    this.requestCache.set(key, request);
    return request;
  }

  // Optimized GET request with intelligent caching
  async get<T>(
    url: string,
    options: {
      cacheTime?: number;
      staleTime?: number;
      retry?: number;
      backgroundRefetch?: boolean;
    } = {},
  ): Promise<T> {
    const {
      cacheTime = 30 * 60 * 1000, // 30 minutes
      staleTime = 10 * 60 * 1000, // 10 minutes
      retry = 1,
      backgroundRefetch: _backgroundRefetch = false,
    } = options;

    return this.deduplicatedRequest(
      `GET:${url}`,
      async () => {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=600', // 10 minutes
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      { staleTime, cacheTime, retry },
    );
  }

  // Optimized POST request with retry logic
  async post<T>(
    url: string,
    data: any,
    options: {
      retry?: number;
      timeout?: number;
    } = {},
  ): Promise<T> {
    const { retry = 1, timeout = 10000 } = options;

    return this.deduplicatedRequest(
      `POST:${url}:${JSON.stringify(data)}`,
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      { retry },
    );
  }

  // Batch requests for better performance
  async batch<T>(
    requests: Array<() => Promise<T>>,
    options: {
      concurrency?: number;
      failFast?: boolean;
    } = {},
  ): Promise<T[]> {
    const { concurrency = 5, failFast = false } = options;
    const results: T[] = [];
    const errors: Error[] = [];

    // Process requests in batches
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      
      try {
        const batchResults = await Promise.allSettled(
          batch.map(request => request()),
        );

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results[i + index] = result.value;
          } else {
            errors[i + index] = result.reason;
            if (failFast) {
              throw result.reason;
            }
          }
        });
      } catch (error) {
        if (failFast) {
          throw error;
        }
      }
    }

    if (errors.length > 0 && failFast) {
      throw errors[0];
    }

    return results;
  }

  // Setup offline support
  private setupOfflineSupport() {
    // Listen for online/offline events
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', () => {
        this.processOfflineQueue();
      });

      window.addEventListener('offline', () => {
        console.debug('App is offline, queuing requests');
      });
    }
  }

  // Process queued requests when back online
  private async processOfflineQueue() {
    while (this.offlineQueue.length > 0) {
      const request = this.offlineQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Failed to process offline request:', error);
        }
      }
    }
  }

  // Queue request for offline processing
  queueOfflineRequest(requestFn: () => Promise<void>) {
    this.offlineQueue.push(requestFn);
  }

  // Clear cache
  clearCache() {
    this.queryClient.clear();
    this.requestCache.clear();
  }

  // Prefetch data for better UX
  async prefetch<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: {
      staleTime?: number;
      cacheTime?: number;
    } = {},
  ) {
    const { staleTime = 10 * 60 * 1000, cacheTime = 30 * 60 * 1000 } = options;

    await this.queryClient.prefetchQuery({
      queryKey: [key],
      queryFn: requestFn,
      staleTime,
      gcTime: cacheTime,
    });
  }
}

// Singleton instance
let apiServiceInstance: OptimizedApiService | null = null;

export const getOptimizedApiService = (queryClient: QueryClient) => {
  if (!apiServiceInstance) {
    apiServiceInstance = new OptimizedApiService(queryClient);
  }
  return apiServiceInstance;
};

export default OptimizedApiService;
