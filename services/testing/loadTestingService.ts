import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface LoadTestConfig {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  concurrentUsers: number;
  rampUpTime: number; // in seconds
  testScenarios: LoadTestScenario[];
  targetEndpoint?: string;
  expectedResponseTime: number; // in milliseconds
  maxErrorRate: number; // percentage
}

export interface LoadTestScenario {
  id: string;
  name: string;
  weight: number; // percentage of total load
  steps: LoadTestStep[];
  thinkTime: number; // in milliseconds
}

export interface LoadTestStep {
  id: string;
  action: 'api_call' | 'ui_interaction' | 'wait' | 'assertion';
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
  expectedStatus?: number;
  timeout?: number;
  assertion?: LoadTestAssertion;
}

export interface LoadTestAssertion {
  type: 'response_time' | 'status_code' | 'response_size' | 'custom';
  operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'ne';
  value: any;
  message?: string;
}

export interface LoadTestMetric {
  responseTime: number;
  throughput: number;
  errorRate: number;
  timestamp: number;
}

export interface LoadTestResult {
  id: string;
  configId: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughput: number; // requests per second
  scenarioResults: ScenarioResult[];
  errors: LoadTestError[];
  systemMetrics: SystemMetrics;
  metrics: LoadTestMetric[];
  finalMetrics?: {
    averageResponseTime: number;
    averageThroughput: number;
    averageErrorRate: number;
    totalRequests: number;
    successRate: number;
  };
}

export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  stepResults: StepResult[];
}

export interface StepResult {
  stepId: string;
  stepName: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  assertions: AssertionResult[];
}

export interface AssertionResult {
  assertion: LoadTestAssertion;
  passed: boolean;
  actualValue: any;
  message?: string;
}

export interface LoadTestError {
  id: string;
  timestamp: number;
  scenarioId: string;
  stepId: string;
  errorType: 'timeout' | 'connection_error' | 'http_error' | 'assertion_failed' | 'system_error';
  message: string;
  details?: any;
}

export interface SystemMetrics {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  batteryLevel?: number;
  deviceTemperature?: number;
}

class LoadTestingService {
  private activeTests = new Map<string, LoadTestResult>();
  private testConfigs: LoadTestConfig[] = [];
  private isMonitoring = false;
  private monitoringInterval: any = null;

  async initialize(): Promise<void> {
    console.debug('Load Testing Service initialized');
    await this.loadTestConfigs();
  }

  async createLoadTest(config: Omit<LoadTestConfig, 'id'>): Promise<LoadTestConfig> {
    const newConfig: LoadTestConfig = {
      ...config,
      id: this.generateId(),
    };

    this.testConfigs.push(newConfig);
    await this.saveTestConfigs();
    
    console.debug(`Load test config created: ${newConfig.id}`);
    return newConfig;
  }

  async startLoadTest(configId: string): Promise<LoadTestResult> {
    const config = this.testConfigs.find(c => c.id === configId);
    if (!config) {
      throw new Error(`Load test config not found: ${configId}`);
    }

    const result: LoadTestResult = {
      id: this.generateId(),
      configId,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      status: 'running',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      throughput: 0,
      scenarioResults: [],
      errors: [],
      systemMetrics: {
        timestamp: Date.now(),
        cpuUsage: 0,
        memoryUsage: 0,
        networkLatency: 0,
      },
      metrics: [],
    };

    this.activeTests.set(result.id, result);
    await this.saveTestResult(result);

    // Start the load test
    this.executeLoadTest(result, config);
    
    console.debug(`Load test started: ${result.id}`);
    return result;
  }

  async stopLoadTest(testId: string): Promise<LoadTestResult | null> {
    const result = this.activeTests.get(testId);
    if (!result) {
      console.error(`Load test not found: ${testId}`);
      return null;
    }

    result.status = 'cancelled';
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;

    this.activeTests.delete(testId);
    await this.saveTestResult(result);
    
    console.debug(`Load test stopped: ${testId}`);
    return result;
  }

  async getLoadTestResult(testId: string): Promise<LoadTestResult | null> {
    try {
      const result = await AsyncStorage.getItem(`load_test_result_${testId}`);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      console.error('Failed to get load test result:', error);
      return null;
    }
  }

  async getLoadTestHistory(): Promise<LoadTestResult[]> {
    try {
      const results = await AsyncStorage.getItem('load_test_history');
      return results ? JSON.parse(results) : [];
    } catch (error) {
      console.error('Failed to get load test history:', error);
      return [];
    }
  }

  async getTestConfigs(): Promise<LoadTestConfig[]> {
    return this.testConfigs;
  }

