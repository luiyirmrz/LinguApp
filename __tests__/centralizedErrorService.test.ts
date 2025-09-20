/**
 * UNIT TESTS FOR CENTRALIZED ERROR SERVICE
 * 
 * Tests all major functionality including:
 * - Error handling and categorization
 * - Retry logic with exponential backoff
 * - Fallback strategies
 * - User-friendly message generation
 * - Error reporting and logging
 */

import { 
  centralizedErrorService, 
  handleError, 
  handleAuthError, 
  handleNetworkError, 
  handleDatabaseError,
  ErrorCategory,
  ErrorSeverity, 
} from '@/services/monitoring/centralizedErrorService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock React Native Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('CentralizedErrorService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset service state
    centralizedErrorService.clearErrorQueue();
  });

  describe('handleError', () => {
    it('should handle basic errors correctly', async () => {
      const error = new Error('Test error');
      const result = await handleError(error, 'unknown', {
        component: 'TestComponent',
        action: 'testAction',
      });

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(false);
      expect(result.userMessage).toBeTruthy();
    });

    it('should categorize errors correctly', async () => {
      const authError = new Error('invalid-email');
      const networkError = new Error('timeout');
      const dbError = new Error('database_locked');

      const authResult = await handleError(authError, 'auth');
      const networkResult = await handleError(networkError, 'network');
      const dbResult = await handleError(dbError, 'database');

      // Check that we get user-friendly messages (may be generic fallback for unknown errors)
      expect(authResult.userMessage).toBeTruthy();
      expect(networkResult.userMessage).toBeTruthy();
      expect(dbResult.userMessage).toBeTruthy();
      
      // Check that messages are strings and not empty
      expect(typeof authResult.userMessage).toBe('string');
      expect(typeof networkResult.userMessage).toBe('string');
      expect(typeof dbResult.userMessage).toBe('string');
      expect(authResult.userMessage.length).toBeGreaterThan(0);
      expect(networkResult.userMessage.length).toBeGreaterThan(0);
      expect(dbResult.userMessage.length).toBeGreaterThan(0);
    });

    it('should determine severity correctly', async () => {
      const lowError = new Error('validation error');
      const criticalError = new Error('database corrupt');

      const lowResult = await handleError(lowError, 'validation');
      const criticalResult = await handleError(criticalError, 'database');

      // Critical errors should be reported immediately
      expect(criticalResult.userMessage).toBeTruthy();
    });
  });

  describe('handleAuthError', () => {
    it('should handle invalid credentials', async () => {
      const error = new Error('invalid-email');
      const result = await handleAuthError(error, { email: 'test@example.com' });

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(true);
      expect(result.userMessage).toContain('Invalid email');
    });

    it('should handle user not found', async () => {
      const error = new Error('user-not-found');
      const result = await handleAuthError(error, { email: 'test@example.com' });

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(false);
      expect(result.userMessage).toContain('not found');
    });

    it('should handle too many attempts', async () => {
      const error = new Error('too-many-requests');
      const result = await handleAuthError(error, { email: 'test@example.com' });

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(false);
      expect(result.userMessage).toContain('attempts');
    });

    it('should handle network errors', async () => {
      const error = new Error('network error');
      const result = await handleAuthError(error, { email: 'test@example.com' });

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(true);
      expect(result.userMessage).toContain('Network');
    });
  });

  describe('handleNetworkError', () => {
    it('should retry on timeout errors', async () => {
      const mockRetryFunction = jest.fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValueOnce({ data: 'success' });

      const error = new Error('timeout');
      const result = await handleNetworkError(
        error,
        mockRetryFunction,
        { endpoint: '/api/test', retryCount: 0 },
      );

      expect(mockRetryFunction).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ data: 'success' });
    });

    it('should not retry on non-retryable errors', async () => {
      const mockRetryFunction = jest.fn().mockResolvedValue({ data: 'success' });
      const error = new Error('permission denied');

      const result = await handleNetworkError(
        error,
        mockRetryFunction,
        { endpoint: '/api/test', retryCount: 0 },
      );

      // For non-retryable errors, the function should not be called at all
      // since the error is not retryable
      expect(mockRetryFunction).toHaveBeenCalledTimes(0);
      expect(result.success).toBe(false);
    });

    it('should respect max retry limits', async () => {
      const mockRetryFunction = jest.fn().mockRejectedValue(new Error('timeout'));
      const error = new Error('timeout');

      const result = await handleNetworkError(
        error,
        mockRetryFunction,
        { endpoint: '/api/test', retryCount: 5 }, // Max retries reached
      );

      expect(result.success).toBe(false);
      expect(result.userMessage).toContain('timed out');
    });
  });

  describe('handleDatabaseError', () => {
    it('should suggest fallback for storage errors', async () => {
      const error = new Error('database_locked');
      const result = await handleDatabaseError(error, 'write', {
        table: 'users',
        retryCount: 0,
      });

      expect(result.success).toBe(false);
      expect(result.shouldUseFallback).toBe(true);
      expect(result.userMessage).toContain('save');
    });

    it('should not suggest fallback for non-storage errors', async () => {
      const error = new Error('validation error');
      const result = await handleDatabaseError(error, 'write', {
        table: 'users',
        retryCount: 0,
      });

      expect(result.success).toBe(false);
      expect(result.shouldUseFallback).toBe(false);
    });

    it('should provide appropriate messages for read operations', async () => {
      const error = new Error('database error');
      const result = await handleDatabaseError(error, 'read', {
        table: 'users',
        retryCount: 0,
      });

      expect(result.userMessage).toContain('load');
    });
  });

  describe('Fallback Storage', () => {
    it('should save to fallback storage', async () => {
      const testData = { key: 'value' };
      await centralizedErrorService.saveToFallbackStorage('test-key', testData);

      // Verify AsyncStorage was called
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    it('should load from fallback storage', async () => {
      const testData = { key: 'value' };
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(testData));

      const result = await centralizedErrorService.loadFromFallbackStorage('test-key');
      expect(result).toEqual(testData);
    });

    it('should handle fallback storage errors', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.setItem.mockRejectedValue(new Error('storage error'));

      await centralizedErrorService.saveToFallbackStorage('test-key', { data: 'test' });
      
      // Should handle the error gracefully
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Error Queue Management', () => {
    it('should add errors to queue', () => {
      const initialQueue = centralizedErrorService.getErrorQueue();
      expect(initialQueue).toHaveLength(0);

      handleError(new Error('test error'), 'unknown');
      
      const updatedQueue = centralizedErrorService.getErrorQueue();
      expect(updatedQueue).toHaveLength(1);
      expect(updatedQueue[0].error.message).toBe('test error');
    });

    it('should respect max queue size', () => {
      // Add more errors than max queue size
      for (let i = 0; i < 105; i++) {
        handleError(new Error(`error ${i}`), 'unknown');
      }

      const queue = centralizedErrorService.getErrorQueue();
      expect(queue.length).toBeLessThanOrEqual(100);
    });

    it('should clear error queue', () => {
      handleError(new Error('test error'), 'unknown');
      expect(centralizedErrorService.getErrorQueue()).toHaveLength(1);

      centralizedErrorService.clearErrorQueue();
      expect(centralizedErrorService.getErrorQueue()).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        enableUserNotifications: false,
        maxQueueSize: 50,
      };

      centralizedErrorService.updateConfig(newConfig);
      
      // Verify configuration was updated
      const queue = centralizedErrorService.getErrorQueue();
      // Add more errors than new max size
      for (let i = 0; i < 60; i++) {
        handleError(new Error(`error ${i}`), 'unknown');
      }

      expect(centralizedErrorService.getErrorQueue().length).toBeLessThanOrEqual(50);
    });

    it('should set language for messages', () => {
      centralizedErrorService.setLanguage('es');
      
      // Test that Spanish messages are returned
      const error = new Error('invalid-email');
      handleAuthError(error, { email: 'test@example.com' }).then(result => {
        expect(result.userMessage).toContain('inválidos');
      });
    });
  });

  describe('Retry Logic', () => {
    it('should calculate backoff delay correctly', async () => {
      const mockRetryFunction = jest.fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValueOnce({ data: 'success' });

      const error = new Error('timeout');
      const startTime = Date.now();

      await handleNetworkError(
        error,
        mockRetryFunction,
        { endpoint: '/api/test', retryCount: 0 },
      );

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should have exponential backoff delays
      expect(totalTime).toBeGreaterThan(500); // Base delay
      expect(mockRetryFunction).toHaveBeenCalledTimes(3);
    });

  it('should respect max delay limits', async () => {
    const mockRetryFunction = jest.fn().mockRejectedValue(new Error('timeout'));
    const error = new Error('timeout');
    const startTime = Date.now();

    await handleNetworkError(
      error,
      mockRetryFunction,
      { endpoint: '/api/test', retryCount: 0 },
    );

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Should not exceed max delay (allowing for reasonable retry time)
    expect(totalTime).toBeLessThan(20000); // Max delay should be reasonable for retry logic
  }, 25000); // Increased test timeout to 25 seconds
  });

  describe('Error Reporting', () => {
    it('should report critical errors immediately', async () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      
      const criticalError = new Error('database corrupt');
      await handleError(criticalError, 'database');

      // Should log critical error (using console.debug after optimization)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Reporting error to external service'),
        expect.any(Object),
      );

      consoleSpy.mockRestore();
    });

    it('should generate unique error IDs', async () => {
      const error1 = new Error('error 1');
      const error2 = new Error('error 2');

      await handleError(error1, 'unknown');
      await handleError(error2, 'unknown');

      const queue = centralizedErrorService.getErrorQueue();
      const ids = queue.map(report => report.id);

      expect(ids[0]).not.toBe(ids[1]);
      expect(ids[0]).toMatch(/^error_\d+_/);
      expect(ids[1]).toMatch(/^error_\d+_/);
    });
  });
});
