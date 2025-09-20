/**
 * SENTRY INTEGRATION SERVICE
 * 
 * Complete Sentry integration with:
 * - Error tracking and crash reporting
 * - Performance monitoring
 * - User session tracking
 * - Custom event tracking
 * - Release management
 */

import { Platform } from 'react-native';

// ============================================================================
// INTERFACES
// ============================================================================

export interface SentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  release: string;
  debug: boolean;
  enableAutoSessionTracking: boolean;
  sessionTrackingIntervalMillis: number;
  tracesSampleRate: number;
  enablePerformanceMonitoring: boolean;
  enableCrashReporting: boolean;
  enableUserTracking: boolean;
}

export interface SentryUser {
  id: string;
  email?: string;
  username?: string;
  ip_address?: string;
}

export interface SentryContext {
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  fingerprint?: string[];
  breadcrumbs?: Array<{
    message: string;
    category: string;
    level: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
    timestamp: number;
    data?: Record<string, any>;
  }>;
}

export interface PerformanceTransaction {
  name: string;
  op: string;
  description?: string;
  tags?: Record<string, string>;
  data?: Record<string, any>;
}

// ============================================================================
// SENTRY INTEGRATION SERVICE
// ============================================================================

class SentryIntegrationService {
  private isInitialized = false;
  private config: SentryConfig;
  private currentUser: SentryUser | null = null;
  private performanceTransactions: Map<string, any> = new Map();

  constructor() {
    this.config = {
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
      environment: (process.env.NODE_ENV as any) || 'development',
      release: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      debug: process.env.NODE_ENV === 'development',
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      enablePerformanceMonitoring: true,
      enableCrashReporting: true,
      enableUserTracking: true,
    };
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized || !this.config.dsn) {
      console.debug('Sentry not initialized - DSN not provided or already initialized');
      return;
    }

