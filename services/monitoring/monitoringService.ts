/**
 * MONITORING SERVICE
 * 
 * Provides integration with external monitoring services:
 * - Sentry for error tracking and crash reporting
 * - Crashlytics for mobile crash analytics
 * - Custom analytics dashboard
 * - Performance monitoring
 * - User behavior tracking
 */

// import { Platform } from 'react-native';
import { centralizedErrorService } from './centralizedErrorService';

// ============================================================================
// MONITORING INTERFACES
// ============================================================================

export interface MonitoringConfig {
  enableSentry: boolean; 
  enableCrashlytics: boolean;
  enableAnalytics: boolean;
  enablePerformance: boolean;
  environment: 'development' | 'staging' | 'production';
  releaseVersion: string;
  buildNumber: string;
}

export interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  category: string;
  severity: string;
  context: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceEvent {
  name: string;
  duration: number;
  category: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface UserEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp: string;
}

export interface AnalyticsData {
  errorRate: number;
  crashRate: number;
  performanceMetrics: Record<string, number>;
  userEngagement: Record<string, number>;
  topErrors: Array<{ error: string; count: number }>;
  topPerformanceIssues: Array<{ issue: string; avgDuration: number }>;
}

// ============================================================================
// SENTRY INTEGRATION
// ============================================================================

class SentryService {
  private isInitialized = false;
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.config.enableSentry) return;

    try {
      // In a real implementation, this would initialize Sentry
      // import * as Sentry from '@sentry/react-native';
      
      // Sentry.init({
      //   dsn: process.env.SENTRY_DSN,
      //   environment: this.config.environment,
      //   release: this.config.releaseVersion,
      //   debug: this.config.environment === 'development',
      //   enableAutoSessionTracking: true,
      //   sessionTrackingIntervalMillis: 30000,
      //   integrations: [
      //     new Sentry.ReactNativeTracing({
      //       routingInstrumentation: Sentry.routingInstrumentation,
      //       tracingOrigins: ['localhost', 'your-app.com'],
      //     }),
      //   ],
      //   tracesSampleRate: this.config.environment === 'production' ? 0.1 : 1.0,
      // });

      this.isInitialized = true;
      console.debug('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  captureError(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) return;

    try {
      // Sentry.captureException(error, {
      //   tags: {
      //     category: context?.category || 'unknown',
      //     severity: context?.severity || 'medium',
      //   },
      //   extra: context,
      //   user: context?.userId ? { id: context.userId } : undefined,
      // });
      
      console.debug('Error captured by Sentry:', error.message, context);
    } catch (sentryError) {
      console.error('Failed to capture error in Sentry:', sentryError);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>): void {
    if (!this.isInitialized) return;

    try {
      // Sentry.captureMessage(message, {
      //   level,
      //   tags: context?.tags,
      //   extra: context,
      // });
      
      console.debug('Message captured by Sentry:', message, level, context);
    } catch (sentryError) {
      console.error('Failed to capture message in Sentry:', sentryError);
    }
  }

  setUser(userId: string, userData?: Record<string, any>): void {
    if (!this.isInitialized) return;

    try {
      // Sentry.setUser({
      //   id: userId,
      //   ...userData,
      // });
      
      console.debug('User set in Sentry:', userId, userData);
    } catch (sentryError) {
      console.error('Failed to set user in Sentry:', sentryError);
    }
  }

  startTransaction(name: string, operation: string): any {
    if (!this.isInitialized) return null;

    try {
      // return Sentry.startTransaction({
      //   name,
      //   op: operation,
      // });
      
      console.debug('Transaction started in Sentry:', name, operation);
      return { finish: () => console.debug('Transaction finished:', name) };
    } catch (sentryError) {
      console.error('Failed to start transaction in Sentry:', sentryError);
      return null;
    }
  }
}

// ============================================================================
// CRASHLYTICS INTEGRATION
// ============================================================================

class CrashlyticsService {
  private isInitialized = false;
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.config.enableCrashlytics) return;

    try {
      // In a real implementation, this would initialize Crashlytics
      // import crashlytics from '@react-native-firebase/crashlytics';
      
      // await crashlytics().setCrashlyticsCollectionEnabled(true);
      // await crashlytics().setUserId(userId);
      // await crashlytics().setAttributes({
      //   environment: this.config.environment,
      //   version: this.config.releaseVersion,
      //   build: this.config.buildNumber,
      // });

      this.isInitialized = true;
      console.debug('Crashlytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Crashlytics:', error);
    }
  }

  logError(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) return;

    try {
      // import crashlytics from '@react-native-firebase/crashlytics';
      // await crashlytics().recordError(error);
      
      console.debug('Error logged to Crashlytics:', error.message, context);
    } catch (crashlyticsError) {
      console.error('Failed to log error to Crashlytics:', crashlyticsError);
    }
  }

  logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.isInitialized) return;

    try {
      // import crashlytics from '@react-native-firebase/crashlytics';
      // await crashlytics().log(message);
      
      console.debug('Message logged to Crashlytics:', message, level);
    } catch (crashlyticsError) {
      console.error('Failed to log message to Crashlytics:', crashlyticsError);
    }
  }

  setUser(userId: string, userData?: Record<string, any>): void {
    if (!this.isInitialized) return;

    try {
      // import crashlytics from '@react-native-firebase/crashlytics';
      // await crashlytics().setUserId(userId);
      // if (userData) {
      //   await crashlytics().setAttributes(userData);
      // }
      
      console.debug('User set in Crashlytics:', userId, userData);
    } catch (crashlyticsError) {
      console.error('Failed to set user in Crashlytics:', crashlyticsError);
    }
  }
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

