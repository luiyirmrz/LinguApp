/**
 * Authentication Wrapper Component
 * NUCLEAR VERSION - Ultra-simplified to prevent any possible infinite loops
 */

import React, { memo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { theme } from '@/constants/theme';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, fallback }) => {
  const { isReady, error } = useUnifiedAuth();

  // Don't render children until authentication is completely initialized
  if (!isReady) {
    return fallback || (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Show error if there's an authentication error
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: theme.colors.error, textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  // Only render children when ready and no errors
  return <>{children}</>;
};

export default memo(AuthWrapper);
