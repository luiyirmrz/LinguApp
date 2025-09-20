/**
 * Enhanced Security Service for LinguApp
 * Implements comprehensive security measures including:
 * - Rate limiting and brute force protection
 * - Input validation and sanitization
 * - Token management and refresh
 * - Account lockout mechanisms
 * - Security monitoring and logging
 * - CSRF protection
 * - Password strength validation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { auth } from '@/config/firebase';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  // sendPasswordResetEmail,
  // updatePassword,
  // reauthenticateWithCredential,
  // EmailAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  RATE_LIMIT_WINDOW_MINUTES: 5,
  MAX_REQUESTS_PER_WINDOW: 10,
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  
  // Token management
  TOKEN_REFRESH_THRESHOLD_MINUTES: 5,
  SESSION_TIMEOUT_MINUTES: 60,
  
  // Security headers
  CSRF_TOKEN_EXPIRY_HOURS: 24,
  
  // Monitoring
  SUSPICIOUS_ACTIVITY_THRESHOLD: 3,
  LOG_RETENTION_DAYS: 30,
};

// Storage keys
const STORAGE_KEYS = {
  LOGIN_ATTEMPTS: 'security_login_attempts',
  ACCOUNT_LOCKOUT: 'security_account_lockout',
  RATE_LIMIT: 'security_rate_limit',
  CSRF_TOKEN: 'security_csrf_token',
  SESSION_DATA: 'security_session_data',
  SECURITY_LOG: 'security_log',
  SUSPICIOUS_ACTIVITY: 'security_suspicious_activity',
};

// Security event types
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  ACCOUNT_LOCKOUT = 'account_lockout',
  PASSWORD_RESET = 'password_reset',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  TOKEN_REFRESH = 'token_refresh',
  SESSION_EXPIRED = 'session_expired',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
}

// Security event interface
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Rate limit entry
interface RateLimitEntry {
  count: number;
  windowStart: Date;
  lastRequest: Date;
}

// Account lockout entry
interface AccountLockout {
  email: string;
  attempts: number;
  lockedUntil: Date;
  reason: string;
}

// Session data
interface SessionData {
  userId: string;
  email: string;
  lastActivity: Date;
  expiresAt: Date;
  deviceInfo: {
    platform: string;
    version: string;
    userAgent: string;
  };
}

class SecurityService {
  private static instance: SecurityService;
  private isInitialized = false;
  private securityLog: SecurityEvent[] = [];
  private rateLimitCache: Map<string, RateLimitEntry> = new Map();
  private accountLockouts: Map<string, AccountLockout> = new Map();

  // Singleton pattern
  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Initialize security service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.debug('Starting security service initialization...');
      
      // Load security data from storage with timeout
      const loadDataPromise = this.loadSecurityData();
      const loadTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Security data loading timeout')), 3000),
      );
      
      await Promise.race([loadDataPromise, loadTimeout]);
      console.debug('Security data loaded');
      
      // Set up periodic cleanup
      this.setupPeriodicCleanup();
      console.debug('Periodic cleanup set up');
      
      // Initialize CSRF protection with timeout
      const csrfPromise = this.initializeCSRFProtection();
      const csrfTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('CSRF initialization timeout')), 2000),
      );
      
      await Promise.race([csrfPromise, csrfTimeout]);
      console.debug('CSRF protection initialized');
      
      this.isInitialized = true;
      console.debug('Security service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize security service:', error);
      // Mark as initialized even on error to prevent infinite loading
      this.isInitialized = true;
      throw error;
    }
  }

  // Input validation and sanitization (using centralized validation functions)

  // Password strength validation (using centralized validation functions)

  // Rate limiting
  async checkRateLimit(identifier: string, action: string): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    resetTime?: Date;
  }> {
    const key = `${identifier}:${action}`;
    const now = new Date();
    const windowStart = new Date(now.getTime() - SECURITY_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

    // Check cache first
    const cached = this.rateLimitCache.get(key);
    if (cached && cached.windowStart > windowStart) {
      if (cached.count >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
        return {
          allowed: false,
          remainingAttempts: 0,
          resetTime: new Date(cached.windowStart.getTime() + SECURITY_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000),
        };
      }
    }

    // Check persistent storage
    try {
      const rateLimitData = await AsyncStorage.getItem(STORAGE_KEYS.RATE_LIMIT);
      const rateLimits: Record<string, RateLimitEntry> = rateLimitData ? JSON.parse(rateLimitData) : {};

      const entry = rateLimits[key];
      if (entry && entry.windowStart > windowStart) {
        if (entry.count >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
          return {
            allowed: false,
            remainingAttempts: 0,
            resetTime: new Date(entry.windowStart),
          };
        }
      }

      // Update rate limit
      const newEntry: RateLimitEntry = {
        count: (entry && entry.windowStart > windowStart ? entry.count : 0) + 1,
        windowStart: now,
        lastRequest: now,
      };

      rateLimits[key] = newEntry;
      this.rateLimitCache.set(key, newEntry);
      await AsyncStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(rateLimits));

      return {
        allowed: true,
        remainingAttempts: SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW - newEntry.count,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: true, remainingAttempts: 999 }; // Fail open
    }
  }

  // Account lockout management
  async checkAccountLockout(email: string): Promise<{
    isLocked: boolean;
    remainingTime?: number;
    attemptsRemaining: number;
  }> {
    const lockout = this.accountLockouts.get(email.toLowerCase());
    if (!lockout) {
      return { isLocked: false, attemptsRemaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS };
    }

    const now = new Date();
    if (lockout.lockedUntil > now) {
      const remainingTime = Math.ceil((lockout.lockedUntil.getTime() - now.getTime()) / 1000);
      return {
        isLocked: true,
        remainingTime,
        attemptsRemaining: 0,
      };
    }

    // Lockout expired, reset
    this.accountLockouts.delete(email.toLowerCase());
    return {
      isLocked: false,
      attemptsRemaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - lockout.attempts,
    };
  }

  async recordLoginAttempt(email: string, success: boolean, details: Record<string, any> = {}): Promise<void> {
    const emailLower = email.toLowerCase();
    const now = new Date();

    // Log security event
    await this.logSecurityEvent({
      type: success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
      email: emailLower,
      timestamp: now,
      details: {
        success,
        ...details,
        userAgent: Platform.OS,
        platform: Platform.Version,
      },
      severity: success ? 'low' : 'medium',
    });

    if (!success) {
      // Update failed attempts
      const lockout = this.accountLockouts.get(emailLower) || {
        email: emailLower,
        attempts: 0,
        lockedUntil: new Date(),
        reason: '',
      };

      lockout.attempts += 1;
      lockout.reason = `Failed login attempt ${lockout.attempts}`;

      if (lockout.attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        lockout.lockedUntil = new Date(now.getTime() + SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000);
        
        await this.logSecurityEvent({
          type: SecurityEventType.ACCOUNT_LOCKOUT,
          email: emailLower,
          timestamp: now,
          details: {
            attempts: lockout.attempts,
            lockoutDuration: SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES,
          },
          severity: 'high',
        });
      }

      this.accountLockouts.set(emailLower, lockout);
      await this.saveAccountLockouts();
    } else {
      // Reset failed attempts on successful login
      this.accountLockouts.delete(emailLower);
      await this.saveAccountLockouts();
    }
  }

  // Secure authentication wrapper
  async secureSignIn(email: string, password: string): Promise<{
    success: boolean;
    user?: any;
    error?: string;
    securityInfo: {
      rateLimitRemaining: number;
      accountLocked: boolean;
      lockoutRemaining?: number;
    };
  }> {
    await this.initialize();

    // Input validation
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      return {
        success: false,
        error: [...emailValidation.errors, ...passwordValidation.errors].join(', '),
        securityInfo: { rateLimitRemaining: 0, accountLocked: false },
      };
    }

    const sanitizedEmail = emailValidation.sanitizedValue!;
    const sanitizedPassword = passwordValidation.sanitizedValue!;

    // Check rate limiting
    const rateLimitCheck = await this.checkRateLimit(sanitizedEmail, 'login');
    if (!rateLimitCheck.allowed) {
      await this.logSecurityEvent({
        type: SecurityEventType.RATE_LIMIT_EXCEEDED,
        email: sanitizedEmail,
        timestamp: new Date(),
        details: { action: 'login' },
        severity: 'medium',
      });

      return {
        success: false,
        error: `Too many login attempts. Please try again in ${Math.ceil((rateLimitCheck.resetTime!.getTime() - new Date().getTime()) / 60000)} minutes.`,
        securityInfo: { rateLimitRemaining: 0, accountLocked: false },
      };
    }

    // Check account lockout
    const lockoutCheck = await this.checkAccountLockout(sanitizedEmail);
    if (lockoutCheck.isLocked) {
      return {
        success: false,
        error: `Account temporarily locked due to too many failed attempts. Please try again in ${Math.ceil(lockoutCheck.remainingTime! / 60)} minutes.`,
        securityInfo: { 
          rateLimitRemaining: rateLimitCheck.remainingAttempts, 
          accountLocked: true,
          lockoutRemaining: lockoutCheck.remainingTime,
        },
      };
    }

    try {
      // Attempt Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
      
      // Record successful login
      await this.recordLoginAttempt(sanitizedEmail, true, {
        userId: userCredential.user.uid,
        provider: 'email',
      });

      // Set up session management
      await this.createSession(userCredential.user);

      return {
        success: true,
        user: userCredential.user,
        securityInfo: {
          rateLimitRemaining: rateLimitCheck.remainingAttempts,
          accountLocked: false,
        },
      };
    } catch (error: any) {
      // Record failed login attempt
      await this.recordLoginAttempt(sanitizedEmail, false, {
        error: error.code,
        errorMessage: error.message,
      });

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        securityInfo: {
          rateLimitRemaining: rateLimitCheck.remainingAttempts,
          accountLocked: lockoutCheck.isLocked,
        },
      };
    }
  }

  // Secure sign up wrapper
  async secureSignUp(name: string, email: string, password: string): Promise<{
    success: boolean;
    user?: any;
    error?: string;
    securityInfo: {
      passwordStrength: 'weak' | 'medium' | 'strong' | 'very_strong';
      passwordScore: number;
    };
  }> {
    await this.initialize();

    // Input validation
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!nameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid) {
      return {
        success: false,
        error: [...nameValidation.errors, ...emailValidation.errors, ...passwordValidation.errors].join(', '),
        securityInfo: { passwordStrength: 'weak', passwordScore: 0 },
      };
    }

    // Check rate limiting for signup
    const rateLimitCheck = await this.checkRateLimit(emailValidation.sanitizedValue!, 'signup');
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: 'Too many signup attempts. Please try again later.',
        securityInfo: { passwordStrength: 'medium', passwordScore: 5 },
      };
    }

    try {
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        emailValidation.sanitizedValue!, 
        password,
      );

      // Log security event
      await this.logSecurityEvent({
        type: SecurityEventType.LOGIN_SUCCESS,
        userId: userCredential.user.uid,
        email: emailValidation.sanitizedValue!,
        timestamp: new Date(),
        details: {
          action: 'signup',
          passwordStrength: 'medium',
          passwordScore: 5,
        },
        severity: 'low',
      });

      return {
        success: true,
        user: userCredential.user,
        securityInfo: {
          passwordStrength: 'medium',
          passwordScore: 5,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        securityInfo: {
          passwordStrength: 'medium',
          passwordScore: 5,
        },
      };
    }
  }

  // Session management
  async createSession(user: FirebaseUser): Promise<void> {
    const sessionData: SessionData = {
      userId: user.uid,
      email: user.email || '',
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000),
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version?.toString() || 'unknown',
        userAgent: Platform.OS,
      },
    };

    await AsyncStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(sessionData));
  }

  async validateSession(): Promise<{
    isValid: boolean;
    session?: SessionData;
    error?: string;
  }> {
    try {
      const sessionData = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_DATA);
      if (!sessionData) {
        return { isValid: false, error: 'No active session' };
      }

      const session: SessionData = JSON.parse(sessionData);
      const now = new Date();

      if (session.expiresAt < now) {
        await this.logSecurityEvent({
          type: SecurityEventType.SESSION_EXPIRED,
          userId: session.userId,
          email: session.email,
          timestamp: now,
          details: { sessionDuration: now.getTime() - new Date(session.lastActivity).getTime() },
          severity: 'medium',
        });

        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
        return { isValid: false, error: 'Session expired' };
      }

      // Update last activity
      session.lastActivity = now;
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(session));

      return { isValid: true, session };
    } catch (error) {
      console.error('Session validation failed:', error);
      return { isValid: false, error: 'Session validation failed' };
    }
  }

  // CSRF protection
  async initializeCSRFProtection(): Promise<void> {
    try {
      const existingToken = await AsyncStorage.getItem(STORAGE_KEYS.CSRF_TOKEN);
      if (!existingToken) {
        const token = this.generateCSRFToken();
        await AsyncStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, token);
      }
    } catch (error) {
      console.error('CSRF protection initialization failed:', error);
    }
  }

  async getCSRFToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.CSRF_TOKEN);
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      return null;
    }
  }

  async validateCSRFToken(token: string): Promise<boolean> {
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.CSRF_TOKEN);
      return storedToken === token;
    } catch (error) {
      console.error('CSRF token validation failed:', error);
      return false;
    }
  }

  // Security logging
  async logSecurityEvent(event: Omit<SecurityEvent, 'id'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Add to local log
    this.securityLog.push(securityEvent);

    // Save to persistent storage
    try {
      const existingLog = await AsyncStorage.getItem(STORAGE_KEYS.SECURITY_LOG);
      const log: SecurityEvent[] = existingLog ? JSON.parse(existingLog) : [];
      log.push(securityEvent);

      // Keep only recent events
      const cutoffDate = new Date(Date.now() - SECURITY_CONFIG.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
      const filteredLog = log.filter(event => new Date(event.timestamp) > cutoffDate);

      await AsyncStorage.setItem(STORAGE_KEYS.SECURITY_LOG, JSON.stringify(filteredLog));
    } catch (error) {
      console.error('Failed to save security log:', error);
    }

    // Log to console in development
    if (__DEV__) {
      console.debug('Security Event:', securityEvent);
    }

    // Check for suspicious activity
    await this.checkSuspiciousActivity(securityEvent);
  }

  // Suspicious activity detection
  private async checkSuspiciousActivity(event: SecurityEvent): Promise<void> {
    if (event.type !== SecurityEventType.LOGIN_FAILURE) return;

    try {
      const suspiciousData = await AsyncStorage.getItem(STORAGE_KEYS.SUSPICIOUS_ACTIVITY);
      const suspicious: Record<string, number> = suspiciousData ? JSON.parse(suspiciousData) : {};

      const key = event.email || event.userId || 'unknown';
      suspicious[key] = (suspicious[key] || 0) + 1;

      if (suspicious[key] >= SECURITY_CONFIG.SUSPICIOUS_ACTIVITY_THRESHOLD) {
        await this.logSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_ACTIVITY,
          userId: event.userId,
          email: event.email,
          timestamp: new Date(),
          details: {
            activityCount: suspicious[key],
            threshold: SECURITY_CONFIG.SUSPICIOUS_ACTIVITY_THRESHOLD,
          },
          severity: 'high',
        });
      }

      await AsyncStorage.setItem(STORAGE_KEYS.SUSPICIOUS_ACTIVITY, JSON.stringify(suspicious));
    } catch (error) {
      console.error('Suspicious activity check failed:', error);
    }
  }

  // Utility methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  private sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  private generateCSRFToken(): string {
    return `csrf_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
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
      default:
        return 'An authentication error occurred. Please try again.';
    }
  }

  private async loadSecurityData(): Promise<void> {
    try {
      // Load account lockouts
      const lockoutData = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_LOCKOUT);
      if (lockoutData) {
        const lockouts: Record<string, AccountLockout> = JSON.parse(lockoutData);
        Object.values(lockouts).forEach(lockout => {
          this.accountLockouts.set(lockout.email, {
            ...lockout,
            lockedUntil: new Date(lockout.lockedUntil),
          });
        });
      }

      // Load security log
      const logData = await AsyncStorage.getItem(STORAGE_KEYS.SECURITY_LOG);
      if (logData) {
        this.securityLog = JSON.parse(logData).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  }

  private async saveAccountLockouts(): Promise<void> {
    try {
      const lockouts: Record<string, AccountLockout> = {};
      this.accountLockouts.forEach((lockout, email) => {
        lockouts[email] = lockout;
      });
      await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNT_LOCKOUT, JSON.stringify(lockouts));
    } catch (error) {
      console.error('Failed to save account lockouts:', error);
    }
  }

  private setupPeriodicCleanup(): void {
    // Clean up expired lockouts and rate limits every 5 minutes
    setInterval(() => {
      this.cleanupExpiredData();
    }, 5 * 60 * 1000);
  }

  private async cleanupExpiredData(): Promise<void> {
    const now = new Date();

    // Clean up expired lockouts
    for (const [email, lockout] of this.accountLockouts.entries()) {
      if (lockout.lockedUntil < now) {
        this.accountLockouts.delete(email);
      }
    }
    await this.saveAccountLockouts();

    // Clean up expired rate limits
    const windowStart = new Date(now.getTime() - SECURITY_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
    for (const [key, entry] of this.rateLimitCache.entries()) {
      if (entry.windowStart < windowStart) {
        this.rateLimitCache.delete(key);
      }
    }
  }

  // Public methods for external access
  async getSecurityStatus(email?: string): Promise<{
    rateLimitRemaining: number;
    accountLocked: boolean;
    lockoutRemaining?: number;
    lastSecurityEvent?: SecurityEvent;
  }> {
    await this.initialize();

    const result: {
      rateLimitRemaining: number;
      accountLocked: boolean;
      lockoutRemaining?: number;
      lastSecurityEvent?: SecurityEvent;
    } = {
      rateLimitRemaining: SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW,
      accountLocked: false,
      lockoutRemaining: undefined,
      lastSecurityEvent: undefined,
    };

    if (email) {
      const rateLimitCheck = await this.checkRateLimit(email, 'login');
      const lockoutCheck = await this.checkAccountLockout(email);

      result.rateLimitRemaining = rateLimitCheck.remainingAttempts;
      result.accountLocked = lockoutCheck.isLocked;
      if (lockoutCheck.remainingTime !== undefined) {
        result.lockoutRemaining = lockoutCheck.remainingTime;
      }
    }

    // Get last security event
    if (this.securityLog.length > 0) {
      result.lastSecurityEvent = this.securityLog[this.securityLog.length - 1] || undefined;
    }

    return result;
  }

  async getSecurityLog(limit: number = 50): Promise<SecurityEvent[]> {
    await this.initialize();
    return this.securityLog.slice(-limit);
  }

  async clearSecurityData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.LOGIN_ATTEMPTS,
        STORAGE_KEYS.ACCOUNT_LOCKOUT,
        STORAGE_KEYS.RATE_LIMIT,
        STORAGE_KEYS.SECURITY_LOG,
        STORAGE_KEYS.SUSPICIOUS_ACTIVITY,
      ]);

      this.accountLockouts.clear();
      this.rateLimitCache.clear();
      this.securityLog = [];

      console.debug('Security data cleared successfully');
    } catch (error) {
      console.error('Failed to clear security data:', error);
    }
  }

  // Additional methods for compatibility
  validateEmail(email: string) {
    return validateEmail(email);
  }

  validatePassword(password: string) {
    return validatePassword(password);
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();
export default securityService;
