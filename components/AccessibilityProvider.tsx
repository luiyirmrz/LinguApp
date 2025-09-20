/**
 * Accessibility Provider
 * Manages screen reader support, keyboard navigation, and accessibility features
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, memo } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { useI18n } from '@/hooks/useI18n';

interface AccessibilityContextType {
  // Screen reader state
  isScreenReaderEnabled: boolean;
  announceForAccessibility: (message: string) => void;
  
  // Keyboard navigation
  isKeyboardNavigationEnabled: boolean;
  enableKeyboardNavigation: () => void;
  disableKeyboardNavigation: () => void;
  
  // High contrast mode
  isHighContrastEnabled: boolean;
  toggleHighContrast: () => void;
  
  // Reduced motion
  isReducedMotionEnabled: boolean;
  toggleReducedMotion: () => void;
  
  // Font scaling
  fontScale: number;
  setFontScale: (scale: number) => void;
  
  // Focus management
  focusableElements: Map<string, () => void>;
  registerFocusableElement: (id: string, focusFn: () => void) => void;
  unregisterFocusableElement: (id: string) => void;
  focusElement: (id: string) => void;
  
  // Accessibility utilities
  getAccessibilityProps: (props: AccessibilityProps) => any;
  getKeyboardProps: (props: KeyboardProps) => any;
}

interface AccessibilityProps {
  label?: string;
  hint?: string;
  role?: string;
  value?: string;
  min?: number;
  max?: number;
  step?: number;
  selected?: boolean;
  checked?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  accessibilityElementsHidden?: boolean;
  accessibilityViewIsModal?: boolean;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityIgnoresInvertColors?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityActions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
}

interface KeyboardProps {
  onKeyPress?: (event: { key: string }) => void;
  onKeyDown?: (event: { key: string }) => void;
  onKeyUp?: (event: { key: string }) => void;
  tabIndex?: number;
  focusable?: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    console.warn('useAccessibility used outside AccessibilityProvider, returning fallback');
    // Return a fallback context to prevent crashes
    return {
      isScreenReaderEnabled: false,
      announceForAccessibility: (message: string) => console.debug('Accessibility announce:', message),
      isKeyboardNavigationEnabled: false,
      enableKeyboardNavigation: () => {},
      disableKeyboardNavigation: () => {},
      isHighContrastEnabled: false,
      toggleHighContrast: () => {},
      isReducedMotionEnabled: false,
      toggleReducedMotion: () => {},
      fontScale: 1.0,
      setFontScale: () => {},
      getAccessibilityProps: (props: any) => props,
      getKeyboardProps: (props: any) => props,
      registerFocusableElement: () => {},
      unregisterFocusableElement: () => {},
      focusElement: () => {},
    };
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // Use a try-catch to handle potential useI18n issues
  let t: (key: any) => string;
  let accessibility: (key: any) => string;
  
  try {
    const i18n = useI18n();
    t = i18n.t;
    accessibility = i18n.accessibility;
  } catch (error) {
    console.warn('useI18n not available in AccessibilityProvider, using fallbacks');
    t = (key: any) => key;
    accessibility = (key: any) => key;
  }
  
  // Screen reader state
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  
  // Keyboard navigation state
  const [isKeyboardNavigationEnabled, setIsKeyboardNavigationEnabled] = useState(false);
  
  // High contrast mode
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);
  
  // Reduced motion
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  
  // Font scaling
  const [fontScale, setFontScale] = useState(1.0);
  
  // Focus management
  const [focusableElements] = useState(new Map<string, () => void>());

  // Initialize accessibility features
  useEffect(() => {
    const initializeAccessibility = async () => {
      try {
        // Check if screen reader is enabled
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        setIsScreenReaderEnabled(screenReaderEnabled);
        
        // Listen for screen reader changes
        const screenReaderListener = AccessibilityInfo.addEventListener(
          'screenReaderChanged',
          setIsScreenReaderEnabled,
        );
        
        // Check for high contrast mode
        if (Platform.OS === 'ios') {
          const highContrastEnabled = await AccessibilityInfo.isHighTextContrastEnabled();
          setIsHighContrastEnabled(highContrastEnabled);
          
          // Note: highContrastChanged event doesn't exist, so we'll just set it once
          // const highContrastListener = AccessibilityInfo.addEventListener(
          //   'highContrastChanged',
          //   setIsHighContrastEnabled
          // );
          
          return () => {
            screenReaderListener?.remove();
            // highContrastListener?.remove();
          };
        }
        
        return () => {
          screenReaderListener?.remove();
        };
      } catch (error) {
        console.warn('Failed to initialize accessibility features:', error);
      }
    };
    
    initializeAccessibility();
  }, []);

  // Announce messages for screen readers
  const announceForAccessibility = (message: string) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  // Keyboard navigation
  const enableKeyboardNavigation = () => {
    setIsKeyboardNavigationEnabled(true);
    announceForAccessibility(accessibility('keyboardNavigationEnabled'));
  };

  const disableKeyboardNavigation = () => {
    setIsKeyboardNavigationEnabled(false);
    announceForAccessibility(accessibility('keyboardNavigationDisabled'));
  };

  // High contrast mode
  const toggleHighContrast = () => {
    setIsHighContrastEnabled(!isHighContrastEnabled);
    announceForAccessibility(
      isHighContrastEnabled 
        ? accessibility('highContrastDisabled')
        : accessibility('highContrastEnabled'),
    );
  };

  // Reduced motion
  const toggleReducedMotion = () => {
    setIsReducedMotionEnabled(!isReducedMotionEnabled);
    announceForAccessibility(
      isReducedMotionEnabled
        ? accessibility('reducedMotionDisabled')
        : accessibility('reducedMotionEnabled'),
    );
  };

  // Focus management
  const registerFocusableElement = (id: string, focusFn: () => void) => {
    focusableElements.set(id, focusFn);
  };

  const unregisterFocusableElement = (id: string) => {
    focusableElements.delete(id);
  };

  const focusElement = (id: string) => {
    const focusFn = focusableElements.get(id);
    if (focusFn) {
      focusFn();
      announceForAccessibility(`${id} focused`);
    }
  };

  // Valid React Native accessibility roles
  const VALID_ACCESSIBILITY_ROLES = [
    'none', 'button', 'link', 'search', 'image', 'keyboardkey', 'text', 'adjustable',
    'allowsDirectInteraction', 'frequentUpdates', 'startsMediaSession', 'stopsMediaSession',
    'plays', 'pause', 'stop', 'next', 'previous', 'fastForward', 'rewind', 'slider',
    'progressbar', 'tab', 'combobox', 'spinbutton', 'toolbar', 'list', 'grid', 'scrollbar',
    'spinbutton', 'complementary', 'contentinfo', 'form', 'heading', 'main', 'navigation',
    'region', 'search', 'section', 'separator', 'status', 'summary', 'tablist', 'timer',
  ];

  // Validate accessibility role
  const getValidAccessibilityRole = (role?: string): string | undefined => {
    if (!role) return undefined;
    return VALID_ACCESSIBILITY_ROLES.includes(role) ? role : 'none';
  };

  // Accessibility utilities
  const getAccessibilityProps = (props: AccessibilityProps) => {
    const {
      label,
      hint,
      role,
      value,
      min,
      max,
      step,
      selected,
      checked,
      expanded,
      disabled,
      importantForAccessibility,
      accessibilityElementsHidden,
      accessibilityViewIsModal,
      accessibilityLiveRegion,
      accessibilityIgnoresInvertColors,
      accessibilityHint,
      accessibilityLabel,
      accessibilityRole,
      accessibilityState,
      accessibilityValue,
      accessibilityActions,
      onAccessibilityAction,
      ...rest
    } = props;

    return {
      accessible: true,
      accessibilityLabel: accessibilityLabel || label || t('accessibility.defaultLabel'),
      accessibilityHint: accessibilityHint || hint,
      accessibilityRole: getValidAccessibilityRole(accessibilityRole || role),
      accessibilityValue: accessibilityValue || (value ? { text: value } : undefined),
      accessibilityState: accessibilityState || {
        disabled,
        selected,
        checked,
        expanded,
      },
      accessibilityActions: accessibilityActions || [],
      onAccessibilityAction,
      importantForAccessibility: importantForAccessibility || 'yes',
      accessibilityElementsHidden,
      accessibilityViewIsModal,
      accessibilityLiveRegion: accessibilityLiveRegion || 'polite',
      accessibilityIgnoresInvertColors,
      ...rest,
    };
  };

  // Keyboard navigation utilities
  const getKeyboardProps = (props: KeyboardProps) => {
    const { onKeyPress, onKeyDown, onKeyUp, tabIndex, focusable, ...rest } = props;

    if (!isKeyboardNavigationEnabled) {
      return rest;
    }

    return {
      focusable: focusable !== false,
      tabIndex: tabIndex || 0,
      onKeyPress,
      onKeyDown,
      onKeyUp,
      ...rest,
    };
  };

  const contextValue: AccessibilityContextType = {
    isScreenReaderEnabled,
    announceForAccessibility,
    isKeyboardNavigationEnabled,
    enableKeyboardNavigation,
    disableKeyboardNavigation,
    isHighContrastEnabled,
    toggleHighContrast,
    isReducedMotionEnabled,
    toggleReducedMotion,
    fontScale,
    setFontScale,
    focusableElements,
    registerFocusableElement,
    unregisterFocusableElement,
    focusElement,
    getAccessibilityProps,
    getKeyboardProps,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// HOC for adding accessibility to components
export const withAccessibility = <P extends object>(
  Component: React.ComponentType<P>,
  defaultAccessibilityProps: AccessibilityProps = {},
) => {
  return React.forwardRef<any, P & AccessibilityProps>((props, ref) => {
    const { getAccessibilityProps } = useAccessibility();
    const accessibilityProps = getAccessibilityProps({
      ...defaultAccessibilityProps,
      ...props,
    });

    return <Component {...props} {...accessibilityProps} ref={ref} />;
  });
};

// Hook for managing focus
export const useFocusManagement = (id: string) => {
  const { registerFocusableElement, unregisterFocusableElement, focusElement } = useAccessibility();
  const [isFocused, setIsFocused] = useState(false);

  const focus = () => {
    setIsFocused(true);
    focusElement(id);
  };

  const blur = () => {
    setIsFocused(false);
  };

  useEffect(() => {
    registerFocusableElement(id, focus);
    return () => unregisterFocusableElement(id);
  }, [id]);

  return {
    isFocused,
    focus,
    blur,
  };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = () => {
  const { isKeyboardNavigationEnabled, enableKeyboardNavigation, disableKeyboardNavigation } = useAccessibility();

  const handleKeyPress = (event: { key: string }, actions: Record<string, () => void>) => {
    if (!isKeyboardNavigationEnabled) return;

    const action = actions[event.key];
    if (action) {
      action();
    }
  };

  return {
    isKeyboardNavigationEnabled,
    enableKeyboardNavigation,
    disableKeyboardNavigation,
    handleKeyPress,
  };
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const { isScreenReaderEnabled, announceForAccessibility } = useAccessibility();

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (isScreenReaderEnabled) {
      announceForAccessibility(message);
    }
  };

  const announceError = (message: string) => {
    announce(message, 'assertive');
  };

  const announceSuccess = (message: string) => {
    announce(message, 'polite');
  };

  return {
    isScreenReaderEnabled,
    announce,
    announceError,
    announceSuccess,
  };
};


AccessibilityProvider.displayName = 'AccessibilityProvider';

export default memo(AccessibilityProvider);
