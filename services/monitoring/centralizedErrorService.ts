/**
 * CENTRALIZED ERROR HANDLING SERVICE
 * 
 * This service provides a unified approach to error handling across the entire application:
 * - Centralized logging and error reporting
 * - Consistent error handling patterns
 * - Robust fallback mechanisms
 * - Network error retry logic
 * - User-friendly error messages
 * - Error categorization and severity levels
 * - Offline error queuing and sync
 */

import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// ERROR TYPES AND INTERFACES
// ============================================================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 
  | 'auth' 
  | 'network' 
  | 'database' 
  | 'api' 
  | 'validation' 
  | 'permission' 
  | 'audio' 
  | 'storage' 
  | 'unknown';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  retryCount?: number;
  additionalData?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  error: {
    message: string;
    stack?: string;
    code?: string;
    name?: string;
  };
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  retryCount: number;
  maxRetries: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface ErrorHandlingConfig {
  enableCrashReporting: boolean;
  enableUserNotifications: boolean;
  enableRetryLogic: boolean;
  enableOfflineQueue: boolean;
  maxQueueSize: number;
  retryConfigs: Record<ErrorCategory, RetryConfig>;
}

// ============================================================================
// ERROR MESSAGES AND LOCALIZATION
// ============================================================================

const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: {
      en: 'Invalid email or password. Please try again.',
      es: 'Email o contraseña inválidos. Por favor, inténtalo de nuevo.',
      hr: 'Neispravan email ili lozinka. Molimo pokušajte ponovo.',
    },
    userNotFound: {
      en: 'User account not found. Please check your email.',
      es: 'Cuenta de usuario no encontrada. Por favor, verifica tu email.',
      hr: 'Korisnički račun nije pronađen. Molimo provjerite svoj email.',
    },
    networkError: {
      en: 'Network error. Please check your connection and try again.',
      es: 'Error de red. Por favor, verifica tu conexión e inténtalo de nuevo.',
      hr: 'Greška mreže. Molimo provjerite svoju vezu i pokušajte ponovo.',
    },
    tooManyAttempts: {
      en: 'Too many login attempts. Please try again later.',
      es: 'Demasiados intentos de inicio de sesión. Por favor, inténtalo más tarde.',
      hr: 'Previše pokušaja prijave. Molimo pokušajte kasnije.',
    },
  },
  network: {
    timeout: {
      en: 'Request timed out. Please try again.',
      es: 'La solicitud expiró. Por favor, inténtalo de nuevo.',
      hr: 'Zahtjev je istekao. Molimo pokušajte ponovo.',
    },
    noConnection: {
      en: 'No internet connection. Please check your network.',
      es: 'Sin conexión a internet. Por favor, verifica tu red.',
      hr: 'Nema internetske veze. Molimo provjerite svoju mrežu.',
    },
    serverError: {
      en: 'Server error. Please try again later.',
      es: 'Error del servidor. Por favor, inténtalo más tarde.',
      hr: 'Greška servera. Molimo pokušajte kasnije.',
    },
  },
  database: {
    saveFailed: {
      en: 'Failed to save data. Please try again.',
      es: 'Error al guardar datos. Por favor, inténtalo de nuevo.',
      hr: 'Greška pri spremanju podataka. Molimo pokušajte ponovo.',
    },
    loadFailed: {
      en: 'Failed to load data. Please refresh the app.',
      es: 'Error al cargar datos. Por favor, actualiza la aplicación.',
      hr: 'Greška pri učitavanju podataka. Molimo osvježite aplikaciju.',
    },
  },
  audio: {
    permissionDenied: {
      en: 'Microphone permission denied. Please enable it in settings.',
      es: 'Permiso de micrófono denegado. Por favor, actívalo en configuración.',
      hr: 'Dozvola za mikrofon odbijena. Molimo omogućite je u postavkama.',
    },
    recordingFailed: {
      en: 'Recording failed. Please try again.',
      es: 'Error al grabar. Por favor, inténtalo de nuevo.',
      hr: 'Snimanje nije uspjelo. Molimo pokušajte ponovo.',
    },
  },
  general: {
    unknown: {
      en: 'An unexpected error occurred. Please try again.',
      es: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
      hr: 'Došlo je do neočekivane greške. Molimo pokušajte ponovo.',
    },
    retry: {
      en: 'Something went wrong. Tap to retry.',
      es: 'Algo salió mal. Toca para reintentar.',
      hr: 'Nešto je pošlo po krivu. Dodirnite za ponovni pokušaj.',
    },
  },
};

