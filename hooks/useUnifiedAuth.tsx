/**
 * Unified Authentication Hook for LinguApp
 * ULTRA-NUCLEAR VERSION - Replacing createContextHook with native React Context
 * This eliminates any possible conflicts with Expo Router and external libraries
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { User } from '@/types';
import { enhancedAuthService } from '@/services/auth/enhancedAuthService';
import { unifiedService } from '@/services/auth/unifiedService';

// Create service instance
const AuthService = enhancedAuthService;

// Define the context type
interface UnifiedAuthContextType {
  // States
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isReady: boolean;
  mainLanguage: string;
  targetLanguage: string;
  
  // Methods
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (name: string, email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updateUser: (userData: any) => Promise<void>;
  clearError: () => void;
  
  // OAuth methods
  signInWithGoogle: () => Promise<{ success: boolean; user: User; isNewUser?: boolean }>;
  signInWithGitHub: () => Promise<{ success: boolean; user: User; isNewUser?: boolean }>;
  signInWithApple: () => Promise<{ success: boolean; user: User; isNewUser?: boolean }>;
  
  // getSnapshot
  getSnapshot: () => User | null;
}

// Create the context with undefined default (will throw if used outside provider)
const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

// Provider component
interface UnifiedAuthProviderProps {
  children: ReactNode;
}

export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({ children }) => {
  // Estados básicos - sin dependencias externas complejas
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Efecto de inicialización - ULTRA SIMPLE
  useEffect(() => {
    if (isInitialized) return; // Guard clause absoluto

    const initialize = async () => {
      try {
        console.debug('Initializing auth with ultra-nuclear approach');
        
        // Development mode check - fastest path
        const isDevelopment = __DEV__ || 
          !process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 
          process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key_here' ||
          process.env.EXPO_PUBLIC_USE_MOCK_SERVICES === 'true';

        if (isDevelopment) {
          console.debug('Development mode: Skipping auth service calls');
          setUser(null);
          setError(null);
        } else {
          // Production: No user fetch needed for now
          console.debug('Production mode: No user fetch implemented yet');
          setUser(null);
          setError(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setError(null); // Don't propagate errors
      } finally {
        setIsLoading(false);
        setIsInitialized(true); // ALWAYS set to prevent re-runs
      }
    };

    // Use setTimeout to break out of any potential synchronous loops
    const timeoutId = setTimeout(initialize, 0);
    
    return () => clearTimeout(timeoutId);
  }, [isInitialized]); // ONLY isInitialized dependency

  // Methods - Ultra simple with no external dependencies
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await AuthService.signInWithEmail(email, password);
      setUser(user?.user || null);
      return { success: true, user };
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Sign in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []); // NO dependencies

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await AuthService.signUpWithEmail(name, email, password);
      setUser(user?.user || null);
      return { success: true, user };
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Sign up failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []); // NO dependencies

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await AuthService.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
      // Don't set error for sign out
    } finally {
      setIsLoading(false);
    }
  }, []); // NO dependencies

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await AuthService.resetPassword(email);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Password reset failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []); // NO dependencies

  const updateUser = useCallback(async (userData: any): Promise<void> => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    } catch (err) {
      console.error('User update error:', err);
      setError('User update failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Only user dependency

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helper function to handle new user creation and setup
  const handleNewUser = useCallback(async (userData: Partial<User>, provider: string) => {
    try {
      // Create new user with basic info
      const newUser: User = {
        id: `${provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email || '',
        name: userData.name || 'New User',
        // profilePicture: userData.profilePicture,
        provider: provider as 'google' | 'github' | 'apple',
        mainLanguage: { id: 'en', code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', level: 'beginner' as any }, // Default
        currentLanguage: { id: 'hr', code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', level: 'beginner' as any }, // Default
        createdAt: new Date().toISOString(),
        // updatedAt: new Date().toISOString(),
        isNewUser: true, // Flag to indicate this is a new user
      };

      setUser(newUser);
      return { success: true, user: newUser, isNewUser: true };
    } catch (error) {
      console.error('Error creating new user:', error);
      throw error;
    }
  }, []);

  // Helper function to check if user exists and handle accordingly
  const handleUserAuth = useCallback(async (userData: Partial<User>, provider: string) => {
    try {
      // In a real app, you would check your backend/database here
      // For now, we'll simulate checking if user exists
      const existingUser = await checkUserExists(userData.email || '');
      
      if (existingUser) {
        // User exists, sign them in
        setUser(existingUser);
        return { success: true, user: existingUser, isNewUser: false };
      } else {
        // User doesn't exist, create new user
        return await handleNewUser(userData, provider);
      }
    } catch (error) {
      console.error('Error in user authentication:', error);
      throw error;
    }
  }, [handleNewUser]);

  // Mock function to check if user exists (replace with real API call)
  const checkUserExists = useCallback(async (email: string): Promise<User | null> => {
    // In a real app, this would be an API call to your backend
    // For now, we'll return null to simulate new user
    return null;
  }, []);

  // OAuth methods - real implementations
  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Development mode - use mock data if OAuth not configured
      const isDevelopment = __DEV__;
      const hasOAuthConfig = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
                            process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 
                            process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
      
      console.debug('Google OAuth Debug:', {
        isDevelopment,
        hasOAuthConfig: !!hasOAuthConfig,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      });
      
      if (isDevelopment && !hasOAuthConfig) {
        // Mock Google sign in for development
        const mockUserData = {
          email: 'dev.user@gmail.com',
          name: 'Development User',
          profilePicture: 'https://via.placeholder.com/150',
        };
        
        return await handleUserAuth(mockUserData, 'google');
      }
      
      // Google OAuth configuration
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'linguapp',
        path: 'auth',
      });

      const clientId = Platform.select({
        ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });

      if (!clientId) {
        throw new Error('Google client ID not configured for this platform');
      }

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        state: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          Math.random().toString(),
          { encoding: Crypto.CryptoEncoding.HEX },
        ),
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
      });

      if (result.type === 'success') {
        // Exchange code for tokens
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            code: result.params.code,
            redirectUri,
            extraParams: {},
          },
          {
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
          },
        );

        // Get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.accessToken}`,
        );
        const googleUser = await userInfoResponse.json();

        // Handle user authentication (check if exists, create if new)
        const userData = {
          email: googleUser.email,
          name: googleUser.name,
          profilePicture: googleUser.picture,
        };

        return await handleUserAuth(userData, 'google');
      } else {
        throw new Error('Google sign in was cancelled');
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Google sign in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGitHub = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Development mode - use mock data if OAuth not configured
      const isDevelopment = __DEV__;
      const hasOAuthConfig = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID;
      
      console.debug('GitHub OAuth Debug:', {
        isDevelopment,
        hasOAuthConfig: !!hasOAuthConfig,
        clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
      });
      
      if (isDevelopment && !hasOAuthConfig) {
        // Mock GitHub sign in for development
        const mockUserData = {
          email: 'dev.user@github.com',
          name: 'GitHub Dev User',
          profilePicture: 'https://via.placeholder.com/150',
        };
        
        return await handleUserAuth(mockUserData, 'github');
      }
      
      // GitHub OAuth configuration
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'linguapp',
        path: 'auth',
      });

      const clientId = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID;

      if (!clientId) {
        throw new Error('GitHub client ID not configured');
      }

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['user:email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        state: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          Math.random().toString(),
          { encoding: Crypto.CryptoEncoding.HEX },
        ),
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      });

      if (result.type === 'success') {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET,
            code: result.params.code,
            redirect_uri: redirectUri,
          }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          throw new Error(tokenData.error_description);
        }

        // Get user info from GitHub
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });
        const githubUser = await userResponse.json();

        // Get user email (GitHub may require separate call)
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((email: any) => email.primary)?.email || githubUser.email;

        // Handle user authentication (check if exists, create if new)
        const userData = {
          email: primaryEmail,
          name: githubUser.name || githubUser.login,
          profilePicture: githubUser.avatar_url,
        };

        return await handleUserAuth(userData, 'github');
      } else {
        throw new Error('GitHub sign in was cancelled');
      }
    } catch (err) {
      console.error('GitHub sign in error:', err);
      setError('GitHub sign in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Development mode - use mock data if not on iOS
      const isDevelopment = __DEV__;
      const isWeb = Platform.OS === 'web';
      
      console.debug('Apple OAuth Debug:', {
        isDevelopment,
        isWeb,
        platform: Platform.OS,
      });
      
      if (isDevelopment && isWeb) {
        // Mock Apple sign in for development on web
        const mockUserData = {
          email: 'dev.user@privaterelay.appleid.com',
          name: 'Apple Dev User',
          profilePicture: undefined,
        };
        
        return await handleUserAuth(mockUserData, 'apple');
      }
      
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        // Decode the identity token to get user info
        // In a real app, you'd verify this token on your backend
        const { user: appleUserId, email, fullName } = credential;
        
        // Handle user authentication (check if exists, create if new)
        const userData = {
          email: email || `${appleUserId}@privaterelay.appleid.com`,
          name: fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : 'Apple User',
          profilePicture: undefined,
        };

        return await handleUserAuth(userData, 'apple');
      } else {
        throw new Error('Apple Sign-In failed to provide identity token');
      }
    } catch (err) {
      if ((err as any).code === 'ERR_REQUEST_CANCELED') {
        // User cancelled the sign-in flow
        throw new Error('Apple sign in was cancelled');
      } else {
        console.error('Apple sign in error:', err);
        setError('Apple sign in failed');
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // NO dependencies

  // Derived values - memoized with minimal dependencies
  const isAuthenticated = useMemo(() => !!user, [user]);
  const isReady = useMemo(() => !isLoading && isInitialized, [isLoading, isInitialized]);
  const mainLanguage = useMemo(() => user?.mainLanguage?.code || 'en', [user]);
  const targetLanguage = useMemo(() => user?.currentLanguage?.code || 'hr', [user]);

  // getSnapshot - ultra simple function
  const getSnapshot = useCallback(() => user, [user]);

  // Context value - memoized with ALL dependencies
  const contextValue = useMemo(() => ({
    // States
    user,
    isLoading,
    error,
    isAuthenticated,
    isInitialized,
    isReady,
    mainLanguage,
    targetLanguage,
    
    // Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUser,
    clearError,
    
    // OAuth methods
    signInWithGoogle,
    signInWithGitHub,
    signInWithApple,
    
    // getSnapshot
    getSnapshot,
  }), [
    // States
    user,
    isLoading,
    error,
    isAuthenticated,
    isInitialized,
    isReady,
    mainLanguage,
    targetLanguage,
    // Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUser,
    clearError,
    // OAuth methods
    signInWithGoogle,
    signInWithGitHub,
    signInWithApple,
    // getSnapshot
    getSnapshot,
  ]);

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

// Hook to use the context
export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

// Helper hooks - simplified versions
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, isReady } = useUnifiedAuth();
  return { isAuthenticated, isLoading, isReady };
};

export const useUserProfile = () => {
  const { user } = useUnifiedAuth();
  return user;
};

export const useUserLanguages = () => {
  const { user } = useUnifiedAuth();
  return {
    mainLanguage: user?.mainLanguage,
    targetLanguage: user?.currentLanguage,
    nativeLanguage: user?.nativeLanguage,
  };
};

// Safe auth hook - fallback version
export const useSafeAuth = () => {
  try {
    return useUnifiedAuth();
  } catch (error) {
    console.warn('useUnifiedAuth context not available:', error);
    return {
      user: null,
      isLoading: true,
      error: null,
      isInitialized: false,
      isAuthenticated: false,
      isReady: false,
      mainLanguage: 'en',
      targetLanguage: 'hr',
      signIn: async (): Promise<any> => { throw new Error('Auth not initialized'); },
      signUp: async (): Promise<any> => { throw new Error('Auth not initialized'); },
      signOut: async (): Promise<void> => { throw new Error('Auth not initialized'); },
      resetPassword: async (): Promise<any> => { throw new Error('Auth not initialized'); },
      updateUser: async (): Promise<void> => { throw new Error('Auth not initialized'); },
      clearError: (): void => {},
      signInWithGoogle: async (): Promise<any> => { throw new Error('Auth not initialized'); },
      signInWithGitHub: async (): Promise<any> => { throw new Error('Auth not initialized'); },
      signInWithApple: async (): Promise<any> => { throw new Error('Auth not initialized'); },
      getSnapshot: () => null,
    };
  }
};
