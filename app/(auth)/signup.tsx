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
import { ArrowLeft } from '@/components/icons/LucideReplacement';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { OptimizedErrorBoundary } from '@/components/PerformanceOptimized';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';

export default function SignUpScreen() {
  const router = useRouter();
  const { theme: adaptiveTheme } = useAdaptiveTheme();
  const { signUp, isLoading, error, clearError } = useUnifiedAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = useCallback(() => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.errors[0];
    }
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors[0];
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, password]);

  const handleSignUp = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      clearError();
      await signUp(name, email, password);
      router.replace('/(auth)/onboarding');
    } catch (error) {
      // Error is handled by the unified store
      console.error('Sign up error:', error);
    }
  }, [name, email, password, validateForm, signUp, clearError, router]);

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
    signUpButton: {
      marginTop: theme.spacing.md,
    },
    signInContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signInText: {
      color: adaptiveTheme.colors.textSecondary,
      fontSize: theme.fontSize.md,
    },
    signInLink: {
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of language learners</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.gray[400]}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

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
                placeholder="Create a password"
                placeholderTextColor={theme.colors.gray[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {displayError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            <Button
              title={isLoading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.signUpButton}
            />
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </OptimizedErrorBoundary>
  );
}