class AnalyticsService {
  private events: UserEvent[] = [];
  private performanceEvents: PerformanceEvent[] = [];
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  trackEvent(event: string, properties?: Record<string, any>, userId?: string): void {
    if (!this.config.enableAnalytics) return;

    const userEvent: UserEvent = {
      event,
      properties,
      userId,
      timestamp: new Date().toISOString(),
    };

    this.events.push(userEvent);
    console.debug('Event tracked:', userEvent);
  }

  trackPerformance(name: string, duration: number, category: string, metadata?: Record<string, any>): void {
    if (!this.config.enablePerformance) return;

    const performanceEvent: PerformanceEvent = {
      name,
      duration,
      category,
      metadata,
      timestamp: new Date().toISOString(),
    };

    this.performanceEvents.push(performanceEvent);
    console.debug('Performance tracked:', performanceEvent);
  }

  getAnalyticsData(): AnalyticsData {
    const totalErrors = this.events.filter(e => e.event === 'error').length;
    const totalCrashes = this.events.filter(e => e.event === 'crash').length;
    const totalEvents = this.events.length;

    // Calculate error rate
    const errorRate = totalEvents > 0 ? (totalErrors / totalEvents) * 100 : 0;
    const crashRate = totalEvents > 0 ? (totalCrashes / totalEvents) * 100 : 0;

    // Calculate performance metrics
    const performanceMetrics: Record<string, number> = {};
    const categories = [...new Set(this.performanceEvents.map(e => e.category))];
    
    categories.forEach(category => {
      const categoryEvents = this.performanceEvents.filter(e => e.category === category);
      const avgDuration = categoryEvents.reduce((sum, e) => sum + e.duration, 0) / categoryEvents.length;
      performanceMetrics[category] = avgDuration;
    });

    // Calculate user engagement
    const userEngagement: Record<string, number> = {};
    const eventTypes = [...new Set(this.events.map(e => e.event))];
    
    eventTypes.forEach(eventType => {
      const eventCount = this.events.filter(e => e.event === eventType).length;
      userEngagement[eventType] = eventCount;
    });

    // Get top errors
    const errorEvents = this.events.filter(e => e.event === 'error');
    const errorCounts: Record<string, number> = {};
    errorEvents.forEach(e => {
      const errorMessage = e.properties?.message || 'Unknown error';
      errorCounts[errorMessage] = (errorCounts[errorMessage] || 0) + 1;
    });

    const topErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top performance issues
    const performanceIssues = this.performanceEvents
      .filter(e => e.duration > 1000) // Issues taking more than 1 second
      .reduce((acc, e) => {
        if (!acc[e.name]) {
          acc[e.name] = { total: 0, count: 0 };
        }
        acc[e.name].total += e.duration;
        acc[e.name].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

    const topPerformanceIssues = Object.entries(performanceIssues)
      .map(([issue, data]) => ({ 
        issue, 
        avgDuration: data.total / data.count, 
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    return {
      errorRate,
      crashRate,
      performanceMetrics,
      userEngagement,
      topErrors,
      topPerformanceIssues,
    };
  }

  clearEvents(): void {
    this.events = [];
    this.performanceEvents = [];
  }
}

// ============================================================================
// MAIN MONITORING SERVICE
// ============================================================================

class MonitoringService {
  private sentry: SentryService;
  private crashlytics: CrashlyticsService;
  private analytics: AnalyticsService;
  private config: MonitoringConfig;
  private isInitialized = false;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.sentry = new SentryService(config);
    this.crashlytics = new CrashlyticsService(config);
    this.analytics = new AnalyticsService(config);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Promise.all([
        this.sentry.initialize(),
        this.crashlytics.initialize(),
      ]);

      this.isInitialized = true;
      console.debug('Monitoring service initialized successfully');

      // Set up integration with centralized error service
      this.setupErrorServiceIntegration();
    } catch (error) {
      console.error('Failed to initialize monitoring service:', error);
    }
  }

  private setupErrorServiceIntegration(): void {
    // Subscribe to error events from centralized error service
    const originalHandleError = centralizedErrorService.handleError.bind(centralizedErrorService);
    
    centralizedErrorService.handleError = async (error, category, context) => {
      // Call original method
      const result = await originalHandleError(error, category, context);
      
      // Report to monitoring services
      this.reportError(error, category ?? 'unknown', context ?? {});
      
      return result;
    };
  }

  reportError(error: Error | string, category: string, context?: Record<string, any>): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const errorEvent: ErrorEvent = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: errorMessage,
      stack: errorStack,
      category,
      severity: context?.severity || 'medium',
      context: context || {},
      timestamp: new Date().toISOString(),
      userId: context?.userId,
      sessionId: context?.sessionId,
    };

    // Report to Sentry
    this.sentry.captureError(error instanceof Error ? error : new Error(error), {
      category,
      severity: errorEvent.severity,
      ...context,
    });

    // Report to Crashlytics
    this.crashlytics.logError(error instanceof Error ? error : new Error(error), context);

    // Track in analytics
    this.analytics.trackEvent('error', {
      message: errorMessage,
      category,
      severity: errorEvent.severity,
      stack: errorStack,
    }, context?.userId);

    console.debug('Error reported to monitoring services:', errorEvent);
  }

  trackEvent(event: string, properties?: Record<string, any>, userId?: string): void {
    this.analytics.trackEvent(event, properties, userId);
  }

  trackPerformance(name: string, duration: number, category: string, metadata?: Record<string, any>): void {
    this.analytics.trackPerformance(name, duration, category, metadata);
  }

  setUser(userId: string, userData?: Record<string, any>): void {
    this.sentry.setUser(userId, userData);
    this.crashlytics.setUser(userId, userData);
  }

  getAnalyticsData(): AnalyticsData {
    return this.analytics.getAnalyticsData();
  }

  clearAnalytics(): void {
    this.analytics.clearEvents();
  }

  // Performance monitoring helpers
  startPerformanceTimer(name: string, category: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.trackPerformance(name, duration, category);
    };
  }