// ============================================================================
// CENTRALIZED ERROR SERVICE
// ============================================================================

class CentralizedErrorService {
  private errorQueue: ErrorReport[] = [];
  private isReporting = false;
  private config: ErrorHandlingConfig;
  private currentLanguage: string = 'en';

  constructor() {
    this.config = {
      enableCrashReporting: true,
      enableUserNotifications: true,
      enableRetryLogic: true,
      enableOfflineQueue: true,
      maxQueueSize: 100,
      retryConfigs: {
        auth: {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
          retryableErrors: ['network', 'timeout', 'server'],
        },
        network: {
          maxRetries: 5,
          baseDelay: 500,
          maxDelay: 15000,
          backoffMultiplier: 2,
          retryableErrors: ['timeout', 'server', 'connection'],
        },
        database: {
          maxRetries: 2,
          baseDelay: 2000,
          maxDelay: 8000,
          backoffMultiplier: 1.5,
          retryableErrors: ['lock', 'busy', 'timeout'],
        },
        api: {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 12000,
          backoffMultiplier: 2,
          retryableErrors: ['rate_limit', 'server', 'timeout'],
        },
        validation: {
          maxRetries: 0,
          baseDelay: 0,
          maxDelay: 0,
          backoffMultiplier: 1,
          retryableErrors: [],
        },
        permission: {
          maxRetries: 0,
          baseDelay: 0,
          maxDelay: 0,
          backoffMultiplier: 1,
          retryableErrors: [],
        },
        audio: {
          maxRetries: 2,
          baseDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 1.5,
          retryableErrors: ['busy', 'timeout'],
        },
        storage: {
          maxRetries: 2,
          baseDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 1.5,
          retryableErrors: ['full', 'permission'],
        },
        unknown: {
          maxRetries: 1,
          baseDelay: 1000,
          maxDelay: 3000,
          backoffMultiplier: 1,
          retryableErrors: ['network', 'timeout'],
        },
      },
    };
  }

  // ========================================================================
  // CORE ERROR HANDLING METHODS
  // ========================================================================

