/**
 * Enhanced Authentication Service for LinguApp
 * Integrates with SecurityService to provide secure authentication
 * Includes token refresh, session management, and security monitoring
 * Replaces the basic AuthService with comprehensive security features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { auth, db } from '@/config/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { User, AuthProvider } from '@/types';
import { languages } from '@/mocks/languages';
import { firestoreService } from '../database/firestoreService';
import { securityService, SecurityEventType } from './securityService';

// Storage keys
const STORAGE_KEYS = {
  REFRESH_TOKEN: 'auth_refresh_token',
  TOKEN_EXPIRY: 'auth_token_expiry',
  USER_SESSION: 'auth_user_session',
  AUTH_STATE: 'auth_state',
  LAST_ACTIVITY: 'auth_last_activity',
};

// Token management configuration
const TOKEN_CONFIG = {
  REFRESH_THRESHOLD_MINUTES: 5,
  SESSION_TIMEOUT_MINUTES: 60,
  MAX_REFRESH_ATTEMPTS: 3,
};

// Auth state listeners
let authStateListeners: ((user: User | null) => void)[] = [];
  let tokenRefreshTimer: number | null = null;
  let sessionCheckTimer: number | null = null;

class EnhancedAuthService {
  private static instance: EnhancedAuthService;
  private isInitialized = false;
  private currentUser: User | null = null;
  private refreshAttempts = 0;
  private isRefreshing = false;
  // ULTRA-NUCLEAR: Removed authState - getSnapshot handled in hook only

  // Singleton pattern
  static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService();
    }
    return EnhancedAuthService.instance;
  }

  // Initialize the enhanced auth service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.debug('Starting enhanced auth service initialization...');
      
      // Check if we're in development mode or Firebase is not configured
      const isDevelopment = __DEV__ || !process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 
        process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key_here' ||
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID === 'your_project_id' ||
        process.env.EXPO_PUBLIC_USE_MOCK_SERVICES === 'true';

      if (isDevelopment) {
        console.debug('Running in development mode, using simplified initialization');
        this.isInitialized = true;
        return;
      }
      
      // Initialize security service with timeout
      const securityInitPromise = securityService.initialize();
      const securityTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Security service initialization timeout')), 5000),
      );
      
      await Promise.race([securityInitPromise, securityTimeout]);
      console.debug('Security service initialized');

      // Set up Firebase auth state listener
      this.setupAuthStateListener();
      console.debug('Auth state listener set up');

      // Set up session monitoring
      this.setupSessionMonitoring();
      console.debug('Session monitoring set up');

      // Set up token refresh monitoring
      this.setupTokenRefreshMonitoring();
      console.debug('Token refresh monitoring set up');

      this.isInitialized = true;
      console.debug('Enhanced auth service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize enhanced auth service:', error);
      // Mark as initialized even on error to prevent infinite loading
      this.isInitialized = true;
      throw error;
    }
  }

  // Set up Firebase auth state listener with security integration
  private setupAuthStateListener(): void {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.debug('Firebase auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        try {
          // Validate session with security service
          const sessionValidation = await securityService.validateSession();
          if (!sessionValidation.isValid) {
            console.warn('Session validation failed:', sessionValidation.error);
            await this.handleSessionExpired();
            return;
          }

          // Get or create user profile
          let user = await firestoreService.getUser(firebaseUser.uid);
          
          if (!user) {
            // Create user profile if it doesn't exist
            user = await this.createUserProfile({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              provider: this.getProviderFromFirebaseUser(firebaseUser),
              photoURL: firebaseUser.photoURL,
            });
            
            await firestoreService.createUser(user);
          }

          // Update last login
          await firestoreService.updateUser(firebaseUser.uid, {
            lastLoginAt: new Date().toISOString(),
          });

          // Create secure session
          await securityService.createSession(firebaseUser);

          this.currentUser = user;
          this.notifyAuthStateListeners(user);

          // Log successful authentication
          await securityService.logSecurityEvent({
            type: SecurityEventType.LOGIN_SUCCESS,
            userId: user.id,
            email: user.email,
            timestamp: new Date(),
            details: {
              provider: user.provider,
              sessionId: firebaseUser.uid,
            },
            severity: 'low',
          });

        } catch (error) {
          console.error('Error handling auth state change:', error);
          await this.handleAuthError(error);
          this.notifyAuthStateListeners(null);
        }
      } else {
        // User signed out
        this.currentUser = null;
        this.notifyAuthStateListeners(null);
        
        // Clear session data
        await this.clearSessionData();
      }
    });
  }

  // Set up session monitoring
  private setupSessionMonitoring(): void {
    sessionCheckTimer = setInterval(async () => {
      if (this.currentUser) {
        const sessionValidation = await securityService.validateSession();
        if (!sessionValidation.isValid) {
          console.warn('Session expired during monitoring');
          await this.handleSessionExpired();
        }
      }
    }, 60000); // Check every minute
  }

  // Set up token refresh monitoring
  private setupTokenRefreshMonitoring(): void {
    tokenRefreshTimer = setInterval(async () => {
      if (this.currentUser && auth.currentUser) {
        await this.checkAndRefreshToken();
      }
    }, 30000); // Check every 30 seconds
  }

  // Check and refresh token if needed
  private async checkAndRefreshToken(): Promise<void> {
    if (this.isRefreshing) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Check if token needs refresh
      const tokenResult = await user.getIdTokenResult();
      const expiryTime = new Date(tokenResult.expirationTime).getTime();
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      const refreshThreshold = TOKEN_CONFIG.REFRESH_THRESHOLD_MINUTES * 60 * 1000;

      if (timeUntilExpiry <= refreshThreshold) {
        this.isRefreshing = true;
        
        try {
          await user.getIdToken(true); // Force refresh
          
          await securityService.logSecurityEvent({
            type: SecurityEventType.TOKEN_REFRESH,
            userId: user.uid,
            email: user.email || '',
            timestamp: new Date(),
            details: {
              timeUntilExpiry,
              refreshThreshold,
            },
            severity: 'low',
          });

          console.debug('Token refreshed successfully');
        } catch (error) {
          console.error('Token refresh failed:', error);
          await this.handleTokenRefreshError(error);
        } finally {
          this.isRefreshing = false;
        }
      }
    } catch (error) {
      console.error('Token check failed:', error);
    }
  }

  // Secure sign in with comprehensive validation
  async secureSignIn(email: string, password: string): Promise<{
    success: boolean;
    user?: User;
    error?: string;
    securityInfo: {
      rateLimitRemaining: number;
      accountLocked: boolean;
      lockoutRemaining?: number;
      passwordStrength?: 'weak' | 'medium' | 'strong' | 'very_strong';
    };
  }> {
    await this.initialize();

    try {
      // Use security service for secure authentication
      const result = await securityService.secureSignIn(email, password);
      
      if (result.success && result.user) {
        // Get user profile from Firestore
        const userProfile = await firestoreService.getUser(result.user.uid);
        if (userProfile) {
          this.currentUser = userProfile;
          this.notifyAuthStateListeners(userProfile);
        }
      }

      return {
        success: result.success,
        user: this.currentUser || undefined,
        error: result.error,
        securityInfo: {
          rateLimitRemaining: result.securityInfo.rateLimitRemaining,
          accountLocked: result.securityInfo.accountLocked,
          lockoutRemaining: result.securityInfo.lockoutRemaining,
        },
      };
    } catch (error: any) {
      console.error('Secure sign in failed:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
        securityInfo: {
          rateLimitRemaining: 0,
          accountLocked: false,
        },
      };
    }
  }

  // Secure sign up with comprehensive validation
  async secureSignUp(name: string, email: string, password: string): Promise<{
    success: boolean;
    user?: User;
    error?: string;
    securityInfo: {
      passwordStrength: 'weak' | 'medium' | 'strong' | 'very_strong';
      passwordScore: number;
    };
  }> {
    await this.initialize();

    try {
      // Use security service for secure signup
      const result = await securityService.secureSignUp(name, email, password);
      
      if (result.success && result.user) {
        // Create user profile
        const userProfile = await this.createUserProfile({
          id: result.user.uid,
          name,
          email: email.toLowerCase(),
          provider: 'email' as AuthProvider,
          photoURL: result.user.photoURL,
        });

        // Save to Firestore
        await firestoreService.createUser(userProfile);
        
        this.currentUser = userProfile;
        this.notifyAuthStateListeners(userProfile);
      }

      return {
        success: result.success,
        user: this.currentUser || undefined,
        error: result.error,
        securityInfo: result.securityInfo,
      };
    } catch (error: any) {
      console.error('Secure sign up failed:', error);
      return {
        success: false,
        error: error.message || 'Account creation failed',
        securityInfo: {
          passwordStrength: 'weak',
          passwordScore: 0,
        },
      };
    }
  }

  // Secure sign out with cleanup
  async secureSignOut(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Log sign out event
      if (this.currentUser) {
        await securityService.logSecurityEvent({
          type: SecurityEventType.LOGIN_FAILURE, // Using this for sign out
          userId: this.currentUser.id,
          email: this.currentUser.email,
          timestamp: new Date(),
          details: { action: 'signout' },
          severity: 'low',
        });
      }

      // Sign out from Firebase
      await firebaseSignOut(auth);

      // Clear local data
      this.currentUser = null;
      await this.clearSessionData();

      // Notify listeners
      this.notifyAuthStateListeners(null);

      return { success: true };
    } catch (error: any) {
      console.error('Secure sign out failed:', error);
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  }

  // Password reset with security validation
  async securePasswordReset(email: string): Promise<{
    success: boolean;
    error?: string;
    securityInfo: {
      rateLimitRemaining: number;
    };
  }> {
    await this.initialize();

    try {
      // Validate email
      const emailValidation = securityService.validateEmail(email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          error: emailValidation.errors.join(', '),
          securityInfo: { rateLimitRemaining: 0 },
        };
      }

      // Check rate limiting
      const rateLimitCheck = await securityService.checkRateLimit(emailValidation.sanitizedValue!, 'password_reset');
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: 'Too many password reset attempts. Please try again later.',
          securityInfo: { rateLimitRemaining: 0 },
        };
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, emailValidation.sanitizedValue!);

      // Log security event
      await securityService.logSecurityEvent({
        type: SecurityEventType.PASSWORD_RESET,
        email: emailValidation.sanitizedValue!,
        timestamp: new Date(),
        details: { action: 'password_reset_requested' },
        severity: 'medium',
      });

      return {
        success: true,
        securityInfo: {
          rateLimitRemaining: rateLimitCheck.remainingAttempts,
        },
      };
    } catch (error: any) {
      console.error('Password reset failed:', error);
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        securityInfo: { rateLimitRemaining: 0 },
      };
    }
  }

  // Change password with security validation
  async changePassword(currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    error?: string;
    securityInfo: {
      passwordStrength: 'weak' | 'medium' | 'strong' | 'very_strong';
      passwordScore: number;
    };
  }> {
    if (!auth.currentUser || !this.currentUser) {
      return {
        success: false,
        error: 'No user logged in',
        securityInfo: { passwordStrength: 'weak', passwordScore: 0 },
      };
    }

    try {
      // Validate new password
      const passwordValidation = securityService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors.join(', '),
          securityInfo: {
            passwordStrength: 'medium' as const,
            passwordScore: 5,
          },
        };
      }

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        this.currentUser.email,
        currentPassword,
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      // Log security event
      await securityService.logSecurityEvent({
        type: SecurityEventType.PASSWORD_RESET,
        userId: this.currentUser.id,
        email: this.currentUser.email,
        timestamp: new Date(),
        details: {
          action: 'password_changed',
          passwordStrength: 'medium' as const,
          passwordScore: 5,
        },
        severity: 'medium',
      });

      return {
        success: true,
        securityInfo: {
          passwordStrength: 'medium' as const,
          passwordScore: 5,
        },
      };
    } catch (error: any) {
      console.error('Password change failed:', error);
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        securityInfo: { passwordStrength: 'weak', passwordScore: 0 },
      };
    }
  }

  // Auth state change listener
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    authStateListeners.push(callback);
    
    // Check if we're in development mode
    const isDevelopment = __DEV__ || !process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key_here' ||
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID === 'your_project_id' ||
      process.env.EXPO_PUBLIC_USE_MOCK_SERVICES === 'true';

    if (isDevelopment) {
      // In development mode, immediately call with null user
      setTimeout(() => {
        console.debug('Development mode: No user authenticated');
        callback(null);
      }, 100);
    }
    
    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ULTRA-NUCLEAR: Removed getSnapshot from service - handled in hook only
  // No getSnapshot method here to prevent infinite loops

  // Get security status
  async getSecurityStatus(email?: string): Promise<{
    rateLimitRemaining: number;
    accountLocked: boolean;
    lockoutRemaining?: number;
    lastSecurityEvent?: any;
  }> {
    return await securityService.getSecurityStatus(email);
  }

  // Get security log
  async getSecurityLog(limit: number = 50): Promise<any[]> {
    return await securityService.getSecurityLog(limit);
  }

  // Private helper methods
  private async createUserProfile(userData: {
    id: string;
    name: string;
    email: string;
    provider: AuthProvider;
    photoURL?: string | null;
  }): Promise<User> {
    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      photoURL: userData.photoURL || undefined,
      provider: userData.provider,
      points: 0,
      streak: 0,
      hearts: 5,
      maxHearts: 5,
      gems: 500,
      lives: 5,
      maxLives: 5,
      nativeLanguage: languages[0],
      currentLanguage: languages.find(l => l.code === 'hr') || languages[5],
      mainLanguage: languages[0],
      level: 1,
      achievements: [],
      unlockedSkills: ['1'],
      languageProgress: [],
      totalXP: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      emailVerified: false,
      preferences: {
        timezone: 'UTC',
        reminderTime: '19:00',
        weeklyGoal: 1000,
        studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        immersionMode: false,
        notificationsEnabled: true,
        soundEnabled: true,
        hapticEnabled: true,
        notifications: true,
        soundEffects: true,
        dailyReminder: true,
        theme: 'system',
        autoPlay: true,
      },
      socialConnections: {
        friends: [],
        following: [],
        followers: [],
      },
      statistics: {
        totalLessonsCompleted: 0,
        totalTimeSpent: 0,
        averageAccuracy: 0,
        longestStreak: 0,
        wordsLearned: 0,
      },
      weeklyXP: 0,
      longestStreak: 0,
      totalLessonsCompleted: 0,
      coins: 100,
    };

    return user;
  }

  private getProviderFromFirebaseUser(firebaseUser: FirebaseUser): AuthProvider {
    const providerId = firebaseUser.providerData[0]?.providerId;
    switch (providerId) {
      case 'google.com':
        return 'google';
      case 'github.com':
        return 'github';
      case 'apple.com':
        return 'apple';
      default:
        return 'email';
    }
  }

  private notifyAuthStateListeners(user: User | null): void {
    // Cache the user to prevent infinite loops
    const cachedUser = user;
    
    // ULTRA-NUCLEAR: No authState updates - getSnapshot handled in hook
    
    authStateListeners.forEach(listener => listener(cachedUser));
  }

  private async clearSessionData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.TOKEN_EXPIRY,
        STORAGE_KEYS.USER_SESSION,
        STORAGE_KEYS.AUTH_STATE,
        STORAGE_KEYS.LAST_ACTIVITY,
      ]);
    } catch (error) {
      console.error('Failed to clear session data:', error);
    }
  }

  private async handleSessionExpired(): Promise<void> {
    console.warn('Session expired, signing out user');
    
    await securityService.logSecurityEvent({
      type: SecurityEventType.SESSION_EXPIRED,
      userId: this.currentUser?.id,
      email: this.currentUser?.email,
      timestamp: new Date(),
      details: { action: 'auto_signout' },
      severity: 'medium',
    });

    await this.secureSignOut();
  }

  private async handleTokenRefreshError(error: any): Promise<void> {
    console.error('Token refresh error:', error);
    
    await securityService.logSecurityEvent({
      type: SecurityEventType.SESSION_EXPIRED,
      userId: this.currentUser?.id,
      email: this.currentUser?.email,
      timestamp: new Date(),
      details: { 
        action: 'token_refresh_failed',
        error: error.message, 
      },
      severity: 'high',
    });

    // If token refresh fails multiple times, sign out
    this.refreshAttempts++;
    if (this.refreshAttempts >= TOKEN_CONFIG.MAX_REFRESH_ATTEMPTS) {
      await this.handleSessionExpired();
    }
  }

  private async handleAuthError(error: any): Promise<void> {
    console.error('Auth error:', error);
    
    await securityService.logSecurityEvent({
      type: SecurityEventType.LOGIN_FAILURE,
      userId: this.currentUser?.id,
      email: this.currentUser?.email,
      timestamp: new Date(),
      details: { 
        action: 'auth_error',
        error: error.message, 
      },
      severity: 'medium',
    });
  }

  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed. Please contact support.';
      case 'auth/requires-recent-login':
        return 'This operation requires recent authentication. Please sign in again.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  }

  // Cleanup method
  cleanup(): void {
    if (tokenRefreshTimer) {
      clearInterval(tokenRefreshTimer);
      tokenRefreshTimer = null;
    }
    if (sessionCheckTimer) {
      clearInterval(sessionCheckTimer);
      sessionCheckTimer = null;
    }
    authStateListeners = [];
  }

  // Additional methods for compatibility
  async signInWithEmail(email: string, password: string) {
    return this.secureSignIn(email, password);
  }

  async signUpWithEmail(name: string, email: string, password: string) {
    return this.secureSignUp(name, email, password);
  }

  async signOut() {
    return this.secureSignOut();
  }

  async signInWithGoogle() {
    // Mock implementation
    return {
      success: true,
      user: null,
      error: undefined,
      securityInfo: {
        rateLimitRemaining: 10,
        accountLocked: false,
        lockoutRemaining: undefined,
        passwordStrength: 'medium' as const,
        passwordScore: 5,
      }
    };
  }

  async signInWithGitHub() {
    // Mock implementation
    return {
      success: true,
      user: null,
      error: undefined,
      securityInfo: {
        rateLimitRemaining: 10,
        accountLocked: false,
        lockoutRemaining: undefined,
        passwordStrength: 'medium' as const,
        passwordScore: 5,
      }
    };
  }

  async signInWithApple() {
    // Mock implementation
    return {
      success: true,
      user: null,
      error: undefined,
      securityInfo: {
        rateLimitRemaining: 10,
        accountLocked: false,
        lockoutRemaining: undefined,
        passwordStrength: 'medium' as const,
        passwordScore: 5,
      }
    };
  }

  async resetPassword(email: string) {
    return this.securePasswordReset(email);
  }
}

// Export singleton instance
export const enhancedAuthService = EnhancedAuthService.getInstance();
export default enhancedAuthService;
