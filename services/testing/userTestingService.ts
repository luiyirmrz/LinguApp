import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Platform } from 'react-native';

export interface UserTestSession {
  id: string;
  userId: string;
  testType: 'usability' | 'performance' | 'accessibility' | 'compatibility' | 'security';
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  deviceInfo: DeviceInfo;
  testResults: TestResult[];
  userFeedback: UserFeedback[];
  screenRecordings?: string[];
  errorLogs: ErrorLog[];
}

export interface DeviceInfo {
  platform: string;
  version: string;
  model: string;
  screenSize: { width: number; height: number };
  memory: number;
  storage: number;
  networkType: string;
  language: string;
  timezone: string;
}

export interface TestResult {
  id: string;
  testName: string;
  category: 'navigation' | 'interaction' | 'performance' | 'accessibility' | 'security';
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  score?: number;
  metrics: { [key: string]: any };
  screenshots?: string[];
  notes?: string;
}

export interface UserFeedback {
  id: string;
  question: string;
  answer: string;
  rating?: number;
  timestamp: number;
  category: 'usability' | 'satisfaction' | 'difficulty' | 'suggestion';
}

export interface ErrorLog {
  id: string;
  timestamp: number;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context: { [key: string]: any };
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  expectedOutcome: string;
  category: 'critical' | 'important' | 'nice-to-have';
  estimatedDuration: number;
}

export interface TestStep {
  id: string;
  description: string;
  action: 'tap' | 'swipe' | 'type' | 'wait' | 'verify' | 'navigate';
  target?: string;
  value?: string;
  expectedResult?: string;
  timeout?: number;
}

class UserTestingService {
  private currentSession: UserTestSession | null = null;
  private testScenarios: TestScenario[] = [];
  private isRecording = false;

  async initialize(): Promise<void> {
    console.debug('User Testing Service initialized');
    await this.loadTestScenarios();
  }

  async startTestSession(
    userId: string,
    testType: UserTestSession['testType'],
    deviceInfo: DeviceInfo,
  ): Promise<UserTestSession> {
    const session: UserTestSession = {
      id: this.generateId(),
      userId,
      testType,
      startTime: Date.now(),
      status: 'active',
      deviceInfo,
      testResults: [],
      userFeedback: [],
      errorLogs: [],
    };

    this.currentSession = session;
    await this.saveSession(session);
    
    console.debug(`Test session started: ${session.id}`);
    return session;
  }

  async endTestSession(sessionId: string): Promise<UserTestSession | null> {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      console.error('No active session found');
      return null;
    }

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.status = 'completed';

    await this.saveSession(this.currentSession);
    console.debug(`Test session ended: ${sessionId}`);
    
