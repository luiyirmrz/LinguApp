import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { theme } from '@/constants/theme';

export default function IndexScreen() {
  // Use Redirect component instead of useRouter for immediate navigation
  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  text: {
    fontSize: 18,
    color: theme.colors.text,
    marginTop: 16,
  },
});
