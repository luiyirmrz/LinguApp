import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';

export interface CompatibilityTestConfig {
  id: string;
  name: string;
  description: string;
  testType: 'device' | 'os' | 'browser' | 'network' | 'performance';
  targetPlatforms: PlatformConfig[];
  testScenarios: CompatibilityTestScenario[];
  networkConditions: NetworkCondition[];
  performanceThresholds: PerformanceThreshold;
}

export interface PlatformConfig {
  platform: 'ios' | 'android' | 'web';
  versions: string[];
  devices: DeviceConfig[];
  browsers?: BrowserConfig[];
}

export interface DeviceConfig {
  name: string;
  screenSize: { width: number; height: number };
  density: number;
  memory: number;
  storage: number;
  processor: string;
  osVersion: string;
}

export interface BrowserConfig {
  name: string;
  version: string;
  engine: string;
  features: string[];
}

export interface CompatibilityTestScenario {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'functionality' | 'performance' | 'network' | 'storage';
  priority: 'critical' | 'high' | 'medium' | 'low';
  steps: CompatibilityTestStep[];
  expectedOutcome: string;
  timeout?: number;
}

export interface CompatibilityTestStep {
  id: string;
  description: string;
  action: 'navigate' | 'interact' | 'verify' | 'measure' | 'test_feature';
  target?: string;
  verification: CompatibilityVerification;
  timeout?: number;
}

export interface CompatibilityVerification {
  type: 'element_present' | 'functionality_works' | 'performance_acceptable' | 'network_connectivity' | 'storage_available';
  criteria: string[];
  expectedResult: any;
  tolerance?: number;
}

export interface NetworkCondition {
  name: string;
  type: 'wifi' | 'cellular' | 'slow' | 'offline';
  speed: number; // Mbps
  latency: number; // ms
  packetLoss: number; // percentage
}

export interface PerformanceThreshold {
  loadTime: number; // ms
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  batteryDrain: number; // percentage per hour
  networkUsage: number; // MB
}

export interface CompatibilityTestResult {
  id: string;
  configId: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  overallCompatibility: number; // percentage
  platformResults: PlatformCompatibilityResult[];
  scenarioResults: CompatibilityScenarioResult[];
  issues: CompatibilityIssue[];
  recommendations: CompatibilityRecommendation[];
  deviceInfo: DeviceCompatibilityInfo;
}

export interface PlatformCompatibilityResult {
  platform: string;
  version: string;
  device?: string;
  browser?: string;
  compatibility: number; // percentage
  status: 'compatible' | 'partially_compatible' | 'incompatible';
  issues: CompatibilityIssue[];
  performance: PerformanceMetrics;
  features: FeatureCompatibility[];
}

export interface CompatibilityScenarioResult {
  scenarioId: string;
  scenarioName: string;
  category: string;
  priority: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  compatibility: number; // percentage
  stepResults: CompatibilityStepResult[];
  issues: CompatibilityIssue[];
  duration: number;
}

export interface CompatibilityStepResult {
  stepId: string;
  stepName: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  verification: CompatibilityVerification;
  actualResult: any;
  expectedResult: any;
  passed: boolean;
  message?: string;
  screenshot?: string;
  duration: number;
}

export interface CompatibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'ui' | 'functionality' | 'performance' | 'network' | 'storage';
  platform: string;
  description: string;
  element?: string;
  suggestion: string;
  impact: string;
  screenshot?: string;
  workaround?: string;
}

export interface CompatibilityRecommendation {
  id: string;
  type: 'fix' | 'optimization' | 'enhancement';
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'high' | 'medium' | 'low';
  affectedPlatforms: string[];
}

export interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  batteryDrain: number;
  networkUsage: number;
  frameRate: number;
  responsiveness: number;
}

export interface FeatureCompatibility {
  feature: string;
  supported: boolean;
  partial: boolean;
  issues: string[];
  workaround?: string;
}

export interface DeviceCompatibilityInfo {
  platform: string;
  version: string;
  device: string;
  screenSize: { width: number; height: number };
  density: number;
  memory: number;
  storage: number;
  processor: string;
  networkType: string;
  browser?: string;
  browserVersion?: string;
}

