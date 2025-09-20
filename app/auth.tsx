import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signInWithGoogle, signInWithGitHub, signInWithApple } = useUnifiedAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have OAuth parameters
        const { code, state, error } = params;

        if (error) {
          console.error('OAuth error:', error);
          router.replace('/(auth)/signin');
          return;
        }

        if (code && state) {
          // This is a successful OAuth callback
          // The OAuth flow should have already been handled by the auth hooks
          // We just need to redirect to the appropriate screen
          
          // Check if user is authenticated
          // If not, redirect to signin
          router.replace('/(auth)/signin');
        } else {
          // No OAuth parameters, redirect to signin
          router.replace('/(auth)/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/(auth)/signin');
      }
    };

    handleAuthCallback();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.text}>Processing authentication...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
});