    const completedSession = this.currentSession;
    this.currentSession = null;
    return completedSession;
  }

  async recordTestResult(
    sessionId: string,
    testResult: Omit<TestResult, 'id' | 'startTime' | 'endTime' | 'duration'>,
  ): Promise<void> {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      console.error('No active session found');
      return;
    }

    const result: TestResult = {
      ...testResult,
      id: this.generateId(),
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 0,
    };

    this.currentSession.testResults.push(result);
    await this.saveSession(this.currentSession);
    
    console.debug(`Test result recorded: ${result.testName}`);
  }

  async recordUserFeedback(
    sessionId: string,
    feedback: Omit<UserFeedback, 'id' | 'timestamp'>,
  ): Promise<void> {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      console.error('No active session found');
      return;
    }

    const userFeedback: UserFeedback = {
      ...feedback,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.currentSession.userFeedback.push(userFeedback);
    await this.saveSession(this.currentSession);
    
    console.debug(`User feedback recorded: ${feedback.question}`);
  }

  async recordError(
    sessionId: string,
    error: Omit<ErrorLog, 'id' | 'timestamp'>,
  ): Promise<void> {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      console.error('No active session found');
      return;
    }

    const errorLog: ErrorLog = {
      ...error,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.currentSession.errorLogs.push(errorLog);
    await this.saveSession(this.currentSession);
    
    console.debug(`Error recorded: ${error.message}`);
  }

  async getTestScenarios(category?: TestScenario['category']): Promise<TestScenario[]> {
    if (category) {
      return this.testScenarios.filter(scenario => scenario.category === category);
    }
    return this.testScenarios;
  }

  async getSessionHistory(userId: string): Promise<UserTestSession[]> {
    try {
      const sessions = await AsyncStorage.getItem(`user_test_sessions_${userId}`);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Failed to get session history:', error);
      return [];
    }
  }

  async getSessionAnalytics(sessionId: string): Promise<{
    successRate: number;
    averageScore: number;
    totalDuration: number;
    errorCount: number;
    feedbackSummary: { [key: string]: any };
  } | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      const successRate = session.testResults.length > 0 
        ? (session.testResults.filter(r => r.success).length / session.testResults.length) * 100
        : 0;

      const averageScore = session.testResults.length > 0
        ? session.testResults.reduce((sum, r) => sum + (r.score || 0), 0) / session.testResults.length
        : 0;

      const errorCount = session.errorLogs.length;

      const feedbackSummary = this.analyzeFeedback(session.userFeedback);

      return {
        successRate,
        averageScore,
        totalDuration: session.duration || 0,
        errorCount,
        feedbackSummary,
      };
    } catch (error) {
      console.error('Failed to get session analytics:', error);
      return null;
    }
  }

  async generateTestReport(sessionId: string): Promise<{
    session: UserTestSession;
    analytics: any;
    recommendations: string[];
    summary: string;
  } | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const analytics = await this.getSessionAnalytics(sessionId);
    if (!analytics) return null;

    const recommendations = this.generateRecommendations(session, analytics);
    const summary = this.generateSummary(session, analytics);

    return {
      session,
      analytics,
      recommendations,
      summary,
    };
  }

  private async loadTestScenarios(): Promise<void> {
    // Load predefined test scenarios
    this.testScenarios = [
      {
        id: 'nav-001',
        name: 'Main Navigation Flow',
        description: 'Test user navigation through main app sections',
        category: 'critical',
        estimatedDuration: 300,
        expectedOutcome: 'User can navigate to all main sections within 30 seconds',
        steps: [
          { id: 'step-1', description: 'Open app', action: 'navigate', target: 'home' },
          { id: 'step-2', description: 'Navigate to lessons', action: 'tap', target: 'lessons-tab' },
          { id: 'step-3', description: 'Navigate to profile', action: 'tap', target: 'profile-tab' },
          { id: 'step-4', description: 'Navigate to social', action: 'tap', target: 'social-tab' },
        ],
      },
      {
        id: 'lesson-001',
        name: 'Complete Lesson Flow',
        description: 'Test completing a full lesson',
        category: 'critical',
        estimatedDuration: 600,
        expectedOutcome: 'User can complete a lesson and see results',
        steps: [
          { id: 'step-1', description: 'Start lesson', action: 'tap', target: 'start-lesson' },
          { id: 'step-2', description: 'Complete exercises', action: 'tap', target: 'exercise-1' },
          { id: 'step-3', description: 'Submit answers', action: 'tap', target: 'submit-button' },
          { id: 'step-4', description: 'View results', action: 'verify', target: 'results-screen' },
        ],
      },
      {
        id: 'accessibility-001',
        name: 'Screen Reader Navigation',
        description: 'Test app accessibility with screen reader',
        category: 'important',
        estimatedDuration: 400,
        expectedOutcome: 'All elements are accessible via screen reader',
        steps: [
          { id: 'step-1', description: 'Enable screen reader', action: 'wait', timeout: 1000 },
          { id: 'step-2', description: 'Navigate with screen reader', action: 'swipe', target: 'next-element' },
          { id: 'step-3', description: 'Verify element descriptions', action: 'verify', target: 'element-description' },
        ],
      },
    ];
  }

  private async saveSession(session: UserTestSession): Promise<void> {
    try {
      const sessions = await this.getSessionHistory(session.userId);
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      await AsyncStorage.setItem(`user_test_sessions_${session.userId}`, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private async getSession(sessionId: string): Promise<UserTestSession | null> {
    try {
      // This would need to be implemented to search across all users
      // For now, return current session if it matches
      return this.currentSession?.id === sessionId ? this.currentSession : null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  private analyzeFeedback(feedback: UserFeedback[]): { [key: string]: any } {
    const summary: { [key: string]: any } = {
      totalResponses: feedback.length,
      averageRating: 0,
      categoryBreakdown: {},
      commonThemes: [],
    };

    if (feedback.length === 0) return summary;

    // Calculate average rating
    const ratings = feedback.filter(f => f.rating).map(f => f.rating!);
    summary.averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    // Category breakdown
    feedback.forEach(f => {
      if (!summary.categoryBreakdown[f.category]) {
        summary.categoryBreakdown[f.category] = 0;
      }
      summary.categoryBreakdown[f.category]++;
    });

    return summary;
  }

  private generateRecommendations(session: UserTestSession, analytics: any): string[] {
    const recommendations: string[] = [];

    if (analytics.successRate < 80) {
      recommendations.push('Improve user interface based on failed test cases');
    }

    if (analytics.averageScore < 7) {
      recommendations.push('Enhance user experience and usability');
    }

    if (analytics.errorCount > 5) {
      recommendations.push('Address error handling and stability issues');
    }

    if (session.testType === 'accessibility' && analytics.successRate < 90) {
      recommendations.push('Improve accessibility features and screen reader support');
    }

    return recommendations;
  }

  private generateSummary(session: UserTestSession, analytics: any): string {
    const duration = Math.round((session.duration || 0) / 1000 / 60); // minutes
    return `Test session completed in ${duration} minutes with ${analytics.successRate.toFixed(1)}% success rate. ` +
           `Average score: ${analytics.averageScore.toFixed(1)}/10. ` +
           `Found ${analytics.errorCount} errors. ` +
           `User feedback: ${analytics.feedbackSummary.totalResponses} responses with ${analytics.feedbackSummary.averageRating.toFixed(1)}/10 average rating.`;
  }

  private generateId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentSession(): UserTestSession | null {
    return this.currentSession;
  }

  isSessionActive(): boolean {
    return this.currentSession !== null && this.currentSession.status === 'active';
  }
}

export const userTestingService = new UserTestingService();
