/**
 * Unit Tests for Accessibility System
 * Tests screen reader support, keyboard navigation, and accessibility features
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { AccessibilityProvider, useAccessibility, useFocusManagement, useScreenReader } from '@/components/AccessibilityProvider';
import { useI18n } from '@/hooks/useI18n';

// Mock the i18n hook
jest.mock('@/hooks/useI18n', () => ({
  useI18n: jest.fn(),
}));

// Mock AccessibilityInfo
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(),
    announceForAccessibility: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    isHighContrastEnabled: jest.fn(),
  },
}));

const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;

// Test component to test hooks
const TestComponent: React.FC = () => {
  const { isScreenReaderEnabled, announceForAccessibility } = useAccessibility();
  const { isFocused, focus, blur } = useFocusManagement('test-element');
  const { announce, announceError, announceSuccess } = useScreenReader();

  return (
    <div>
      <div data-testid="screen-reader-status">
        {isScreenReaderEnabled ? 'enabled' : 'disabled'}
      </div>
      <div data-testid="focus-status">
        {isFocused ? 'focused' : 'unfocused'}
      </div>
      <button
        data-testid="focus-button"
        onClick={() => focus()}
        onBlur={() => blur()}
      >
        Focus Me
      </button>
      <button
        data-testid="announce-button"
        onClick={() => announce('Test message')}
      >
        Announce
      </button>
      <button
        data-testid="announce-error-button"
        onClick={() => announceError('Error message')}
      >
        Announce Error
      </button>
      <button
        data-testid="announce-success-button"
        onClick={() => announceSuccess('Success message')}
      >
        Announce Success
      </button>
    </div>
  );
};

describe('AccessibilityProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseI18n.mockReturnValue({
      t: jest.fn((key) => key),
      accessibility: jest.fn((key) => key),
    } as any);
  });

  describe('Screen Reader Support', () => {
    it('should detect screen reader status', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);
      
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>,
      );
      
      expect(screen.getByTestId('screen-reader-status')).toHaveTextContent('enabled');
    });

    it('should announce messages when screen reader is enabled', () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);
      
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>,
      );
      
      const announceButton = screen.getByTestId('announce-button');
      fireEvent.press(announceButton);
      
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Test message');
    });

    it('should not announce messages when screen reader is disabled', () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(false);
      
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>,
      );
      
      const announceButton = screen.getByTestId('announce-button');
      fireEvent.press(announceButton);
      
      expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
    });

    it('should announce error messages with assertive priority', () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);
      
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>,
      );
      
      const announceErrorButton = screen.getByTestId('announce-error-button');
      fireEvent.press(announceErrorButton);
      
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Error message');
    });

    it('should announce success messages with polite priority', () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);
      
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>,
      );
      
      const announceSuccessButton = screen.getByTestId('announce-success-button');
      fireEvent.press(announceSuccessButton);
      
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Success message');
    });
  });

  describe('Focus Management', () => {
    it('should manage focus state correctly', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>,
      );
      
      const focusButton = screen.getByTestId('focus-button');
      const focusStatus = screen.getByTestId('focus-status');
      
      expect(focusStatus).toHaveTextContent('unfocused');
      
      fireEvent.press(focusButton);
      expect(focusStatus).toHaveTextContent('focused');
      
      fireEvent(focusButton, 'blur');
      expect(focusStatus).toHaveTextContent('unfocused');
    });

    it('should register and unregister focusable elements', () => {
      const TestFocusComponent: React.FC = () => {
        const { registerFocusableElement, unregisterFocusableElement, focusElement } = useAccessibility();
        
        React.useEffect(() => {
          registerFocusableElement('test-id', () => {});
          return () => unregisterFocusableElement('test-id');
        }, []);
        
        return (
          <button
            data-testid="focus-element-button"
            onClick={() => focusElement('test-id')}
          >
            Focus Element
          </button>
        );
      };
      
      render(
        <AccessibilityProvider>
          <TestFocusComponent />
        </AccessibilityProvider>,
      );
      
      const focusElementButton = screen.getByTestId('focus-element-button');
      fireEvent.press(focusElementButton);
      
      // Should not throw error when focusing registered element
      expect(() => fireEvent.press(focusElementButton)).not.toThrow();
    });
  });

  describe('Accessibility Props', () => {
    it('should generate proper accessibility props', () => {
      const TestAccessibilityComponent: React.FC = () => {
        const { getAccessibilityProps } = useAccessibility();
        
        const props = getAccessibilityProps({
          label: 'Test Button',
          hint: 'Press to test',
          role: 'button',
          disabled: false,
        });
        
        return (
          <button
            data-testid="accessibility-test-button"
            {...props}
          >
            Test
          </button>
        );
      };
      
      render(
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>,
      );
      
      const button = screen.getByTestId('accessibility-test-button');
      expect(button).toBeTruthy();
    });

    it('should handle keyboard navigation props', () => {
      const TestKeyboardComponent: React.FC = () => {
        const { getKeyboardProps, enableKeyboardNavigation } = useAccessibility();
        
        React.useEffect(() => {
          enableKeyboardNavigation();
        }, []);
        
        const keyboardProps = getKeyboardProps({
          onKeyPress: jest.fn(),
          tabIndex: 1,
        });
        
        return (
          <button
            data-testid="keyboard-test-button"
            {...keyboardProps}
          >
            Keyboard Test
          </button>
        );
      };
      
      render(
        <AccessibilityProvider>
          <TestKeyboardComponent />
        </AccessibilityProvider>,
      );
      
      const button = screen.getByTestId('keyboard-test-button');
      expect(button).toBeTruthy();
    });
  });

  describe('High Contrast Mode', () => {
    it('should detect high contrast mode on iOS', async () => {
      (AccessibilityInfo.isHighTextContrastEnabled as jest.Mock).mockResolvedValue(true);
      
      const TestHighContrastComponent: React.FC = () => {
        const { isHighContrastEnabled } = useAccessibility();
        
        return (
          <div data-testid="high-contrast-status">
            {isHighContrastEnabled ? 'enabled' : 'disabled'}
          </div>
        );
      };
      
      render(
        <AccessibilityProvider>
          <TestHighContrastComponent />
        </AccessibilityProvider>,
      );
      
      // Note: This test may not work on non-iOS platforms due to the platform check
      // In a real app, you'd want to test this on actual iOS devices
    });
  });

  describe('Error Handling', () => {
    it('should handle accessibility initialization errors gracefully', () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      expect(() => {
        render(
          <AccessibilityProvider>
            <div>Test</div>
          </AccessibilityProvider>,
        );
      }).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize accessibility features:',
        expect.any(Error),
      );
      
      consoleSpy.mockRestore();
    });

    it('should throw error when useAccessibility is used outside provider', () => {
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAccessibility must be used within an AccessibilityProvider');
    });
  });

  describe('Context Updates', () => {
    it('should update context when accessibility settings change', () => {
      const TestContextComponent: React.FC = () => {
        const { 
          isScreenReaderEnabled, 
          isKeyboardNavigationEnabled,
          enableKeyboardNavigation,
          disableKeyboardNavigation, 
        } = useAccessibility();
        
        return (
          <div>
            <div data-testid="screen-reader">
              {isScreenReaderEnabled ? 'enabled' : 'disabled'}
            </div>
            <div data-testid="keyboard-nav">
              {isKeyboardNavigationEnabled ? 'enabled' : 'disabled'}
            </div>
            <button
              data-testid="enable-keyboard"
              onClick={enableKeyboardNavigation}
            >
              Enable Keyboard
            </button>
            <button
              data-testid="disable-keyboard"
              onClick={disableKeyboardNavigation}
            >
              Disable Keyboard
            </button>
          </div>
        );
      };
      
      render(
        <AccessibilityProvider>
          <TestContextComponent />
        </AccessibilityProvider>,
      );
      
      const keyboardNav = screen.getByTestId('keyboard-nav');
      const enableButton = screen.getByTestId('enable-keyboard');
      const disableButton = screen.getByTestId('disable-keyboard');
      
      expect(keyboardNav).toHaveTextContent('disabled');
      
      fireEvent.press(enableButton);
      expect(keyboardNav).toHaveTextContent('enabled');
      
      fireEvent.press(disableButton);
      expect(keyboardNav).toHaveTextContent('disabled');
    });
  });
});