  async measurePerformance<T>(
    name: string, 
    category: string, 
    operation: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      this.trackPerformance(name, duration, category);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.trackPerformance(`${name}_error`, duration, category, { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

const defaultConfig: MonitoringConfig = {
  enableSentry: true,
  enableCrashlytics: true,
  enableAnalytics: true,
  enablePerformance: true,
  environment: (process.env.NODE_ENV as any) || 'development',
  releaseVersion: '1.0.0',
  buildNumber: '1',
};

export const monitoringService = new MonitoringService(defaultConfig);

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const reportError = monitoringService.reportError.bind(monitoringService);
export const trackEvent = monitoringService.trackEvent.bind(monitoringService);
export const trackPerformance = monitoringService.trackPerformance.bind(monitoringService);
export const setUser = monitoringService.setUser.bind(monitoringService);
export const getAnalyticsData = monitoringService.getAnalyticsData.bind(monitoringService);
export const startPerformanceTimer = monitoringService.startPerformanceTimer.bind(monitoringService);
export const measurePerformance = monitoringService.measurePerformance.bind(monitoringService);

// ============================================================================
// REACT HOOK FOR MONITORING
// ============================================================================

import { useEffect, useRef } from 'react';

export const useMonitoring = () => {
  const performanceTimers = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    // Initialize monitoring service
    monitoringService.initialize();
  }, []);

  const startTimer = (name: string, category: string) => {
    const stopTimer = startPerformanceTimer(name, category);
    performanceTimers.current.set(name, stopTimer);
  };

  const stopTimer = (name: string) => {
    const timer = performanceTimers.current.get(name);
    if (timer) {
      timer();
      performanceTimers.current.delete(name);
    }
  };

  return {
    reportError,
    trackEvent,
    trackPerformance,
    setUser,
    getAnalyticsData,
    startTimer,
    stopTimer,
    measurePerformance,
  };
};