  async generateLoadTestReport(testId: string): Promise<{
    result: LoadTestResult;
    config: LoadTestConfig;
    analysis: LoadTestAnalysis;
    recommendations: string[];
  } | null> {
    const result = await this.getLoadTestResult(testId);
    if (!result) return null;

    const config = this.testConfigs.find(c => c.id === result.configId);
    if (!config) return null;

    const analysis = this.analyzeLoadTestResult(result, config);
    const recommendations = this.generateRecommendations(result, config, analysis);

    return {
      result,
      config,
      analysis,
      recommendations,
    };
  }

  async startSystemMonitoring(intervalMs: number = 5000): Promise<void> {
    if (this.isMonitoring) {
      console.warn('System monitoring is already active');
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, intervalMs);

    console.debug(`System monitoring started with interval: ${intervalMs}ms`);
  }

  async stopSystemMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.debug('System monitoring stopped');
  }

  private async executeLoadTest(result: LoadTestResult, config: LoadTestConfig): Promise<void> {
    try {
      const startTime = Date.now();
      const endTime = startTime + (config.duration * 1000);
      
      // Initialize scenario results
      config.testScenarios.forEach(scenario => {
        result.scenarioResults.push({
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          errorRate: 0,
          stepResults: [],
        });
      });

      // Execute load test
      while (Date.now() < endTime && result.status === 'running') {
        await this.executeTestScenarios(result, config);
        await this.delay(100); // Small delay to prevent overwhelming
      }

      // Finalize results
      result.status = 'completed';
      result.endTime = Date.now();
      result.duration = result.endTime - result.startTime;
      
      this.calculateFinalMetrics(result);
      await this.saveTestResult(result);
      
      console.debug(`Load test completed: ${result.id}`);
    } catch (error) {
      result.status = 'failed';
      result.endTime = Date.now();
      result.duration = result.endTime - result.startTime;
      
      this.recordError(result, 'system_error', 'Load test execution failed', error);
      await this.saveTestResult(result);
      
      console.error(`Load test failed: ${result.id}`, error);
    }
  }

  private async executeTestScenarios(result: LoadTestResult, config: LoadTestConfig): Promise<void> {
    const promises: Promise<void>[] = [];

    config.testScenarios.forEach(scenario => {
      const scenarioResult = result.scenarioResults.find(sr => sr.scenarioId === scenario.id);
      if (!scenarioResult) return;

      // Execute scenario based on its weight
      const shouldExecute = Math.random() * 100 < scenario.weight;
      if (shouldExecute) {
        promises.push(this.executeScenario(result, scenario, scenarioResult));
      }
    });

    await Promise.allSettled(promises);
  }

  private async executeScenario(
    result: LoadTestResult,
    scenario: LoadTestScenario,
    scenarioResult: ScenarioResult,
  ): Promise<void> {
    try {
      for (const step of scenario.steps) {
        await this.executeStep(result, scenario, step, scenarioResult);
        
        // Add think time
        if (scenario.thinkTime > 0) {
          await this.delay(scenario.thinkTime);
        }
      }
    } catch (error) {
      this.recordError(result, 'system_error', `Scenario execution failed: ${scenario.name}`, error);
    }
  }

  private async executeStep(
    result: LoadTestResult,
    scenario: LoadTestScenario,
    step: LoadTestStep,
    scenarioResult: ScenarioResult,
  ): Promise<void> {
    const stepStartTime = Date.now();
    let stepResult: StepResult | undefined;

    try {
      // Find or create step result
      stepResult = scenarioResult.stepResults.find(sr => sr.stepId === step.id);
      if (!stepResult) {
        stepResult = {
          stepId: step.id,
          stepName: step.action,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          minResponseTime: Infinity,
          maxResponseTime: 0,
          errorRate: 0,
          assertions: [],
        };
        scenarioResult.stepResults.push(stepResult);
      }

      // Execute step based on action type
      let responseTime = 0;
      let success = false;

      switch (step.action) {
        case 'api_call':
          const apiResult = await this.executeApiCall(step);
          responseTime = apiResult.responseTime;
          success = apiResult.success;
          break;
        case 'ui_interaction':
          const uiResult = await this.executeUiInteraction(step);
          responseTime = uiResult.responseTime;
          success = uiResult.success;
          break;
        case 'wait':
          await this.delay(step.timeout || 1000);
          responseTime = step.timeout || 1000;
          success = true;
          break;
        case 'assertion':
          const assertionResult = await this.executeAssertion(step);
          responseTime = Date.now() - stepStartTime;
          success = assertionResult.passed;
          stepResult.assertions.push(assertionResult);
          break;
      }

      // Update step results
      stepResult.totalRequests++;
      if (success) {
        stepResult.successfulRequests++;
        result.successfulRequests++;
      } else {
        stepResult.failedRequests++;
        result.failedRequests++;
        this.recordError(result, 'assertion_failed', `Step failed: ${step.action}`, { stepId: step.id });
      }

      // Update response time metrics
      stepResult.averageResponseTime = this.calculateAverageResponseTime(stepResult);
      stepResult.minResponseTime = Math.min(stepResult.minResponseTime, responseTime);
      stepResult.maxResponseTime = Math.max(stepResult.maxResponseTime, responseTime);

      // Update scenario results
      scenarioResult.totalRequests++;
      if (success) {
        scenarioResult.successfulRequests++;
      } else {
        scenarioResult.failedRequests++;
      }
      scenarioResult.averageResponseTime = this.calculateAverageResponseTime(scenarioResult);
      scenarioResult.errorRate = (scenarioResult.failedRequests / scenarioResult.totalRequests) * 100;

      // Update overall results
      result.totalRequests++;
      result.averageResponseTime = this.calculateAverageResponseTime(result);
      result.minResponseTime = Math.min(result.minResponseTime, responseTime);
      result.maxResponseTime = Math.max(result.maxResponseTime, responseTime);
      result.errorRate = (result.failedRequests / result.totalRequests) * 100;
      result.throughput = result.totalRequests / ((Date.now() - result.startTime) / 1000);

    } catch (error) {
      this.recordError(result, 'system_error', `Step execution failed: ${step.action}`, error);
    }
  }

  private async executeApiCall(step: LoadTestStep): Promise<{ responseTime: number; success: boolean }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(step.endpoint!, {
        method: step.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: step.payload ? JSON.stringify(step.payload) : undefined,
      });

      const responseTime = Date.now() - startTime;
      const success = step.expectedStatus ? response.status === step.expectedStatus : response.ok;

      return { responseTime, success };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { responseTime, success: false };
    }
  }

  private async executeUiInteraction(step: LoadTestStep): Promise<{ responseTime: number; success: boolean }> {
    const startTime = Date.now();
    
    try {
      // Simulate UI interaction
      await this.delay(100 + Math.random() * 200);
      
      const responseTime = Date.now() - startTime;
      return { responseTime, success: true };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { responseTime, success: false };
    }
  }

  private async executeAssertion(step: LoadTestStep): Promise<AssertionResult> {
    if (!step.assertion) {
      return {
        assertion: { type: 'custom', operator: 'eq', value: true },
        passed: false,
        actualValue: false,
        message: 'No assertion defined',
      };
    }

    // Simulate assertion execution
    const actualValue = Math.random() * 1000; // Mock actual value
    const passed = this.evaluateAssertion(step.assertion, actualValue);

    return {
      assertion: step.assertion,
      passed,
      actualValue,
      message: passed ? undefined : `Assertion failed: ${step.assertion.message || 'Custom assertion'}`,
    };
  }

  private evaluateAssertion(assertion: LoadTestAssertion, actualValue: any): boolean {
    switch (assertion.operator) {
      case 'lt': return actualValue < assertion.value;
      case 'lte': return actualValue <= assertion.value;
      case 'gt': return actualValue > assertion.value;
      case 'gte': return actualValue >= assertion.value;
      case 'eq': return actualValue === assertion.value;
      case 'ne': return actualValue !== assertion.value;
      default: return false;
    }
  }

  private calculateAverageResponseTime(result: any): number {
    if (result.totalRequests === 0) return 0;
    
    // This is a simplified calculation
    // In a real implementation, you'd track individual response times
    return result.averageResponseTime || 0;
  }

  private recordError(
    result: LoadTestResult,
    errorType: LoadTestError['errorType'],
    message: string,
    details?: any,
  ): void {
    const error: LoadTestError = {
      id: this.generateId(),
      timestamp: Date.now(),
      scenarioId: '',
      stepId: '',
      errorType,
      message,
      details,
    };

    result.errors.push(error);
  }

  private collectSystemMetrics(): void {
    // This would collect actual system metrics
    // For now, we'll simulate the data
    const metrics: SystemMetrics = {
      timestamp: Date.now(),
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      networkLatency: Math.random() * 100,
      batteryLevel: Platform.OS !== 'web' ? Math.random() * 100 : undefined,
      deviceTemperature: Platform.OS !== 'web' ? 20 + Math.random() * 20 : undefined,
    };

    // Update active tests with system metrics
    this.activeTests.forEach(result => {
      result.systemMetrics = metrics;
    });
  }

  private analyzeLoadTestResult(result: LoadTestResult, config: LoadTestConfig): LoadTestAnalysis {
    return {
      performanceGrade: this.calculatePerformanceGrade(result, config),
      bottlenecks: this.identifyBottlenecks(result),
      stabilityScore: this.calculateStabilityScore(result),
      scalabilityAssessment: this.assessScalability(result, config),
      recommendations: [],
    };
  }

  private calculatePerformanceGrade(result: LoadTestResult, config: LoadTestConfig): 'A' | 'B' | 'C' | 'D' | 'F' {
    const responseTimeScore = result.averageResponseTime <= config.expectedResponseTime ? 100 : 
      Math.max(0, 100 - ((result.averageResponseTime - config.expectedResponseTime) / config.expectedResponseTime) * 100);
    
    const errorRateScore = result.errorRate <= config.maxErrorRate ? 100 : 
      Math.max(0, 100 - ((result.errorRate - config.maxErrorRate) / config.maxErrorRate) * 100);

    const overallScore = (responseTimeScore + errorRateScore) / 2;

    if (overallScore >= 90) return 'A';
    if (overallScore >= 80) return 'B';
    if (overallScore >= 70) return 'C';
    if (overallScore >= 60) return 'D';
    return 'F';
  }

  private identifyBottlenecks(result: LoadTestResult): string[] {
    const bottlenecks: string[] = [];

    if (result.averageResponseTime > 2000) {
      bottlenecks.push('High response times detected');
    }

    if (result.errorRate > 5) {
      bottlenecks.push('High error rate detected');
    }

    if (result.throughput < 10) {
      bottlenecks.push('Low throughput detected');
    }

    return bottlenecks;
  }

  private calculateStabilityScore(result: LoadTestResult): number {
    const errorRate = result.errorRate;
    const responseTimeVariance = result.maxResponseTime - result.minResponseTime;
    
    // Calculate stability score (0-100)
    const errorScore = Math.max(0, 100 - errorRate * 10);
    const varianceScore = Math.max(0, 100 - (responseTimeVariance / 1000) * 10);
    
    return (errorScore + varianceScore) / 2;
  }

  private assessScalability(result: LoadTestResult, config: LoadTestConfig): string {
    const throughputPerUser = result.throughput / config.concurrentUsers;
    
    if (throughputPerUser > 10) return 'Excellent scalability';
    if (throughputPerUser > 5) return 'Good scalability';
    if (throughputPerUser > 2) return 'Moderate scalability';
    return 'Poor scalability';
  }

  private generateRecommendations(
    result: LoadTestResult,
    config: LoadTestConfig,
    analysis: LoadTestAnalysis,
  ): string[] {
    const recommendations: string[] = [];

    if (result.averageResponseTime > config.expectedResponseTime) {
      recommendations.push('Optimize response times by implementing caching and database query optimization');
    }

    if (result.errorRate > config.maxErrorRate) {
      recommendations.push('Improve error handling and system stability');
    }

    if (analysis.stabilityScore < 70) {
      recommendations.push('Enhance system stability and error recovery mechanisms');
    }

    if (analysis.bottlenecks.length > 0) {
      recommendations.push('Address identified performance bottlenecks');
    }

    return recommendations;
  }

  private async loadTestConfigs(): Promise<void> {
    try {
      const configs = await AsyncStorage.getItem('load_test_configs');
      this.testConfigs = configs ? JSON.parse(configs) : [];
    } catch (error) {
      console.error('Failed to load test configs:', error);
      this.testConfigs = [];
    }
  }

  private async saveTestConfigs(): Promise<void> {
    try {
      await AsyncStorage.setItem('load_test_configs', JSON.stringify(this.testConfigs));
    } catch (error) {
      console.error('Failed to save test configs:', error);
    }
  }

  private async saveTestResult(result: LoadTestResult): Promise<void> {
    try {
      await AsyncStorage.setItem(`load_test_result_${result.id}`, JSON.stringify(result));
      
      // Also save to history
      const history = await this.getLoadTestHistory();
      const existingIndex = history.findIndex(r => r.id === result.id);
      
      if (existingIndex >= 0) {
        history[existingIndex] = result;
      } else {
        history.push(result);
      }
      
      await AsyncStorage.setItem('load_test_history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save test result:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `load_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateFinalMetrics(result: LoadTestResult): void {
    // Calculate final performance metrics
    if (result.metrics.length > 0) {
      const avgResponseTime = result.metrics.reduce((sum: number, m: LoadTestMetric) => sum + m.responseTime, 0) / result.metrics.length;
      const avgThroughput = result.metrics.reduce((sum: number, m: LoadTestMetric) => sum + m.throughput, 0) / result.metrics.length;
      const errorRate = result.metrics.reduce((sum: number, m: LoadTestMetric) => sum + m.errorRate, 0) / result.metrics.length;
      
      result.finalMetrics = {
        averageResponseTime: avgResponseTime,
        averageThroughput: avgThroughput,
        averageErrorRate: errorRate,
        totalRequests: result.metrics.length,
        successRate: 100 - errorRate,
      };
    }
  }
}

export interface LoadTestAnalysis {
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  bottlenecks: string[];
  stabilityScore: number;
  scalabilityAssessment: string;
  recommendations: string[];
}

export const loadTestingService = new LoadTestingService();