  /**
   * Handle any error with full context and recovery options
   */
  async handleError(
    error: Error | string,
    category: ErrorCategory = 'unknown',
    context: Partial<ErrorContext> = {},
    retryFunction?: () => Promise<any>,
  ): Promise<{ success: boolean; shouldRetry: boolean; userMessage: string }> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Create error context
    const fullContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      ...context,
    };

    // Determine severity based on category and error
    const severity = this.determineSeverity(errorMessage, category);

    // Create error report
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      error: {
        message: errorMessage,
        stack: errorStack,
        name: error instanceof Error ? error.name : undefined,
        code: this.extractErrorCode(error),
      },
      severity,
      category,
      context: fullContext,
      resolved: false,
      createdAt: new Date().toISOString(),
      retryCount: context.retryCount || 0,
      maxRetries: this.config.retryConfigs[category].maxRetries,
    };

    // Log error
    this.logError(errorReport);

    // Handle retry logic if applicable
    if (retryFunction && this.shouldRetry(errorReport)) {
      const retryResult = await this.handleRetry(errorReport, retryFunction);
      return retryResult;
    }

    // Show user notification if enabled
    const userMessage = this.getUserFriendlyMessage(errorMessage, category);
    if (this.config.enableUserNotifications) {
      this.showUserNotification(userMessage, severity);
    }

    // Report critical errors immediately
    if (severity === 'critical') {
      await this.reportError(errorReport);
    }

    return {
      success: false,
      shouldRetry: false,
      userMessage,
    };
  }

  /**
   * Handle authentication errors specifically
   */
  async handleAuthError(
    error: Error | string,
    context: { email?: string; retryCount?: number } = {},
  ): Promise<{ success: boolean; shouldRetry: boolean; userMessage: string }> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Map common auth errors to user-friendly messages
    let userMessage: string;
    let shouldRetry = false;

    if (errorMessage.includes('invalid-email') || errorMessage.includes('wrong-password')) {
      userMessage = this.getLocalizedMessage('auth.invalidCredentials');
      shouldRetry = true;
    } else if (errorMessage.includes('user-not-found')) {
      userMessage = this.getLocalizedMessage('auth.userNotFound');
    } else if (errorMessage.includes('too-many-requests')) {
      userMessage = this.getLocalizedMessage('auth.tooManyAttempts');
    } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      userMessage = this.getLocalizedMessage('auth.networkError');
      shouldRetry = true;
    } else {
      userMessage = this.getLocalizedMessage('auth.invalidCredentials');
      shouldRetry = true;
    }

    // Log auth error
    await this.handleError(error, 'auth', {
      ...context,
      action: 'authentication',
    });

    return {
      success: false,
      shouldRetry,
      userMessage,
    };
  }

  /**
   * Handle network errors with retry logic
   */
  async handleNetworkError(
    error: Error | string,
    retryFunction: () => Promise<any>,
    context: { endpoint?: string; retryCount?: number } = {},
  ): Promise<{ success: boolean; data?: any; userMessage: string }> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Determine if error is retryable
    const isRetryable = this.isRetryableNetworkError(errorMessage);
    
    if (isRetryable && context.retryCount! < this.config.retryConfigs.network.maxRetries) {
      // Implement exponential backoff
      const delay = this.calculateBackoffDelay(
        context.retryCount || 0,
        this.config.retryConfigs.network,
      );
      
      await this.delay(delay);
      
      try {
        const data = await retryFunction();
        return {
          success: true,
          data,
          userMessage: '',
        };
      } catch (retryError) {
        return this.handleNetworkError(
          retryError as Error,
          retryFunction,
          { ...context, retryCount: (context.retryCount || 0) + 1 },
        );
      }
    }

    // Final failure
    const userMessage = this.getNetworkErrorMessage(errorMessage);
    
    await this.handleError(error, 'network', {
      ...context,
      action: 'api_request',
    });

    return {
      success: false,
      userMessage,
    };
  }

  /**
   * Handle database errors with fallback strategies
   */
  async handleDatabaseError(
    error: Error | string,
    operation: 'read' | 'write' | 'delete',
    context: { table?: string; retryCount?: number } = {},
  ): Promise<{ success: boolean; shouldUseFallback: boolean; userMessage: string }> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Check if we should use fallback storage
    const shouldUseFallback = this.shouldUseFallbackStorage(errorMessage, operation);
    
    let userMessage: string;
    if (operation === 'write') {
      userMessage = this.getLocalizedMessage('database.saveFailed');
    } else {
      userMessage = this.getLocalizedMessage('database.loadFailed');
    }

    await this.handleError(error, 'database', {
      ...context,
      action: `database_${operation}`,
    });

    return {
      success: false,
      shouldUseFallback,
      userMessage,
    };
  }

  // ========================================================================
  // RETRY LOGIC
  // ========================================================================

  private async handleRetry(
    errorReport: ErrorReport,
    retryFunction: () => Promise<any>,
  ): Promise<{ success: boolean; shouldRetry: boolean; userMessage: string }> {
    const retryConfig = this.config.retryConfigs[errorReport.category];
    
    if (errorReport.retryCount >= retryConfig.maxRetries) {
      return {
        success: false,
        shouldRetry: false,
        userMessage: this.getLocalizedMessage('general.retry'),
      };
    }

    // Calculate delay with exponential backoff
    const delay = this.calculateBackoffDelay(errorReport.retryCount, retryConfig);
    
    try {
      await this.delay(delay);
      
      // Update retry count
      errorReport.retryCount++;
      
      // Attempt retry
      await retryFunction();
      
      // Success - mark as resolved
      errorReport.resolved = true;
      errorReport.resolvedAt = new Date().toISOString();
      
      return {
        success: true,
        shouldRetry: false,
        userMessage: '',
      };
    } catch (retryError) {
      // Recursive retry
      return this.handleRetry(
        { ...errorReport, retryCount: errorReport.retryCount + 1 },
        retryFunction,
      );
    }
  }

  private calculateBackoffDelay(retryCount: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, retryCount);
    return Math.min(delay, config.maxDelay);
  }

  private shouldRetry(errorReport: ErrorReport): boolean {
    const retryConfig = this.config.retryConfigs[errorReport.category];
    return errorReport.retryCount < retryConfig.maxRetries && 
           this.isRetryableError(errorReport.error.message, errorReport.category);
  }

  private isRetryableError(errorMessage: string, category: ErrorCategory): boolean {
    const retryConfig = this.config.retryConfigs[category];
    return retryConfig.retryableErrors.some(retryableError => 
      errorMessage.toLowerCase().includes(retryableError.toLowerCase()),
    );
  }

  private isRetryableNetworkError(errorMessage: string): boolean {
    const retryableNetworkErrors = ['timeout', 'server', 'connection', 'network'];
    return retryableNetworkErrors.some(error => 
      errorMessage.toLowerCase().includes(error.toLowerCase()),
    );
  }

  // ========================================================================
  // FALLBACK STRATEGIES
  // ========================================================================

  private shouldUseFallbackStorage(errorMessage: string, operation: string): boolean {
    const fallbackErrors = ['database_locked', 'disk_full', 'permission_denied'];
    return fallbackErrors.some(error => 
      errorMessage.toLowerCase().includes(error.toLowerCase()),
    );
  }

  /**
   * Save data to fallback storage (AsyncStorage)
   */
  async saveToFallbackStorage(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      await this.handleError(error as Error, 'storage', {
        action: 'fallback_save',
        additionalData: { key },
      });
    }
  }

  /**
   * Load data from fallback storage
   */
  async loadFromFallbackStorage(key: string): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      await this.handleError(error as Error, 'storage', {
        action: 'fallback_load',
        additionalData: { key },
      });
      return null;
    }
  }

  // ========================================================================
  // LOGGING AND REPORTING
  // ========================================================================

  private logError(errorReport: ErrorReport): void {
    // Add to queue
    this.addToQueue(errorReport);

    // Console logging in development
    if (__DEV__) {
      console.error('Error logged:', {
        id: errorReport.id,
        message: errorReport.error.message,
        category: errorReport.category,
        severity: errorReport.severity,
        context: errorReport.context,
      });
    }

    // Report critical errors immediately
    if (errorReport.severity === 'critical') {
      this.reportError(errorReport);
    }
  }

  private addToQueue(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport);
    
    // Maintain queue size
    if (this.errorQueue.length > this.config.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  private async reportError(errorReport: ErrorReport): Promise<void> {
    if (!this.config.enableCrashReporting) {
      return;
    }

    try {
      // In a real implementation, this would send to a service like Sentry
      console.debug('Reporting error to external service:', errorReport);
      
      // Mark as resolved after reporting
      errorReport.resolved = true;
      errorReport.resolvedAt = new Date().toISOString();
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  // ========================================================================
  // USER NOTIFICATIONS
  // ========================================================================

  private showUserNotification(message: string, severity: ErrorSeverity): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Web notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('LinguApp Error', {
          body: message,
          icon: '/icon.png',
        });
      }
    } else {
      // Mobile notifications
      Alert.alert(
        severity === 'critical' ? 'Critical Error' : 'Error',
        message,
        [{ text: 'OK' }],
      );
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private determineSeverity(errorMessage: string, category: ErrorCategory): ErrorSeverity {
    if (category === 'auth' && errorMessage.includes('invalid')) {
      return 'medium';
    }
    if (category === 'network' && errorMessage.includes('timeout')) {
      return 'medium';
    }
    if (category === 'database' && errorMessage.includes('corrupt')) {
      return 'critical';
    }
    if (category === 'permission') {
      return 'high';
    }
    return 'medium';
  }

  private extractErrorCode(error: Error | string): string | undefined {
    if (error instanceof Error) {
      // Extract Firebase error codes
      const firebaseMatch = error.message.match(/\(([^)]+)\)/);
      if (firebaseMatch) {
        return firebaseMatch[1];
      }
    }
    return undefined;
  }

  private getNetworkErrorMessage(errorMessage: string): string {
    if (errorMessage.includes('timeout')) {
      return this.getLocalizedMessage('network.timeout');
    }
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return this.getLocalizedMessage('network.noConnection');
    }
    if (errorMessage.includes('server') || errorMessage.includes('500')) {
      return this.getLocalizedMessage('network.serverError');
    }
    return this.getLocalizedMessage('network.timeout');
  }

  private getUserFriendlyMessage(errorMessage: string, category: ErrorCategory): string {
    // Try to find specific error message
    const categoryMessages = ERROR_MESSAGES[category as keyof typeof ERROR_MESSAGES];
    if (categoryMessages) {
      for (const [key, messages] of Object.entries(categoryMessages)) {
        if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
          return this.getLocalizedMessage(`${category}.${key}`);
        }
      }
    }
    
    // Fallback to general error message
    return this.getLocalizedMessage('general.unknown');
  }

  private getLocalizedMessage(key: string): string {
    const keys = key.split('.');
    let messages: any = ERROR_MESSAGES;
    
    for (const k of keys) {
      messages = messages[k];
      if (!messages) break;
    }
    
    if (messages && typeof messages === 'object') {
      return messages[this.currentLanguage] || messages.en || 'Unknown error';
    }
    
    return 'Unknown error';
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================================================================
  // CONFIGURATION
  // ========================================================================

  setLanguage(language: string): void {
    this.currentLanguage = language;
  }

  updateConfig(newConfig: Partial<ErrorHandlingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getErrorQueue(): ErrorReport[] {
    return [...this.errorQueue];
  }

  clearErrorQueue(): void {
    this.errorQueue = [];
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const centralizedErrorService = new CentralizedErrorService();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const handleError = centralizedErrorService.handleError.bind(centralizedErrorService);
export const handleAuthError = centralizedErrorService.handleAuthError.bind(centralizedErrorService);
export const handleNetworkError = centralizedErrorService.handleNetworkError.bind(centralizedErrorService);
export const handleDatabaseError = centralizedErrorService.handleDatabaseError.bind(centralizedErrorService);
export const saveToFallbackStorage = centralizedErrorService.saveToFallbackStorage.bind(centralizedErrorService);
export const loadFromFallbackStorage = centralizedErrorService.loadFromFallbackStorage.bind(centralizedErrorService);

// ============================================================================
// ERROR HANDLING HOOKS
// ============================================================================

/**
 * Hook for handling errors in React components
 */
export const useErrorHandler = () => {
  const handleComponentError = async (
    error: Error | string,
    category: ErrorCategory = 'unknown',
    context: Partial<ErrorContext> = {},
  ) => {
    return await centralizedErrorService.handleError(error, category, {
      ...context,
      component: 'React Component',
    });
  };

  return {
    handleError: handleComponentError,
    handleAuthError: centralizedErrorService.handleAuthError.bind(centralizedErrorService),
    handleNetworkError: centralizedErrorService.handleNetworkError.bind(centralizedErrorService),
  };
};
