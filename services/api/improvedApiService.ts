/**
 * Improved API Service with proper error handling, request cancellation, and retry logic
 * Follows best practices for React Native and web applications
 */

import { AbortController } from 'abort-controller';

export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  response?: Response;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
  isAbortError?: boolean;
}

class ImprovedApiService {
  private baseURL: string;
  private defaultTimeout: number = 10000; // 10 seconds
  private defaultRetries: number = 3;
  private defaultRetryDelay: number = 1000; // 1 second
  private activeRequests: Map<string, AbortController> = new Map();

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  /**
   * Make a GET request with proper error handling and cancellation
   */
  async get<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * Make a POST request with proper error handling and cancellation
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * Make a PUT request with proper error handling and cancellation
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * Make a DELETE request with proper error handling and cancellation
   */
  async delete<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Core request method with retry logic and proper error handling
   */
  private async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions & RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      signal: externalSignal,
      headers = {},
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const requestKey = `${options.method || 'GET'}:${url}`;

    // Create abort controller for this request
    const abortController = new AbortController();
    this.activeRequests.set(requestKey, abortController);

    // Combine external signal with internal abort controller
    const combinedSignal = this.combineAbortSignals(
      abortController.signal,
      externalSignal
    );

    let lastError: ApiError | null = null;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Request timeout') as ApiError);
          }, timeout);

          // Clear timeout if request completes
          combinedSignal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
          });
        });

        // Create fetch promise
        const fetchPromise = fetch(url, {
          ...fetchOptions,
          signal: combinedSignal,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        });

        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        // Remove from active requests
        this.activeRequests.delete(requestKey);

        if (!response.ok) {
          const error: ApiError = new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
          error.status = response.status;
          error.statusText = response.statusText;
          error.response = response;
          throw error;
        }

        const data = await response.json();

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } catch (error: any) {
        lastError = this.normalizeError(error);

        // Don't retry on certain errors
        if (
          lastError.isAbortError ||
          lastError.status === 401 || // Unauthorized
          lastError.status === 403 || // Forbidden
          lastError.status === 404 || // Not Found
          lastError.status === 422 || // Unprocessable Entity
          attempt > retries
        ) {
          break;
        }

        // Wait before retry
        if (attempt <= retries) {
          await this.delay(retryDelay * Math.pow(2, attempt - 1));
        }
      }
    }

    // Remove from active requests on final failure
    this.activeRequests.delete(requestKey);

    throw lastError || new Error('Request failed');
  }

  /**
   * Cancel a specific request
   */
  cancelRequest(endpoint: string, method: string = 'GET'): void {
    const requestKey = `${method}:${this.baseURL}${endpoint}`;
    const controller = this.activeRequests.get(requestKey);
    
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestKey);
    }
  }

  /**
   * Cancel all active requests
   */
  cancelAllRequests(): void {
    this.activeRequests.forEach((controller) => {
      controller.abort();
    });
    this.activeRequests.clear();
  }

  /**
   * Combine multiple abort signals
   */
  private combineAbortSignals(
    ...signals: (AbortSignal | undefined)[]
  ): AbortSignal {
    const validSignals = signals.filter(Boolean) as AbortSignal[];
    
    if (validSignals.length === 0) {
      return new AbortController().signal;
    }
    
    if (validSignals.length === 1) {
      return validSignals[0];
    }

    const controller = new AbortController();
    
    validSignals.forEach((signal) => {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', () => controller.abort());
      }
    });

    return controller.signal;
  }

  /**
   * Normalize error to ApiError format
   */
  private normalizeError(error: any): ApiError {
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    
    // Check for abort error
    if (error.name === 'AbortError' || error.message.includes('aborted')) {
      apiError.isAbortError = true;
    }
    
    // Check for timeout error
    if (error.message.includes('timeout')) {
      apiError.isTimeoutError = true;
    }
    
    // Check for network error
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    ) {
      apiError.isNetworkError = true;
    }

    return apiError;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get active requests count
   */
  getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Check if a request is active
   */
  isRequestActive(endpoint: string, method: string = 'GET'): boolean {
    const requestKey = `${method}:${this.baseURL}${endpoint}`;
    return this.activeRequests.has(requestKey);
  }
}

// Create singleton instance
export const apiService = new ImprovedApiService();

// Export types and service
export { ImprovedApiService };
export default apiService;