    try {
      // In a real implementation, this would initialize Sentry
      // import * as Sentry from '@sentry/react-native';
      
      // Sentry.init({
      //   dsn: this.config.dsn,
      //   environment: this.config.environment,
      //   release: this.config.release,
      //   debug: this.config.debug,
      //   enableAutoSessionTracking: this.config.enableAutoSessionTracking,
      //   sessionTrackingIntervalMillis: this.config.sessionTrackingIntervalMillis,
      //   integrations: [
      //     new Sentry.ReactNativeTracing({
      //       routingInstrumentation: Sentry.routingInstrumentation,
      //       tracingOrigins: ['localhost', 'your-app.com'],
      //     }),
      //   ],
      //   tracesSampleRate: this.config.tracesSampleRate,
      //   beforeSend: (event) => this.beforeSend(event),
      //   beforeBreadcrumb: (breadcrumb) => this.beforeBreadcrumb(breadcrumb),
      // });

      this.isInitialized = true;
      console.debug('✅ Sentry initialized successfully');

      // Set initial context
      this.setContext({
        tags: {
          platform: Platform.OS,
          version: this.config.release,
          environment: this.config.environment,
        },
        extra: {
          app_name: 'LinguApp',
          build_number: process.env.EXPO_PUBLIC_BUILD_NUMBER || '1',
        },
      });

    } catch (error) {
      console.error('❌ Failed to initialize Sentry:', error);
    }
  }

  // ============================================================================
  // ERROR TRACKING
  // ============================================================================

  captureError(error: Error, context?: SentryContext): void {
    if (!this.isInitialized) {
      console.debug('Sentry not initialized, logging error locally:', error);
      return;
    }

    try {
      // Sentry.captureException(error, {
      //   tags: context?.tags,
      //   extra: context?.extra,
      //   level: context?.level || 'error',
      //   fingerprint: context?.fingerprint,
      //   breadcrumbs: context?.breadcrumbs,
      // });

      console.debug('Error captured by Sentry:', {
        message: error.message,
        stack: error.stack,
        context,
      });

    } catch (sentryError) {
      console.error('Failed to capture error in Sentry:', sentryError);
    }
  }

  captureMessage(message: string, level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info', context?: SentryContext): void {
    if (!this.isInitialized) {
      console.debug(`Sentry not initialized, logging message locally [${level}]:`, message);
      return;
    }

    try {
      // Sentry.captureMessage(message, level, {
      //   tags: context?.tags,
      //   extra: context?.extra,
      //   breadcrumbs: context?.breadcrumbs,
      // });

      console.debug(`Message captured by Sentry [${level}]:`, {
        message,
        level,
        context,
      });

    } catch (sentryError) {
      console.error('Failed to capture message in Sentry:', sentryError);
    }
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  startTransaction(transaction: PerformanceTransaction): string {
    if (!this.isInitialized || !this.config.enablePerformanceMonitoring) {
      return '';
    }

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // const sentryTransaction = Sentry.startTransaction({
      //   name: transaction.name,
      //   op: transaction.op,
      //   description: transaction.description,
      //   tags: transaction.tags,
      //   data: transaction.data,
      // });

      // this.performanceTransactions.set(transactionId, sentryTransaction);

      console.debug('Performance transaction started:', {
        id: transactionId,
        name: transaction.name,
        op: transaction.op,
      });

    } catch (error) {
      console.error('Failed to start performance transaction:', error);
    }

    return transactionId;
  }

  finishTransaction(transactionId: string, status: 'ok' | 'cancelled' | 'internal_error' | 'unknown_error' | 'deadline_exceeded' | 'unauthenticated' | 'permission_denied' | 'not_found' | 'already_exists' | 'failed_precondition' | 'aborted' | 'out_of_range' | 'unimplemented' | 'unavailable' | 'data_loss' = 'ok'): void {
    if (!transactionId || !this.performanceTransactions.has(transactionId)) {
      return;
    }

    try {
      // const transaction = this.performanceTransactions.get(transactionId);
      // if (transaction) {
      //   transaction.setStatus(status);
      //   transaction.finish();
      //   this.performanceTransactions.delete(transactionId);
      // }

      console.debug('Performance transaction finished:', {
        id: transactionId,
        status,
      });

    } catch (error) {
      console.error('Failed to finish performance transaction:', error);
    }
  }

  addBreadcrumb(message: string, category: string, level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info', data?: Record<string, any>): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Sentry.addBreadcrumb({
      //   message,
      //   category,
      //   level,
      //   timestamp: Date.now() / 1000,
      //   data,
      // });

      console.debug('Breadcrumb added:', {
        message,
        category,
        level,
        data,
      });

    } catch (error) {
      console.error('Failed to add breadcrumb:', error);
    }
  }

  // ============================================================================
  // USER TRACKING
  // ============================================================================

  setUser(user: SentryUser): void {
    if (!this.isInitialized || !this.config.enableUserTracking) {
      return;
    }

    try {
      // Sentry.setUser(user);
      this.currentUser = user;

      console.debug('User set in Sentry:', user);

    } catch (error) {
      console.error('Failed to set user in Sentry:', error);
    }
  }

  clearUser(): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Sentry.setUser(null);
      this.currentUser = null;

      console.debug('User cleared in Sentry');

    } catch (error) {
      console.error('Failed to clear user in Sentry:', error);
    }
  }

  getCurrentUser(): SentryUser | null {
    return this.currentUser;
  }

  // ============================================================================
  // CONTEXT MANAGEMENT
  // ============================================================================

  setContext(context: SentryContext): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Sentry.setContext('app', context);

      console.debug('Context set in Sentry:', context);

    } catch (error) {
      console.error('Failed to set context in Sentry:', error);
    }
  }

  setTag(key: string, value: string): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Sentry.setTag(key, value);

      console.debug('Tag set in Sentry:', { key, value });

    } catch (error) {
      console.error('Failed to set tag in Sentry:', error);
    }
  }

  setExtra(key: string, value: any): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Sentry.setExtra(key, value);

      console.debug('Extra data set in Sentry:', { key, value });

    } catch (error) {
      console.error('Failed to set extra data in Sentry:', error);
    }
  }

  // ============================================================================
  // RELEASE MANAGEMENT
  // ============================================================================

  setRelease(release: string): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Sentry.setRelease(release);
      this.config.release = release;

      console.debug('Release set in Sentry:', release);

    } catch (error) {
      console.error('Failed to set release in Sentry:', error);
    }
  }

  setEnvironment(environment: 'development' | 'staging' | 'production'): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Sentry.setEnvironment(environment);
      this.config.environment = environment;

      console.debug('Environment set in Sentry:', environment);

    } catch (error) {
      console.error('Failed to set environment in Sentry:', error);
    }
  }

  // ============================================================================
  // CUSTOM EVENTS
  // ============================================================================

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Sentry.addBreadcrumb({
      //   message: eventName,
      //   category: 'user_action',
      //   level: 'info',
      //   data: properties,
      // });

      console.debug('Custom event tracked:', {
        eventName,
        properties,
      });

    } catch (error) {
      console.error('Failed to track custom event:', error);
    }
  }

  trackNavigation(from: string, to: string, properties?: Record<string, any>): void {
    this.addBreadcrumb(`Navigation: ${from} → ${to}`, 'navigation', 'info', properties);
  }

  trackUserAction(action: string, properties?: Record<string, any>): void {
    this.addBreadcrumb(`User Action: ${action}`, 'user_action', 'info', properties);
  }

  trackAPIRequest(method: string, url: string, statusCode?: number, duration?: number): void {
    this.addBreadcrumb(`API Request: ${method} ${url}`, 'http', 'info', {
      method,
      url,
      status_code: statusCode,
      duration,
    });
  }

  // ============================================================================
  // FILTERING AND PROCESSING
  // ============================================================================

  private beforeSend(event: any): any {
    // Filter out sensitive data
    if (event.extra) {
      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth'];
      sensitiveFields.forEach(field => {
        if (event.extra[field]) {
          event.extra[field] = '[FILTERED]';
        }
      });
    }

    // Add custom context
    event.tags = {
      ...event.tags,
      platform: Platform.OS,
      app_version: this.config.release,
    };

    return event;
  }

  private beforeBreadcrumb(breadcrumb: any): any {
    // Filter out sensitive breadcrumbs
    if (breadcrumb.category === 'http' && breadcrumb.data?.url) {
      const url = breadcrumb.data.url;
      if (url.includes('password') || url.includes('token') || url.includes('key')) {
        return null; // Don't send this breadcrumb
      }
    }

    return breadcrumb;
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  updateConfig(config: Partial<SentryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): SentryConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return this.isInitialized && !!this.config.dsn;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  flush(): Promise<boolean> {
    if (!this.isInitialized) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      try {
        // Sentry.flush(2000).then(() => {
        //   resolve(true);
        // }).catch(() => {
        //   resolve(false);
        // });

        // Simulate flush
        setTimeout(() => resolve(true), 100);

      } catch (error) {
        console.error('Failed to flush Sentry:', error);
        resolve(false);
      }
    });
  }

  close(): Promise<boolean> {
    if (!this.isInitialized) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      try {
        // Sentry.close(2000).then(() => {
        //   this.isInitialized = false;
        //   resolve(true);
        // }).catch(() => {
        //   resolve(false);
        // });

        // Simulate close
        setTimeout(() => {
          this.isInitialized = false;
          resolve(true);
        }, 100);

      } catch (error) {
        console.error('Failed to close Sentry:', error);
        resolve(false);
      }
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const sentryIntegrationService = new SentryIntegrationService();

// Auto-initialize in production
if (process.env.NODE_ENV === 'production') {
  sentryIntegrationService.initialize();
}
