/**
 * INTEGRATION TESTS FOR ENHANCED ERROR BOUNDARY
 * 
 * Tests error boundary functionality including:
 * - Error catching and reporting
 * - Retry mechanisms
 * - Fallback UI rendering
 * - Integration with centralized error service
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { EnhancedErrorBoundary, SimpleErrorBoundary, CriticalErrorBoundary, NetworkErrorBoundary } from '@/components/EnhancedErrorBoundary';

// Mock the centralized error service
jest.mock('@/services/centralizedErrorService', () => ({
  centralizedErrorService: {
    handleError: jest.fn().mockResolvedValue({
      success: false,
      shouldRetry: false,
      userMessage: 'Test error message',
    }),
  },
  useErrorHandler: () => ({
    handleAuthError: jest.fn().mockResolvedValue({
      success: false,
      shouldRetry: false,
      userMessage: 'Test auth error message',
    }),
    handleError: jest.fn().mockResolvedValue({
      success: false,
      shouldRetry: false,
      userMessage: 'Test error message',
    }),
  }),
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

// Mock theme
jest.mock('@/constants/theme', () => ({
  theme: {
    colors: {
      error: '#ff0000',
      primary: '#007AFF',
      secondary: '#5856D6',
      white: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      background: '#ffffff',
      surface: '#f5f5f5',
      border: '#e0e0e0',
      warning: '#ff9500',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    fontSize: {
      sm: 12,
      md: 16,
      xl: 20,
    },
    borderRadius: {
      md: 8,
    },
  },
}));

describe('EnhancedErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Component that throws an error for testing
  const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>Normal component</div>;
  };

  describe('Basic Error Catching', () => {
    it('should catch and display error UI when child component throws', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();
      expect(screen.getByText('We encountered an unexpected error. Don\'t worry, your progress is safe.')).toBeTruthy();
    });

    it('should render children normally when no error occurs', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={false} />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Normal component')).toBeTruthy();
    });

    it('should call onError prop when error occurs', () => {
      const onError = jest.fn();
      
      render(
        <EnhancedErrorBoundary onError={onError}>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
      );
    });
  });

  describe('Retry Functionality', () => {
    it('should show retry button by default', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Try Again')).toBeTruthy();
    });

    it('should hide retry button when showRetryButton is false', () => {
      render(
        <EnhancedErrorBoundary showRetryButton={false}>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(screen.queryByText('Try Again')).toBeFalsy();
    });

    it('should handle retry button press', async () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.press(retryButton);

      // Should show retrying state
      await waitFor(() => {
        expect(screen.getByText('Retrying...')).toBeTruthy();
      });
    });

    it('should show retry attempt count', async () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      const retryButton = screen.getByText('Try Again');
      
      // First retry
      fireEvent.press(retryButton);
      await waitFor(() => {
        expect(screen.getByText('Retry attempt 1 of 3')).toBeTruthy();
      });

      // Second retry
      fireEvent.press(screen.getByText('Try Again'));
      await waitFor(() => {
        expect(screen.getByText('Retry attempt 2 of 3')).toBeTruthy();
      });
    });

    it('should show max retries reached message', async () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      // Perform 3 retries
      for (let i = 0; i < 3; i++) {
        fireEvent.press(screen.getByText('Try Again'));
        await waitFor(() => {
          expect(screen.getByText(`Retry attempt ${i + 1} of 3`)).toBeTruthy();
        });
      }

      // Fourth retry should show max retries reached
      fireEvent.press(screen.getByText('Try Again'));
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Maximum Retries Reached',
          'Unable to recover from this error. Please try refreshing the app or contact support.',
          expect.any(Array),
        );
      });
    });
  });

  describe('Report Issue Functionality', () => {
    it('should show report button by default', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Report Issue')).toBeTruthy();
    });

    it('should hide report button when showReportButton is false', () => {
      render(
        <EnhancedErrorBoundary showReportButton={false}>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(screen.queryByText('Report Issue')).toBeFalsy();
    });

    it('should handle report issue button press', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      const reportButton = screen.getByText('Report Issue');
      fireEvent.press(reportButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Contact Support',
        'Please contact our support team with the following information:',
        expect.any(Array),
      );
    });
  });

  describe('Refresh App Functionality', () => {
    it('should show refresh app button', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Refresh App')).toBeTruthy();
    });

    it('should handle refresh app button press', () => {
      // Mock window.location.reload for web
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      const refreshButton = screen.getByText('Refresh App');
      fireEvent.press(refreshButton);

      // Should attempt to reload the app
      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Error Details in Development', () => {
    const _originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      // Mock __DEV__ to true for development mode
      (global as any).__DEV__ = true;
    });

    afterEach(() => {
      (global as any).__DEV__ = false;
      // process.env.NODE_ENV is read-only in tests
    });

    it('should show error details button in development', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Show Error Details')).toBeTruthy();
    });

    it('should toggle error details visibility', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      const detailsButton = screen.getByText('Show Error Details');
      fireEvent.press(detailsButton);

      expect(screen.getByText('Hide Error Details')).toBeTruthy();
      expect(screen.getByText('Error Details (Development)')).toBeTruthy();
      expect(screen.getByText(/Error: Test error/)).toBeTruthy();
    });
  });

  describe('Custom Fallback UI', () => {
    it('should render custom fallback when provided', () => {
      const CustomFallback = () => <div>Custom error UI</div>;

      render(
        <EnhancedErrorBoundary fallback={<CustomFallback />}>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Custom error UI')).toBeTruthy();
      expect(screen.queryByText('Oops! Something went wrong')).toBeFalsy();
    });
  });

  describe('Props Change Reset', () => {
    it('should reset error state when props change and resetOnPropsChange is true', () => {
      const { rerender } = render(
        <EnhancedErrorBoundary resetOnPropsChange={true}>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();

      // Change props to trigger reset
      rerender(
        <EnhancedErrorBoundary resetOnPropsChange={true} category="network">
          <ThrowError shouldThrow={false} />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Normal component')).toBeTruthy();
    });

    it('should not reset error state when resetOnPropsChange is false', () => {
      const { rerender } = render(
        <EnhancedErrorBoundary resetOnPropsChange={false}>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();

      // Change props but error should persist
      rerender(
        <EnhancedErrorBoundary resetOnPropsChange={false} category="network">
          <ThrowError shouldThrow={false} />
        </EnhancedErrorBoundary>,
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();
    });
  });

  describe('Convenience Components', () => {
    it('should render SimpleErrorBoundary with basic configuration', () => {
      render(
        <SimpleErrorBoundary>
          <ThrowError />
        </SimpleErrorBoundary>,
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();
      expect(screen.getByText('Try Again')).toBeTruthy();
      expect(screen.queryByText('Report Issue')).toBeFalsy();
    });

    it('should render CriticalErrorBoundary with full configuration', () => {
      render(
        <CriticalErrorBoundary>
          <ThrowError />
        </CriticalErrorBoundary>,
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();
      expect(screen.getByText('Try Again')).toBeTruthy();
      expect(screen.getByText('Report Issue')).toBeTruthy();
    });

    it('should render NetworkErrorBoundary with network-specific configuration', () => {
      render(
        <NetworkErrorBoundary>
          <ThrowError />
        </NetworkErrorBoundary>,
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();
      expect(screen.getByText('Try Again')).toBeTruthy();
      expect(screen.getByText('Report Issue')).toBeTruthy();
    });
  });

  describe('Error Reporting Integration', () => {
    it('should report errors to centralized service', async () => {
      const { centralizedErrorService } = require('@/services/centralizedErrorService');
      
      render(
        <EnhancedErrorBoundary category="network" severity="medium">
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      await waitFor(() => {
        expect(centralizedErrorService.handleError).toHaveBeenCalledWith(
          expect.any(Error),
          'network',
          expect.objectContaining({
            component: 'ErrorBoundary',
            action: 'component_error',
          }),
        );
      });
    });

    it('should include error context in reporting', async () => {
      const { centralizedErrorService } = require('@/services/centralizedErrorService');
      
      render(
        <EnhancedErrorBoundary category="auth" severity="high">
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      await waitFor(() => {
        expect(centralizedErrorService.handleError).toHaveBeenCalledWith(
          expect.any(Error),
          'auth',
          expect.objectContaining({
            component: 'ErrorBoundary',
            action: 'component_error',
            additionalData: expect.objectContaining({
              componentStack: expect.any(String),
            }),
          }),
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      const retryButton = screen.getByText('Try Again');
      const refreshButton = screen.getByText('Refresh App');
      const reportButton = screen.getByText('Report Issue');

      expect(retryButton).toBeTruthy();
      expect(refreshButton).toBeTruthy();
      expect(reportButton).toBeTruthy();
    });

    it('should disable buttons during retry', async () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>,
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Retrying...')).toBeTruthy();
        expect(retryButton).toBeDisabled();
      });
    });
  });
});
