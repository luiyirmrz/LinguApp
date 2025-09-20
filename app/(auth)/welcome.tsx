import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🌟</Text>
            <Text style={styles.appName}>LinguApp</Text>
            <Text style={styles.tagline}>Master languages with fun!</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              title="Sign In"
              onPress={() => router.push('/(auth)/signin')}
              size="large"
              variant="secondary"
              style={styles.button}
            />
            <Button
              title="Sign Up"
              onPress={() => router.push('/(auth)/signup')}
              size="large"
              style={styles.button}
            />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  appName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold' as const,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  button: {
    width: '100%',
  },
});
