import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';
import { theme } from '@/constants/theme';
import { ArrowLeft, Mail, Github, Apple } from '@/components/icons/LucideReplacement';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { OptimizedErrorBoundary } from '@/components/PerformanceOptimized';
import { validateEmail } from '@/utils/validation';

export default function SignInScreen() {
  const router = useRouter();
  const { theme: adaptiveTheme } = useAdaptiveTheme();
  const { user, signIn, signOut, signUp, resetPassword, updateUser, error, clearError, isLoading } = useUnifiedAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Mock social sign-in functions
  const signInWithGoogle = async () => {
    // Mock implementation
    return { success: true, user: null };
  };

  const signInWithGitHub = async () => {
    // Mock implementation
    return { success: true, user: null };
  };

  const signInWithApple = async () => {
    // Mock implementation
    return { success: true, user: null };
  };

  const validateForm = useCallback(() => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors[0];
    }
    
    // Basic password validation for signin
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleSignIn = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      clearError();
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (error) {
      // Error is handled by the unified store
      console.error('Sign in error:', error);
    }
  }, [email, password, validateForm, signIn, clearError, router]);

  const handleSocialSignIn = useCallback(async (provider: string) => {
    setSocialLoading(provider);
    try {
      clearError();
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'github':
          result = await signInWithGitHub();
          break;
        case 'apple':
          result = await signInWithApple();
          break;
        default:
          throw new Error('Unsupported provider');
      }
      if (result) {
        // Check if this is a new user
        if (result && 'isNewUser' in result && result.isNewUser) {
          // Navigate to onboarding setup for new users
          router.replace('/onboarding-setup');
        } else {
          // Navigate to main app for existing users
          router.replace('/(tabs)/home');
        }
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      // Error is handled by the auth hook
    } finally {
      setSocialLoading(null);
    }
  }, [signInWithGoogle, signInWithGitHub, signInWithApple, clearError, router]);

  const displayError = useMemo(() => error || Object.values(errors)[0], [error, errors]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: adaptiveTheme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: theme.spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      marginTop: theme.spacing.lg,
    },
    backButton: {
      position: 'absolute',
      left: 0,
      top: 0,
      padding: theme.spacing.sm,
    },
    title: {
      fontSize: theme.fontSize.xxl,
      fontWeight: 'bold',
      color: adaptiveTheme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.fontSize.md,
      color: adaptiveTheme.colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      marginBottom: theme.spacing.xl,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: adaptiveTheme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: adaptiveTheme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: adaptiveTheme.colors.text,
      backgroundColor: adaptiveTheme.colors.surface,
    },
    inputError: {
      borderColor: adaptiveTheme.colors.error,
    },
    errorText: {
      color: adaptiveTheme.colors.error,
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xs,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.lg,
    },
    forgotPasswordText: {
      color: adaptiveTheme.colors.primary,
      fontSize: theme.fontSize.sm,
    },
    signInButton: {
      marginTop: theme.spacing.md,
    },
    socialContainer: {
      marginBottom: theme.spacing.xl,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      marginHorizontal: theme.spacing.md,
      color: adaptiveTheme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
    },
    socialButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    socialButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.xs,
      borderWidth: 1,
      borderColor: adaptiveTheme.colors.border,
      borderRadius: theme.borderRadius.md,
      backgroundColor: adaptiveTheme.colors.surface,
    },
    socialButtonLoading: {
      opacity: 0.6,
    },
    socialButtonText: {
      marginLeft: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
      color: adaptiveTheme.colors.text,
    },
    signUpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signUpText: {
      color: adaptiveTheme.colors.textSecondary,
      fontSize: theme.fontSize.md,
    },
    signUpLink: {
      color: adaptiveTheme.colors.primary,
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    errorContainer: {
      backgroundColor: adaptiveTheme.colors.errorLight || '#fee',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: adaptiveTheme.colors.error,
    },
  });

  return (
    <OptimizedErrorBoundary>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={adaptiveTheme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.gray[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => Alert.alert('Forgot Password', 'Password reset functionality will be available soon.')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {displayError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            <Button
              title={isLoading ? 'Signing In...' : 'Sign In'}
              onPress={handleSignIn}
              loading={isLoading}
              style={styles.signInButton}
            />
          </View>

          {/* Social Sign In */}
          <View style={styles.socialContainer}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[styles.socialButton, socialLoading === 'google' && styles.socialButtonLoading]}
                onPress={() => handleSocialSignIn('google')}
                disabled={socialLoading !== null}
              >
                <Mail size={20} color={adaptiveTheme.colors.text} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, socialLoading === 'github' && styles.socialButtonLoading]}
                onPress={() => handleSocialSignIn('github')}
                disabled={socialLoading !== null}
              >
                <Github size={20} color={adaptiveTheme.colors.text} />
                <Text style={styles.socialButtonText}>GitHub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, socialLoading === 'apple' && styles.socialButtonLoading]}
                onPress={() => handleSocialSignIn('apple')}
                disabled={socialLoading !== null}
              >
                <Apple size={20} color={adaptiveTheme.colors.text} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </OptimizedErrorBoundary>
  );
}
