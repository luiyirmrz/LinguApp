#!/usr/bin/env node

/**
 * E2E Test Coverage Verification Script
 * Verifies that critical user flows have proper E2E test coverage
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 E2E Test Coverage Verification');
console.log('==================================\n');

// Critical user flows that need E2E test coverage
const criticalFlows = [
  {
    id: 'auth_signup',
    name: 'User Registration',
    description: 'New user account creation with email/password',
    priority: 'HIGH',
    files: ['TC001', 'TC002'],
  },
  {
    id: 'auth_signin',
    name: 'User Authentication',
    description: 'Existing user login with email/password',
    priority: 'HIGH',
    files: ['TC001', 'TC002'],
  },
  {
    id: 'auth_social',
    name: 'Social Authentication',
    description: 'Login with Google, Apple, GitHub providers',
    priority: 'HIGH',
    files: ['TC003'],
  },
  {
    id: 'onboarding',
    name: 'User Onboarding',
    description: 'Language selection and initial setup',
    priority: 'HIGH',
    files: ['TC004', 'TC005'],
  },
  {
    id: 'lesson_progression',
    name: 'Lesson Progression',
    description: 'CEFR-based lesson unlocking and completion',
    priority: 'HIGH',
    files: ['TC006', 'TC007'],
  },
  {
    id: 'gamification',
    name: 'Gamification System',
    description: 'XP earning, leveling, achievements',
    priority: 'MEDIUM',
    files: ['TC008', 'TC009'],
  },
  {
    id: 'speech_recognition',
    name: 'Speech Recognition',
    description: 'Pronunciation practice and feedback',
    priority: 'MEDIUM',
    files: ['TC009', 'TC010'],
  },
  {
    id: 'offline_sync',
    name: 'Offline Synchronization',
    description: 'Data sync between local and cloud storage',
    priority: 'MEDIUM',
    files: ['TC011', 'TC012'],
  },
  {
    id: 'progress_tracking',
    name: 'Progress Tracking',
    description: 'User progress analytics and reporting',
    priority: 'MEDIUM',
    files: ['TC013', 'TC014'],
  },
  {
    id: 'error_handling',
    name: 'Error Handling',
    description: 'Graceful error handling and recovery',
    priority: 'HIGH',
    files: ['TC015', 'TC016'],
  },
];

// Test directories to check
const testDirs = [
  '__tests__/integration',
  'testsprite_tests',
];

function findTestFiles() {
  const testFiles = [];
  
  for (const dir of testDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true });
      for (const file of files) {
        if (typeof file === 'string' && (file.endsWith('.test.js') || file.endsWith('.test.ts') || file.endsWith('.test.tsx') || file.endsWith('.py'))) {
          testFiles.push(path.join(dir, file));
        }
      }
    }
  }
  
  return testFiles;
}

function analyzeTestCoverage() {
  console.log('1. 📁 Scanning for E2E test files...');
  
  const testFiles = findTestFiles();
  console.log(`   Found ${testFiles.length} test files:`);
  
  testFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  
  console.log('\n2. 🔍 Analyzing test coverage for critical flows...\n');
  
  let totalCoverage = 0;
  let highPriorityCoverage = 0;
  let mediumPriorityCoverage = 0;
  
  for (const flow of criticalFlows) {
    const coverage = analyzeFlowCoverage(flow, testFiles);
    totalCoverage += coverage.percentage;
    
    if (flow.priority === 'HIGH') {
      highPriorityCoverage += coverage.percentage;
    } else {
      mediumPriorityCoverage += coverage.percentage;
    }
    
    console.log(`${flow.priority === 'HIGH' ? '🔴' : '🟡'} ${flow.name}`);
    console.log(`   Description: ${flow.description}`);
    console.log(`   Coverage: ${coverage.percentage}% (${coverage.foundTests}/${flow.files.length} test files found)`);
    
    if (coverage.missingTests.length > 0) {
      console.log(`   ❌ Missing tests: ${coverage.missingTests.join(', ')}`);
    } else {
      console.log('   ✅ All required tests found');
    }
    console.log('');
  }
  
  const avgCoverage = totalCoverage / criticalFlows.length;
  const avgHighPriorityCoverage = highPriorityCoverage / criticalFlows.filter(f => f.priority === 'HIGH').length;
  const avgMediumPriorityCoverage = mediumPriorityCoverage / criticalFlows.filter(f => f.priority === 'MEDIUM').length;
  
  return {
    totalCoverage: avgCoverage,
    highPriorityCoverage: avgHighPriorityCoverage,
    mediumPriorityCoverage: avgMediumPriorityCoverage,
    testFiles: testFiles.length,
  };
}

function analyzeFlowCoverage(flow, testFiles) {
  let foundTests = 0;
  const missingTests = [];
  
  for (const testId of flow.files) {
    const found = testFiles.some(file => 
      file.includes(testId) || 
      file.includes(testId.toLowerCase()) ||
      file.includes(testId.replace('TC', 'tc')),
    );
    
    if (found) {
      foundTests++;
    } else {
      missingTests.push(testId);
    }
  }
  
  const percentage = (foundTests / flow.files.length) * 100;
  
  return {
    percentage: Math.round(percentage),
    foundTests,
    missingTests,
  };
}

function checkTestConfiguration() {
  console.log('3. ⚙️  Checking test configuration...');
  
  const configFiles = [
    'config/environment.ts',
    'services/testing.ts',
    'scripts/run-tests.ts',
  ];
  
  let configIssues = 0;
  
  for (const configFile of configFiles) {
    if (fs.existsSync(configFile)) {
      const content = fs.readFileSync(configFile, 'utf8');
      
      if (content.includes('enableE2ETests: false')) {
        console.log(`   ❌ ${configFile}: E2E tests disabled`);
        configIssues++;
      } else if (content.includes('enableE2ETests: true')) {
        console.log(`   ✅ ${configFile}: E2E tests enabled`);
      } else {
        console.log(`   ⚠️  ${configFile}: E2E test setting not found`);
      }
    } else {
      console.log(`   ❌ ${configFile}: Configuration file not found`);
      configIssues++;
    }
  }
  
  return configIssues === 0;
}

function generateRecommendations(coverage) {
  console.log('4. 💡 Recommendations:');
  console.log('=====================\n');
  
  if (coverage.totalCoverage < 70) {
    console.log('🔴 CRITICAL: E2E test coverage is below 70%');
    console.log('   - Implement missing high-priority test cases');
    console.log('   - Focus on authentication and onboarding flows first');
    console.log('   - Consider using TestSprite or similar E2E testing tools\n');
  } else if (coverage.totalCoverage < 90) {
    console.log('🟡 WARNING: E2E test coverage is below 90%');
    console.log('   - Add missing test cases for better coverage');
    console.log('   - Ensure all critical user flows are tested\n');
  } else {
    console.log('✅ EXCELLENT: E2E test coverage is above 90%');
    console.log('   - Maintain current test coverage');
    console.log('   - Consider adding performance and accessibility tests\n');
  }
  
  if (coverage.highPriorityCoverage < 100) {
    console.log('🔴 HIGH PRIORITY: Some critical flows lack test coverage');
    console.log('   - Authentication flows must have 100% coverage');
    console.log('   - Onboarding flows must have 100% coverage');
    console.log('   - Error handling flows must have 100% coverage\n');
  }
  
  console.log('📋 Next Steps:');
  console.log('1. Run: npm run test:e2e to execute E2E tests');
  console.log('2. Run: npm run test:integration to execute integration tests');
  console.log('3. Review test results and fix any failing tests');
  console.log('4. Add missing test cases for uncovered flows');
  console.log('5. Set up CI/CD pipeline to run E2E tests automatically\n');
}

function main() {
  try {
    const coverage = analyzeTestCoverage();
    const configOk = checkTestConfiguration();
    
    console.log('📊 Coverage Summary:');
    console.log('===================');
    console.log(`Total Coverage: ${coverage.totalCoverage.toFixed(1)}%`);
    console.log(`High Priority Coverage: ${coverage.highPriorityCoverage.toFixed(1)}%`);
    console.log(`Medium Priority Coverage: ${coverage.mediumPriorityCoverage.toFixed(1)}%`);
    console.log(`Test Files Found: ${coverage.testFiles}`);
    console.log(`Configuration Status: ${configOk ? '✅ OK' : '❌ Issues Found'}\n`);
    
    generateRecommendations(coverage);
    
    // Overall assessment
    if (coverage.totalCoverage >= 90 && configOk) {
      console.log('🎉 EXCELLENT: E2E test coverage is production-ready!');
      console.log('✅ All critical flows are properly tested');
      console.log('✅ Test configuration is correct');
      return true;
    } else if (coverage.totalCoverage >= 70 && configOk) {
      console.log('⚠️  GOOD: E2E test coverage is acceptable but can be improved');
      console.log('🔧 Consider adding more test cases for better coverage');
      return true;
    } else {
      console.log('❌ POOR: E2E test coverage needs significant improvement');
      console.log('🚨 Do not deploy to production without proper E2E test coverage');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error during E2E coverage verification:', error.message);
    return false;
  }
}

// Run the verification
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main };
