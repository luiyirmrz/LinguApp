import { QueryClient } from '@tanstack/react-query';

// Optimized database service with intelligent caching and query optimization
class OptimizedDatabaseService {
  private queryClient: QueryClient;
  private queryCache = new Map<string, any>();
  private batchQueue: Array<() => Promise<void>> = [];
  private batchTimer: any = null;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  // Optimized query with intelligent caching
  async query<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: {
      staleTime?: number;
      cacheTime?: number;
      retry?: number;
      backgroundRefetch?: boolean;
    } = {},
  ): Promise<T> {
    const {
      staleTime = 5 * 60 * 1000, // 5 minutes
      cacheTime = 15 * 60 * 1000, // 15 minutes
      retry = 1,
      backgroundRefetch: _backgroundRefetch = false,
    } = options;

    // Check cache first
    const cachedData = this.queryCache.get(queryKey);
    if (cachedData && Date.now() - cachedData.timestamp < staleTime) {
      return cachedData.data;
    }

    // Execute query
    const result = await this.queryClient.fetchQuery({
      queryKey: [queryKey],
      queryFn,
      staleTime,
      gcTime: cacheTime,
      retry,
    });

    // Cache result
    this.queryCache.set(queryKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  }

  // Batch queries for better performance
  async batchQuery<T>(
    queries: Array<{
      key: string;
      queryFn: () => Promise<T>;
      options?: any;
    }>,
    options: {
      concurrency?: number;
      failFast?: boolean;
    } = {},
  ): Promise<T[]> {
    const { concurrency = 3, failFast = false } = options;

    // Group queries by priority
    const highPriorityQueries = queries.filter(q => q.options?.priority === 'high');
    const normalQueries = queries.filter(q => q.options?.priority !== 'high');

    // Execute high priority queries first
    const highPriorityResults = await this.executeBatch(highPriorityQueries, 1, failFast);
    
    // Execute normal queries with concurrency
    const normalResults = await this.executeBatch(normalQueries, concurrency, failFast);

    // Combine results in original order
    const results: T[] = [];
    let highIndex = 0;
    let normalIndex = 0;

    queries.forEach(query => {
      if (query.options?.priority === 'high') {
        results.push(highPriorityResults[highIndex++]);
      } else {
        results.push(normalResults[normalIndex++]);
      }
    });

    return results;
  }

  private async executeBatch<T>(
    queries: Array<{ key: string; queryFn: () => Promise<T> }>,
    concurrency: number,
    failFast: boolean,
  ): Promise<T[]> {
    const results: T[] = [];
    const errors: Error[] = [];

    for (let i = 0; i < queries.length; i += concurrency) {
      const batch = queries.slice(i, i + concurrency);
      
      try {
        const batchResults = await Promise.allSettled(
          batch.map(query => this.query(query.key, query.queryFn)),
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

    return results;
  }

  // Optimized mutation with optimistic updates
  async mutate<T>(
    mutationKey: string,
    mutationFn: () => Promise<T>,
    options: {
      optimisticUpdate?: (oldData: any) => any;
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
      retry?: number;
    } = {},
  ): Promise<T> {
    const { optimisticUpdate, onSuccess, onError, retry = 1 } = options;

    try {
      // Apply optimistic update if provided
      if (optimisticUpdate) {
        const oldData = this.queryCache.get(mutationKey);
        if (oldData) {
          this.queryCache.set(mutationKey, {
            data: optimisticUpdate(oldData.data),
            timestamp: Date.now(),
          });
        }
      }

      // Execute mutation
      const result = await this.queryClient.fetchQuery({
        queryKey: [mutationKey],
        queryFn: mutationFn,
        retry,
        staleTime: 0, // Always fetch fresh data for mutations
      });

      // Update cache with real data
      this.queryCache.set(mutationKey, {
        data: result,
        timestamp: Date.now(),
      });

      onSuccess?.(result);
      return result;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }

  // Batch mutations for better performance
  batchMutation<T>(
    mutationFn: () => Promise<T>,
    options: {
      delay?: number;
      maxBatchSize?: number;
    } = {},
  ): Promise<T> {
    const { delay = 100, maxBatchSize = 10 } = options;

    return new Promise((resolve, reject) => {
      this.batchQueue.push(async () => {
        try {
          const result = await mutationFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      // Process batch when it reaches max size or after delay
      if (this.batchQueue.length >= maxBatchSize) {
        this.processBatch();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch();
        }, delay);
      }
    });
  }

  private async processBatch() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const batch = this.batchQueue.splice(0);
    if (batch.length === 0) return;

    try {
      await Promise.all(batch.map(fn => fn()));
    } catch (error) {
      console.error('Batch processing error:', error);
    }
  }

  // Prefetch data for better UX
  async prefetch<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: {
      staleTime?: number;
      cacheTime?: number;
    } = {},
  ) {
    const { staleTime = 5 * 60 * 1000, cacheTime = 15 * 60 * 1000 } = options;

    await this.queryClient.prefetchQuery({
      queryKey: [queryKey],
      queryFn,
      staleTime,
      gcTime: cacheTime,
    });
  }

  // Invalidate cache
  invalidateCache(queryKey?: string) {
    if (queryKey) {
      this.queryCache.delete(queryKey);
      this.queryClient.invalidateQueries({ queryKey: [queryKey] });
    } else {
      this.queryCache.clear();
      this.queryClient.clear();
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys()),
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, value] of this.queryCache.entries()) {
      totalSize += key.length * 2; // Unicode characters
      totalSize += JSON.stringify(value).length * 2;
    }
    return totalSize;
  }
}

// Singleton instance
let databaseServiceInstance: OptimizedDatabaseService | null = null;

export const getOptimizedDatabaseService = (queryClient: QueryClient) => {
  if (!databaseServiceInstance) {
    databaseServiceInstance = new OptimizedDatabaseService(queryClient);
  }
  return databaseServiceInstance;
};

export default OptimizedDatabaseService;