class CompatibilityTestingService {
  private activeTests = new Map<string, CompatibilityTestResult>();
  private testConfigs: CompatibilityTestConfig[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    console.debug('Compatibility Testing Service initialized');
    await this.loadTestConfigs();
  }

  async createTestConfig(config: Omit<CompatibilityTestConfig, 'id'>): Promise<CompatibilityTestConfig> {
    const newConfig: CompatibilityTestConfig = {
      ...config,
      id: this.generateId(),
    };

    this.testConfigs.push(newConfig);
    await this.saveTestConfigs();
    
    console.debug(`Compatibility test config created: ${newConfig.id}`);
    return newConfig;
  }

  async startCompatibilityTest(configId: string): Promise<CompatibilityTestResult> {
    const config = this.testConfigs.find(c => c.id === configId);
    if (!config) {
      throw new Error(`Compatibility test config not found: ${configId}`);
    }

    const deviceInfo = await this.getDeviceCompatibilityInfo();
    
    const result: CompatibilityTestResult = {
      id: this.generateId(),
      configId,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      status: 'running',
      overallCompatibility: 0,
      platformResults: [],
      scenarioResults: [],
      issues: [],
      recommendations: [],
      deviceInfo,
    };

    this.activeTests.set(result.id, result);
    await this.saveTestResult(result);

    // Start the compatibility test
    this.executeCompatibilityTest(result, config);
    
    console.debug(`Compatibility test started: ${result.id}`);
    return result;
  }

  async stopCompatibilityTest(testId: string): Promise<CompatibilityTestResult | null> {
    const result = this.activeTests.get(testId);
    if (!result) {
      console.error(`Compatibility test not found: ${testId}`);
      return null;
    }

    result.status = 'cancelled';
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;

    this.activeTests.delete(testId);
    await this.saveTestResult(result);
    
    console.debug(`Compatibility test stopped: ${testId}`);
    return result;
  }

  async getCompatibilityTestResult(testId: string): Promise<CompatibilityTestResult | null> {
    try {
      const result = await AsyncStorage.getItem(`compatibility_test_result_${testId}`);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      console.error('Failed to get compatibility test result:', error);
      return null;
    }
  }

  async getCompatibilityTestHistory(): Promise<CompatibilityTestResult[]> {
    try {
      const results = await AsyncStorage.getItem('compatibility_test_history');
      return results ? JSON.parse(results) : [];
    } catch (error) {
      console.error('Failed to get compatibility test history:', error);
      return [];
    }
  }

  async getTestConfigs(): Promise<CompatibilityTestConfig[]> {
    return this.testConfigs;
  }

  async generateCompatibilityReport(testId: string): Promise<{
    result: CompatibilityTestResult;
    config: CompatibilityTestConfig;
    analysis: CompatibilityAnalysis;
    recommendations: CompatibilityRecommendation[];
  } | null> {
    const result = await this.getCompatibilityTestResult(testId);
    if (!result) return null;

    const config = this.testConfigs.find(c => c.id === result.configId);
    if (!config) return null;

    const analysis = this.analyzeCompatibilityResult(result, config);
    const recommendations = this.generateCompatibilityRecommendations(result, config, analysis);

    return {
      result,
      config,
      analysis,
      recommendations,
    };
  }

