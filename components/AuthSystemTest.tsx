/**
 * Authentication System Test Component
 * Tests the unified authentication system and error handling
 */

import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useMultilingualLearning } from '@/hooks/useMultilingualLearning';
import { theme } from '@/constants/theme';

export const AuthSystemTest: React.FC = () => {
  const [email, setEmail] = useState(process.env.EXPO_PUBLIC_TEST_EMAIL_1 || 'test@localhost.dev');
  const [password, setPassword] = useState(process.env.EXPO_PUBLIC_TEST_PASSWORD_1 || 'TestPass123!');
  const [name, setName] = useState('Test User');
  
  // Test all hooks
  const auth = useUnifiedAuth();
  const language = useLanguage();
  const learning = useMultilingualLearning();

  const testSignIn = async () => {
    try {
      await auth.signIn(email, password);
      Alert.alert('Success', 'Sign in test completed');
    } catch (error) {
      Alert.alert('Error', `Sign in failed: ${error}`);
    }
  };

  const testSignUp = async () => {
    try {
      await auth.signUp(name, email, password);
      Alert.alert('Success', 'Sign up test completed');
    } catch (error) {
      Alert.alert('Error', `Sign up failed: ${error}`);
    }
  };

  const testSignOut = async () => {
    try {
      await auth.signOut();
      Alert.alert('Success', 'Sign out test completed');
    } catch (error) {
      Alert.alert('Error', `Sign out failed: ${error}`);
    }
  };

  const testLanguageChange = async () => {
    try {
      const newLanguage = language.availableLanguages.find(l => l.code === 'es') || language.availableLanguages[0];
      await language.changeUILanguage(newLanguage);
      Alert.alert('Success', 'Language change test completed');
    } catch (error) {
      Alert.alert('Error', `Language change failed: ${error}`);
    }
  };

  const testLearningSystem = async () => {
    try {
      const stats = learning.getLanguageStats();
      Alert.alert('Success', `Learning system test completed. Stats: ${JSON.stringify(stats)}`);
    } catch (error) {
      Alert.alert('Error', `Learning system test failed: ${error}`);
    }
  };

  const testErrorBoundary = () => {
    // This will trigger an error boundary
    throw new Error('Test error for error boundary');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title as any}>Authentication System Test</Text>
      
      {/* Auth Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle as any}>Authentication Status</Text>
        <Text>User: {auth.user ? auth.user.name : 'Not logged in'}</Text>
        <Text>Loading: {auth.isLoading ? 'Yes' : 'No'}</Text>
        <Text>Error: {auth.error || 'None'}</Text>
        <Text>Authenticated: {auth.isAuthenticated ? 'Yes' : 'No'}</Text>
        <Text>Initialized: {auth.isInitialized ? 'Yes' : 'No'}</Text>
      </View>

      {/* Language Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle as any}>Language Status</Text>
        <Text>Current Language: {language.currentUILanguage?.name || 'Unknown'}</Text>
        <Text>Loading: {language.isLoading ? 'Yes' : 'No'}</Text>
        <Text>Error: {language.error || 'None'}</Text>
      </View>

      {/* Learning Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle as any}>Learning Status</Text>
        <Text>Loading: {learning.isLoading ? 'Yes' : 'No'}</Text>
        <Text>Skills: {learning.availableSkills?.length || 0}</Text>
        <Text>Lessons: {learning.availableLessons?.length || 0}</Text>
      </View>

      {/* Test Inputs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Inputs</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle as any}>Test Actions</Text>
        <TouchableOpacity style={styles.button} onPress={testSignIn}>
          <Text style={styles.buttonText}>Test Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testSignUp}>
          <Text style={styles.buttonText}>Test Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testSignOut}>
          <Text style={styles.buttonText}>Test Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testLanguageChange}>
          <Text style={styles.buttonText}>Test Language Change</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testLearningSystem}>
          <Text style={styles.buttonText}>Test Learning System</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={testErrorBoundary}>
          <Text style={styles.buttonText}>Test Error Boundary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  errorButton: {
    backgroundColor: theme.colors.error,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
});

export default memo(AuthSystemTest);




AuthSystemTest.displayName = 'AuthSystemTest';
