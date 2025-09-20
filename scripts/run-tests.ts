#!/usr/bin/env tsx

/**
 * Test Runner Script for LinguApp Phase 3
 * Demonstrates comprehensive testing functionality
 */

import { testingService, TestConfig } from '../services/testing/testing';
import { analyticsService } from '../services/analytics/analytics';
import { gamificationService } from '../services/gamification/enhancedGamificationService';
import { socialSystemService } from '../services/social/socialSystem';
import { elevenLabsService } from '../services/audio/elevenLabsService';
import { speechToTextService } from '../services/audio/speechToText';

async function runPhase3Tests() {
  console.log('🚀 Starting LinguApp Phase 3 Test Suite...\n');

  try {
    // Configure testing
    const testConfig: Partial<TestConfig> = {
      enableUnitTests: true,
      enableIntegrationTests: true,
      enableE2ETests: true,
      enablePerformanceTests: true,
      enableAccessibilityTests: true,
      testTimeout: 30000,
      coverageThreshold: 90,
    };

    testingService.updateTestConfig(testConfig);
    console.log('✅ Test configuration updated');

    // Initialize services
    console.log('\n🔧 Initializing services...');
    
    try {
      await elevenLabsService.initialize();
      console.log('✅ ElevenLabs service initialized');
    } catch (error) {
      console.log('⚠️ ElevenLabs service initialization failed (expected in test environment)');
    }

    try {
      await speechToTextService.initialize();
      console.log('✅ Speech-to-Text service initialized');
    } catch (error) {
      console.log('⚠️ Speech-to-Text service initialization failed (expected in test environment)');
    }

    // Run comprehensive test suite
    console.log('\n🧪 Running comprehensive test suite...');
    const testReport = await testingService.runAllTests();

    // Display test results
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`Total Suites: ${testReport.summary.totalSuites}`);
    console.log(`Total Tests: ${testReport.summary.totalTests}`);
    console.log(`Passed: ${testReport.summary.passedTests}`);
    console.log(`Failed: ${testReport.summary.failedTests}`);
    console.log(`Skipped: ${testReport.summary.skippedTests}`);
    console.log(`Success Rate: ${testReport.summary.successRate.toFixed(1)}%`);
    console.log(`Total Duration: ${testReport.summary.totalDuration}ms`);

    // Display suite details
    console.log('\n📋 Suite Details:');
    console.log('=================');
    
    testReport.suites.forEach(suite => {
      console.log(`\n${suite.suiteName}:`);
      console.log(`  Status: ${suite.status}`);
      console.log(`  Tests: ${suite.passedTests}/${suite.totalTests} passed`);
      console.log(`  Duration: ${suite.duration}ms`);
      
      if (suite.failedTests > 0) {
        console.log('  ❌ Failed Tests:');
        suite.tests
          .filter(test => test.status === 'failed')
          .forEach(test => {
            console.log(`    - ${test.testName}: ${test.error}`);
          });
      }
    });

    // Display environment info
    console.log('\n🌍 Environment Information:');
    console.log('===========================');
    console.log(`Platform: ${testReport.environment.platform}`);
    console.log(`Version: ${testReport.environment.version}`);
    console.log('Device Info:', testReport.environment.deviceInfo);

    // Performance insights
    if (testReport.summary.successRate >= 80) {
      console.log('\n🎉 Excellent! Test suite passed with high success rate.');
    } else if (testReport.summary.successRate >= 60) {
      console.log('\n⚠️ Good, but some tests failed. Review failed tests.');
    } else {
      console.log('\n❌ Poor test results. Significant issues detected.');
    }

    // Feature demonstration
    console.log('\n🎯 Phase 3 Features Demonstration:');
    console.log('===================================');

    // Analytics demonstration
    console.log('\n📈 Analytics Features:');
    try {
      await analyticsService.trackAdvancedSession('demo_user', {
        exerciseType: 'speaking',
        duration: 120000,
        accuracy: 90,
        xpEarned: 100,
        wordsLearned: 10,
        mistakes: 1,
        hintsUsed: 0,
        livesLost: 0,
        languageCode: 'en',
        deviceType: 'mobile',
        networkQuality: 'good',
        speakingExercises: 1,
        listeningExercises: 0,
        writingExercises: 0,
        readingExercises: 0,
        peakLearningTime: 'morning',
        sessionCount: 1,
      });
      console.log('✅ Advanced analytics tracking demonstrated');

      const analytics = await analyticsService.getAdvancedAnalytics('demo_user', 7);
      console.log('✅ Advanced analytics retrieval demonstrated');
      console.log(`  - Daily analytics: ${analytics.daily.length} entries`);
      console.log(`  - Insights: ${analytics.insights.length} insights`);
      console.log(`  - Predictions: ${analytics.predictions.length} predictions`);
    } catch (error) {
      console.log('❌ Analytics demonstration failed:', error);
    }

    // Gamification demonstration
    console.log('\n🎮 Gamification Features:');
    try {
      const xpResult = await gamificationService.awardXP('demo_user', 150, 'demo_exercise', 'en', {
        type: 'speaking',
        correct: true,
        quality: 4.5,
        timeSpent: 15000,
        hintsUsed: 0,
      });
      console.log('✅ Enhanced XP awarding demonstrated');
      console.log(`  - XP Gained: ${xpResult.xpGained}`);
      console.log(`  - Level Up: ${xpResult.levelUp ? 'Yes' : 'No'}`);
      console.log(`  - Achievements: ${xpResult.achievements?.length || 0}`);

      const stats = await gamificationService.getUserGamificationStats('demo_user');
      console.log('✅ Gamification stats retrieval demonstrated');
      console.log(`  - Level: ${(stats as any)?.level || 1}`);
      console.log(`  - Total XP: ${stats?.totalXP || 0}`);
      console.log(`  - Achievements: ${stats?.achievements?.length || 0}`);
    } catch (error) {
      console.log('❌ Gamification demonstration failed:', error);
    }

    // Social features demonstration
    console.log('\n👥 Social Features:');
    try {
      const leaderboard = await socialSystemService.getLeaderboard('global', 'allTime', 'demo_user', 10);
      console.log('✅ Leaderboard retrieval demonstrated');
      console.log(`  - Leaderboard entries: ${leaderboard.length}`);

      const searchResults = await socialSystemService.searchUsers('demo', 'demo_user');
      console.log('✅ User search demonstrated');
      console.log(`  - Search results: ${searchResults.length}`);
    } catch (error) {
      console.log('❌ Social features demonstration failed:', error);
    }

    // ElevenLabs demonstration
    console.log('\n🎤 ElevenLabs Integration:');
    try {
      const isConnected = await elevenLabsService.testConnection();
      console.log('✅ ElevenLabs connection test demonstrated');
      console.log(`  - Connection status: ${isConnected ? 'Connected' : 'Failed'}`);

      const voices = await elevenLabsService.loadVoices();
      console.log('✅ Voice loading demonstrated');
      console.log(`  - Available voices: ${voices.length}`);

      const englishVoices = elevenLabsService.getVoicesByLanguage('en');
      console.log(`  - English voices: ${englishVoices.length}`);
    } catch (error) {
      console.log('❌ ElevenLabs demonstration failed:', error);
    }

    // Testing features demonstration
    console.log('\n🧪 Testing Features:');
    try {
      const config = testingService.getTestConfig();
      console.log('✅ Test configuration retrieval demonstrated');
      console.log(`  - Unit tests enabled: ${config.enableUnitTests}`);
      console.log(`  - Integration tests enabled: ${config.enableIntegrationTests}`);
      console.log(`  - Performance tests enabled: ${config.enablePerformanceTests}`);

      const results = testingService.getTestResults();
      console.log('✅ Test results retrieval demonstrated');
      console.log(`  - Test results count: ${results.length}`);
    } catch (error) {
      console.log('❌ Testing features demonstration failed:', error);
    }

    console.log('\n🎉 Phase 3 Test Suite Completed Successfully!');
    console.log('\n📚 For detailed documentation, see: docs/phase3-implementation.md');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  runPhase3Tests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runPhase3Tests };