  async testPlatformCompatibility(platform: string, version: string): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
    performance: PerformanceMetrics;
    features: FeatureCompatibility[];
  }> {
    const issues: CompatibilityIssue[] = [];
    const features: FeatureCompatibility[] = [];

    try {
      // Test platform-specific compatibility
      const platformResult = await this.testPlatformFeatures(platform, version);
      features.push(...platformResult.features);

      // Test performance
      const performance = await this.measurePerformance();
      
      // Test UI compatibility
      const uiResult = await this.testUICompatibility(platform, version);
      if (!uiResult.compatible) {
        issues.push(...uiResult.issues);
      }

      // Test functionality
      const functionalityResult = await this.testFunctionalityCompatibility(platform, version);
      if (!functionalityResult.compatible) {
        issues.push(...functionalityResult.issues);
      }

      return {
        compatible: issues.length === 0,
        issues,
        performance,
        features,
      };
    } catch (error) {
      console.error('Error testing platform compatibility:', error);
      return {
        compatible: false,
        issues: [{
          id: this.generateId(),
          type: 'error',
          severity: 'high',
          category: 'functionality',
          platform,
          description: 'Error testing platform compatibility',
          suggestion: 'Fix compatibility testing implementation',
          impact: 'Platform compatibility cannot be verified',
        }],
        performance: await this.measurePerformance(),
        features,
      };
    }
  }

  async testNetworkCompatibility(networkCondition: NetworkCondition): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
    performance: PerformanceMetrics;
  }> {
    const issues: CompatibilityIssue[] = [];

    try {
      // Test network connectivity
      const connectivityResult = await this.testNetworkConnectivity(networkCondition);
      if (!connectivityResult.success) {
        issues.push(...connectivityResult.issues);
      }

      // Test performance under network conditions
      const performance = await this.measurePerformanceUnderNetwork(networkCondition);
      
      // Test offline functionality
      if (networkCondition.type === 'offline') {
        const offlineResult = await this.testOfflineFunctionality();
        if (!offlineResult.success) {
          issues.push(...offlineResult.issues);
        }
      }

      return {
        compatible: issues.length === 0,
        issues,
        performance,
      };
    } catch (error) {
      console.error('Error testing network compatibility:', error);
      return {
        compatible: false,
        issues: [{
          id: this.generateId(),
          type: 'error',
          severity: 'high',
          category: 'network',
          platform: 'all',
          description: 'Error testing network compatibility',
          suggestion: 'Fix network compatibility testing implementation',
          impact: 'Network compatibility cannot be verified',
        }],
        performance: await this.measurePerformance(),
      };
    }
  }

  async testBrowserCompatibility(browser: string, version: string): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
    features: FeatureCompatibility[];
  }> {
    const issues: CompatibilityIssue[] = [];
    const features: FeatureCompatibility[] = [];

    try {
      // Test browser-specific features
      const browserResult = await this.testBrowserFeatures(browser, version);
      features.push(...browserResult.features);

      // Test CSS compatibility
      const cssResult = await this.testCSSCompatibility(browser, version);
      if (!cssResult.compatible) {
        issues.push(...cssResult.issues);
      }

      // Test JavaScript compatibility
      const jsResult = await this.testJavaScriptCompatibility(browser, version);
      if (!jsResult.compatible) {
        issues.push(...jsResult.issues);
      }

      return {
        compatible: issues.length === 0,
        issues,
        features,
      };
    } catch (error) {
      console.error('Error testing browser compatibility:', error);
      return {
        compatible: false,
        issues: [{
          id: this.generateId(),
          type: 'error',
          severity: 'high',
          category: 'functionality',
          platform: 'web',
          description: 'Error testing browser compatibility',
          suggestion: 'Fix browser compatibility testing implementation',
          impact: 'Browser compatibility cannot be verified',
        }],
        features,
      };
    }
  }

  private async executeCompatibilityTest(
    result: CompatibilityTestResult,
    config: CompatibilityTestConfig,
  ): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Initialize scenario results
      config.testScenarios.forEach(scenario => {
        result.scenarioResults.push({
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          category: scenario.category,
          priority: scenario.priority,
          status: 'skipped',
          compatibility: 0,
          stepResults: [],
          issues: [],
          duration: 0,
        });
      });

      // Test each platform
      for (const platform of config.targetPlatforms) {
        await this.testPlatform(result, platform, config);
      }

      // Execute test scenarios
      for (const scenario of config.testScenarios) {
        await this.executeScenario(result, scenario, config);
      }

      // Calculate final results
      result.endTime = Date.now();
      result.duration = result.endTime - result.startTime;
      result.status = 'completed';
      
      this.calculateOverallCompatibility(result);
      await this.saveTestResult(result);
      
      console.debug(`Compatibility test completed: ${result.id}`);
    } catch (error) {
      result.status = 'failed';
      result.endTime = Date.now();
      result.duration = result.endTime - result.startTime;
      
      await this.saveTestResult(result);
      console.error(`Compatibility test failed: ${result.id}`, error);
    }
  }

  private async testPlatform(
    result: CompatibilityTestResult,
    platform: PlatformConfig,
    config: CompatibilityTestConfig,
  ): Promise<void> {
    try {
      for (const version of platform.versions) {
        const platformResult = await this.testPlatformCompatibility(platform.platform, version);
        
        result.platformResults.push({
          platform: platform.platform,
          version,
          compatibility: platformResult.compatible ? 100 : 70,
          status: platformResult.compatible ? 'compatible' : 'partially_compatible',
          issues: platformResult.issues,
          performance: platformResult.performance,
          features: platformResult.features,
        });
      }
    } catch (error) {
      console.error(`Error testing platform ${platform.platform}:`, error);
    }
  }

  private async executeScenario(
    result: CompatibilityTestResult,
    scenario: CompatibilityTestScenario,
    config: CompatibilityTestConfig,
  ): Promise<void> {
    const scenarioResult = result.scenarioResults.find(sr => sr.scenarioId === scenario.id);
    if (!scenarioResult) return;

    const scenarioStartTime = Date.now();
    let passedSteps = 0;
    const totalSteps = scenario.steps.length;

    try {
      for (const step of scenario.steps) {
        const stepResult = await this.executeStep(step, config);
        scenarioResult.stepResults.push(stepResult);
        
        if (stepResult.passed) {
          passedSteps++;
        }
      }

      // Calculate scenario compatibility
      scenarioResult.compatibility = (passedSteps / totalSteps) * 100;
      scenarioResult.status = scenarioResult.compatibility >= 80 ? 'passed' : 
                             scenarioResult.compatibility >= 60 ? 'warning' : 'failed';
      scenarioResult.duration = Date.now() - scenarioStartTime;

    } catch (error) {
      scenarioResult.status = 'failed';
      scenarioResult.duration = Date.now() - scenarioStartTime;
      console.error(`Scenario execution failed: ${scenario.name}`, error);
    }
  }

  private async executeStep(
    step: CompatibilityTestStep,
    config: CompatibilityTestConfig,
  ): Promise<CompatibilityStepResult> {
    const stepStartTime = Date.now();
    let passed = false;
    let actualResult: any = null;
    let message: string | undefined;

    try {
      switch (step.verification.type) {
        case 'element_present':
          actualResult = await this.checkElementPresent(step.target!);
          passed = actualResult;
          break;
        case 'functionality_works':
          const functionalityResult = await this.testFunctionality(step.target!);
          actualResult = functionalityResult.works;
          passed = functionalityResult.works;
          break;
        case 'performance_acceptable':
          const performanceResult = await this.measurePerformance();
          actualResult = performanceResult.loadTime;
          passed = performanceResult.loadTime <= config.performanceThresholds.loadTime;
          break;
        case 'network_connectivity':
          const networkResult = await this.testNetworkConnectivity(config.networkConditions[0]);
          actualResult = networkResult.success;
          passed = networkResult.success;
          break;
        case 'storage_available':
          const storageResult = await this.testStorageAvailability();
          actualResult = storageResult.available;
          passed = storageResult.available;
          break;
      }

      return {
        stepId: step.id,
        stepName: step.description,
        status: passed ? 'passed' : 'failed',
        verification: step.verification,
        actualResult,
        expectedResult: step.verification.expectedResult,
        passed,
        message,
        duration: Date.now() - stepStartTime,
      };
    } catch (error) {
      return {
        stepId: step.id,
        stepName: step.description,
        status: 'failed',
        verification: step.verification,
        actualResult: null,
        expectedResult: step.verification.expectedResult,
        passed: false,
        message: `Error: ${error}`,
        duration: Date.now() - stepStartTime,
      };
    }
  }

  private async testPlatformFeatures(platform: string, version: string): Promise<{
    features: FeatureCompatibility[];
  }> {
    const features: FeatureCompatibility[] = [
      {
        feature: 'Touch Gestures',
        supported: platform === 'ios' || platform === 'android',
        partial: false,
        issues: [],
      },
      {
        feature: 'Camera Access',
        supported: platform === 'ios' || platform === 'android',
        partial: false,
        issues: [],
      },
      {
        feature: 'Push Notifications',
        supported: platform === 'ios' || platform === 'android',
        partial: false,
        issues: [],
      },
      {
        feature: 'Local Storage',
        supported: true,
        partial: false,
        issues: [],
      },
      {
        feature: 'WebRTC',
        supported: platform === 'web',
        partial: false,
        issues: [],
      },
    ];

    return { features };
  }

  private async testUICompatibility(platform: string, version: string): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
  }> {
    const issues: CompatibilityIssue[] = [];
    
    // Simulate UI compatibility testing
    const compatible = Math.random() > 0.2; // 80% chance of being compatible
    
    if (!compatible) {
      issues.push({
        id: this.generateId(),
        type: 'warning',
        severity: 'medium',
        category: 'ui',
        platform,
        description: 'UI elements may not display correctly',
        suggestion: 'Test UI on target platform and adjust styling',
        impact: 'Users may experience visual issues',
      });
    }

    return { compatible, issues };
  }

  private async testFunctionalityCompatibility(platform: string, version: string): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
  }> {
    const issues: CompatibilityIssue[] = [];
    
    // Simulate functionality compatibility testing
    const compatible = Math.random() > 0.15; // 85% chance of being compatible
    
    if (!compatible) {
      issues.push({
        id: this.generateId(),
        type: 'error',
        severity: 'high',
        category: 'functionality',
        platform,
        description: 'Some features may not work correctly',
        suggestion: 'Test and fix functionality on target platform',
        impact: 'Users may experience functional issues',
      });
    }

    return { compatible, issues };
  }

  private async testFunctionality(target: string): Promise<{ works: boolean }> {
    // Simulate functionality testing
    return { works: Math.random() > 0.1 }; // 90% chance of working
  }

  private async measurePerformance(): Promise<PerformanceMetrics> {
    return {
      loadTime: 1000 + Math.random() * 2000, // 1-3 seconds
      memoryUsage: 50 + Math.random() * 100, // 50-150 MB
      cpuUsage: 10 + Math.random() * 30, // 10-40%
      batteryDrain: 5 + Math.random() * 10, // 5-15% per hour
      networkUsage: 10 + Math.random() * 50, // 10-60 MB
      frameRate: 50 + Math.random() * 10, // 50-60 FPS
      responsiveness: 80 + Math.random() * 20, // 80-100%
    };
  }

  private async measurePerformanceUnderNetwork(networkCondition: NetworkCondition): Promise<PerformanceMetrics> {
    const basePerformance = await this.measurePerformance();
    
    // Adjust performance based on network conditions
    const networkFactor = networkCondition.speed / 10; // Normalize to 0-1
    const latencyFactor = Math.max(0, 1 - networkCondition.latency / 1000); // Normalize to 0-1
    
    return {
      ...basePerformance,
      loadTime: basePerformance.loadTime / networkFactor,
      networkUsage: basePerformance.networkUsage * (1 + networkCondition.packetLoss / 100),
    };
  }

  private async testNetworkConnectivity(networkCondition: NetworkCondition): Promise<{
    success: boolean;
    issues: CompatibilityIssue[];
  }> {
    const issues: CompatibilityIssue[] = [];
    
    // Simulate network connectivity testing
    const success = Math.random() > 0.1; // 90% chance of success
    
    if (!success) {
      issues.push({
        id: this.generateId(),
        type: 'error',
        severity: 'high',
        category: 'network',
        platform: 'all',
        description: 'Network connectivity issues detected',
        suggestion: 'Check network configuration and connectivity',
        impact: 'Users may not be able to access network features',
      });
    }

    return { success, issues };
  }

  private async testOfflineFunctionality(): Promise<{
    success: boolean;
    issues: CompatibilityIssue[];
  }> {
    const issues: CompatibilityIssue[] = [];
    
    // Simulate offline functionality testing
    const success = Math.random() > 0.2; // 80% chance of success
    
    if (!success) {
      issues.push({
        id: this.generateId(),
        type: 'warning',
        severity: 'medium',
        category: 'functionality',
        platform: 'all',
        description: 'Offline functionality may not work correctly',
        suggestion: 'Implement proper offline support and caching',
        impact: 'Users may not be able to use the app offline',
      });
    }

    return { success, issues };
  }

  private async testBrowserFeatures(browser: string, version: string): Promise<{
    features: FeatureCompatibility[];
  }> {
    const features: FeatureCompatibility[] = [
      {
        feature: 'ES6 Support',
        supported: true,
        partial: false,
        issues: [],
      },
      {
        feature: 'CSS Grid',
        supported: true,
        partial: false,
        issues: [],
      },
      {
        feature: 'WebGL',
        supported: true,
        partial: false,
        issues: [],
      },
      {
        feature: 'Service Workers',
        supported: browser !== 'safari' || parseFloat(version) >= 11.1,
        partial: false,
        issues: [],
      },
    ];

    return { features };
  }

  private async testCSSCompatibility(browser: string, version: string): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
  }> {
    const issues: CompatibilityIssue[] = [];
    
    // Simulate CSS compatibility testing
    const compatible = Math.random() > 0.1; // 90% chance of being compatible
    
    if (!compatible) {
      issues.push({
        id: this.generateId(),
        type: 'warning',
        severity: 'medium',
        category: 'ui',
        platform: 'web',
        description: 'CSS compatibility issues detected',
        suggestion: 'Use browser-specific CSS prefixes and fallbacks',
        impact: 'Users may experience visual issues',
      });
    }

    return { compatible, issues };
  }

  private async testJavaScriptCompatibility(browser: string, version: string): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
  }> {
    const issues: CompatibilityIssue[] = [];
    
    // Simulate JavaScript compatibility testing
    const compatible = Math.random() > 0.05; // 95% chance of being compatible
    
    if (!compatible) {
      issues.push({
        id: this.generateId(),
        type: 'error',
        severity: 'high',
        category: 'functionality',
        platform: 'web',
        description: 'JavaScript compatibility issues detected',
        suggestion: 'Use polyfills and transpilation for older browsers',
        impact: 'Users may experience functional issues',
      });
    }

    return { compatible, issues };
  }

  private async checkElementPresent(elementId: string): Promise<boolean> {
    // Simulate element presence check
    return Math.random() > 0.1; // 90% chance of being present
  }

  private async testStorageAvailability(): Promise<{ available: boolean }> {
    // Simulate storage availability check
    return { available: Math.random() > 0.05 }; // 95% chance of being available
  }

  private async getDeviceCompatibilityInfo(): Promise<DeviceCompatibilityInfo> {
    const { width, height } = Dimensions.get('window');
    
    return {
      platform: Platform.OS,
      version: Platform.Version.toString(),
      device: Platform.OS === 'ios' ? 'iPhone' : Platform.OS === 'android' ? 'Android Device' : 'Web Browser',
      screenSize: { width, height },
      density: 2, // Default density
      memory: 4096, // Default memory in MB
      storage: 32000, // Default storage in MB
      processor: 'Unknown',
      networkType: 'wifi',
      browser: Platform.OS === 'web' ? 'Chrome' : undefined,
      browserVersion: Platform.OS === 'web' ? '100.0' : undefined,
    };
  }

  private calculateOverallCompatibility(result: CompatibilityTestResult): void {
    if (result.platformResults.length === 0) {
      result.overallCompatibility = 0;
      return;
    }

    const totalCompatibility = result.platformResults.reduce((sum, platform) => sum + platform.compatibility, 0);
    result.overallCompatibility = totalCompatibility / result.platformResults.length;
  }

  private analyzeCompatibilityResult(
    result: CompatibilityTestResult,
    config: CompatibilityTestConfig,
  ): CompatibilityAnalysis {
    return {
      overallCompatibility: result.overallCompatibility,
      platformBreakdown: this.getPlatformBreakdown(result),
      criticalIssues: result.issues.filter(i => i.severity === 'critical').length,
      highIssues: result.issues.filter(i => i.severity === 'high').length,
      mediumIssues: result.issues.filter(i => i.severity === 'medium').length,
      lowIssues: result.issues.filter(i => i.severity === 'low').length,
      categoryBreakdown: this.getCategoryBreakdown(result),
      recommendations: result.recommendations,
    };
  }

  private getPlatformBreakdown(result: CompatibilityTestResult): { [platform: string]: number } {
    const breakdown: { [platform: string]: number } = {};
    
    result.platformResults.forEach(platform => {
      const key = `${platform.platform}_${platform.version}`;
      breakdown[key] = platform.compatibility;
    });
    
    return breakdown;
  }

  private getCategoryBreakdown(result: CompatibilityTestResult): { [category: string]: number } {
    const breakdown: { [category: string]: number } = {};
    
    result.scenarioResults.forEach(scenario => {
      if (!breakdown[scenario.category]) {
        breakdown[scenario.category] = 0;
      }
      breakdown[scenario.category] += scenario.compatibility;
    });
    
    return breakdown;
  }

  private generateCompatibilityRecommendations(
    result: CompatibilityTestResult,
    config: CompatibilityTestConfig,
    analysis: CompatibilityAnalysis,
  ): CompatibilityRecommendation[] {
    const recommendations: CompatibilityRecommendation[] = [];

    if (analysis.criticalIssues > 0) {
      recommendations.push({
        id: this.generateId(),
        type: 'fix',
        priority: 'high',
        category: 'critical',
        title: 'Fix Critical Compatibility Issues',
        description: 'Address critical compatibility issues that prevent the app from working on target platforms',
        implementation: 'Review and fix all critical compatibility issues',
        effort: 'high',
        impact: 'high',
        affectedPlatforms: result.platformResults.map(p => p.platform),
      });
    }

    if (analysis.overallCompatibility < 80) {
      recommendations.push({
        id: this.generateId(),
        type: 'optimization',
        priority: 'high',
        category: 'general',
        title: 'Improve Overall Compatibility',
        description: 'Enhance overall compatibility across all target platforms',
        implementation: 'Implement comprehensive compatibility improvements',
        effort: 'high',
        impact: 'high',
        affectedPlatforms: result.platformResults.map(p => p.platform),
      });
    }

    return recommendations;
  }

  private async loadTestConfigs(): Promise<void> {
    try {
      const configs = await AsyncStorage.getItem('compatibility_test_configs');
      this.testConfigs = configs ? JSON.parse(configs) : [];
    } catch (error) {
      console.error('Failed to load test configs:', error);
      this.testConfigs = [];
    }
  }

  private async saveTestConfigs(): Promise<void> {
    try {
      await AsyncStorage.setItem('compatibility_test_configs', JSON.stringify(this.testConfigs));
    } catch (error) {
      console.error('Failed to save test configs:', error);
    }
  }

  private async saveTestResult(result: CompatibilityTestResult): Promise<void> {
    try {
      await AsyncStorage.setItem(`compatibility_test_result_${result.id}`, JSON.stringify(result));
      
      // Also save to history
      const history = await this.getCompatibilityTestHistory();
      const existingIndex = history.findIndex(r => r.id === result.id);
      
      if (existingIndex >= 0) {
        history[existingIndex] = result;
      } else {
        history.push(result);
      }
      
      await AsyncStorage.setItem('compatibility_test_history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save test result:', error);
    }
  }

  private generateId(): string {
    return `compatibility_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface CompatibilityAnalysis {
  overallCompatibility: number;
  platformBreakdown: { [platform: string]: number };
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  categoryBreakdown: { [category: string]: number };
  recommendations: CompatibilityRecommendation[];
}

export const compatibilityTestingService = new CompatibilityTestingService();
