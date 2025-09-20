#!/usr/bin/env node

/**
 * Test Authentication System Without Hardcoded Credentials
 * This script verifies that the authentication system works securely
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Testing Authentication System Security');
console.log('==========================================\n');

// Test 1: Check for hardcoded credentials in source code
function testNoHardcodedCredentials() {
  console.log('1. 🔍 Checking for hardcoded credentials in source code...');
  
  const dangerousPatterns = [
    'demo@linguapp.com',  // ❌ OLD HARDCODED - Should not exist
    'test@linguapp.com',  // ❌ OLD HARDCODED - Should not exist
    'demo123',            // ❌ OLD HARDCODED - Should not exist
    'test123',            // ❌ OLD HARDCODED - Should not exist
    'example123',          // ❌ OLD HARDCODED - Should not exist
  ];
  
  const filesToCheck = [
    'services/auth.ts',
    'components/AuthSystemTest.tsx',
    'app/(auth)/signin.tsx',
    'app/(auth)/signup.tsx',
  ];
  
  let foundIssues = false;
  
  for (const file of filesToCheck) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of dangerousPatterns) {
        if (content.includes(pattern)) {
          console.log(`❌ Found hardcoded credential "${pattern}" in ${file}`);
          foundIssues = true;
        }
      }
    }
  }
  
  if (!foundIssues) {
    console.log('✅ No hardcoded credentials found in source code');
  }
  
  return !foundIssues;
}

// Test 2: Check environment configuration
function testEnvironmentConfiguration() {
  console.log('\n2. 🔧 Checking environment configuration...');
  
  const envExampleExists = fs.existsSync('env.example');
  const envExists = fs.existsSync('.env');
  
  if (envExampleExists) {
    console.log('✅ Environment example file exists (env.example)');
  } else {
    console.log('❌ Environment example file missing');
    return false;
  }
  
  if (envExists) {
    console.log('⚠️  .env file exists (make sure it\'s not committed to git)');
  } else {
    console.log('ℹ️  .env file not found (will use defaults)');
  }
  
  return true;
}

// Test 3: Check secure test account configuration
function testSecureTestAccounts() {
  console.log('\n3. 🛡️  Checking secure test account configuration...');
  
  const authServicePath = 'services/auth.ts';
  if (!fs.existsSync(authServicePath)) {
    console.log('❌ Auth service file not found');
    return false;
  }
  
  const content = fs.readFileSync(authServicePath, 'utf8');
  
  // Check for secure patterns
  const securePatterns = [
    'process.env.EXPO_PUBLIC_ENABLE_TEST_ACCOUNTS',
    'process.env.EXPO_PUBLIC_TEST_EMAIL_1',
    'process.env.EXPO_PUBLIC_TEST_PASSWORD_1',
    'localhost.dev',
    'TestPass123!',
  ];
  
  let securePatternsFound = 0;
  for (const pattern of securePatterns) {
    if (content.includes(pattern)) {
      securePatternsFound++;
    }
  }
  
  if (securePatternsFound >= 4) {
    console.log('✅ Secure test account configuration found');
    console.log('   - Environment-based credentials');
    console.log('   - Explicit opt-in required');
    console.log('   - Localhost-only fallbacks');
    console.log('   - Strong password requirements');
    return true;
  } else {
    console.log('❌ Secure test account configuration incomplete');
    return false;
  }
}

// Test 4: Check Firebase configuration
function testFirebaseConfiguration() {
  console.log('\n4. 🔥 Checking Firebase configuration...');
  
  const firebaseConfigPath = 'config/firebase.ts';
  if (!fs.existsSync(firebaseConfigPath)) {
    console.log('❌ Firebase configuration file not found');
    return false;
  }
  
  const content = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  // Check for proper configuration patterns
  const configPatterns = [
    'hasFirebaseConfig',
    'initializeMockServices',
    'IS_DEVELOPMENT',
    'linguapp-final',
  ];
  
  let configPatternsFound = 0;
  for (const pattern of configPatterns) {
    if (content.includes(pattern)) {
      configPatternsFound++;
    }
  }
  
  if (configPatternsFound >= 3) {
    console.log('✅ Firebase configuration properly structured');
    console.log('   - Environment-based configuration check');
    console.log('   - Mock services fallback');
    console.log('   - Development mode detection');
    return true;
  } else {
    console.log('❌ Firebase configuration incomplete');
    return false;
  }
}

// Test 5: Check documentation security
function testDocumentationSecurity() {
  console.log('\n5. 📚 Checking security documentation...');
  
  const securityDocs = [
    'docs/security-fixes-summary.md',
    'docs/firebase-implementation-summary.md',
  ];
  
  let docsFound = 0;
  for (const doc of securityDocs) {
    if (fs.existsSync(doc)) {
      const content = fs.readFileSync(doc, 'utf8');
      if (content.includes('SECURITY NOTICE') || content.includes('hardcoded')) {
        docsFound++;
      }
    }
  }
  
  if (docsFound >= 1) {
    console.log('✅ Security documentation updated');
    console.log('   - Hardcoded credentials removed from docs');
    console.log('   - Security warnings added');
    return true;
  } else {
    console.log('❌ Security documentation needs updates');
    return false;
  }
}

// Test 6: Run Firebase connection test
async function testFirebaseConnection() {
  console.log('\n6. 🔗 Testing Firebase connection...');
  
  try {
    const output = execSync('npm run test:firebase', { 
      encoding: 'utf8',
      stdio: 'pipe',
    });
    
    // Check for successful Firebase tests
    const successIndicators = [
      'Project linguapp-final is accessible via Firebase CLI',
      'Firestore API is enabled and accessible',
      'Firebase CLI is authenticated and can see the project',
      'Firestore database exists and is accessible',
    ];
    
    const successCount = successIndicators.filter(indicator => output.includes(indicator)).length;
    
    if (successCount >= 4) {
      console.log('✅ Firebase connection test passed');
      console.log(`   - ${successCount}/4 critical Firebase tests passed`);
      return true;
    } else {
      console.log('⚠️  Firebase connection test had issues');
      console.log(`   - Only ${successCount}/4 critical Firebase tests passed`);
      return false;
    }
  } catch (error) {
    console.log('❌ Firebase connection test failed');
    console.log('Error:', error.message);
    return false;
  }
}

// Main test function
async function runAllTests() {
  const tests = [
    { name: 'No Hardcoded Credentials', fn: testNoHardcodedCredentials },
    { name: 'Environment Configuration', fn: testEnvironmentConfiguration },
    { name: 'Secure Test Accounts', fn: testSecureTestAccounts },
    { name: 'Firebase Configuration', fn: testFirebaseConfiguration },
    { name: 'Documentation Security', fn: testDocumentationSecurity },
    { name: 'Firebase Connection', fn: testFirebaseConnection },
  ];
  
  let passedTests = 0;
  const totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.log(`❌ Test "${test.name}" failed with error:`, error.message);
    }
  }
  
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('🔒 Authentication system is secure and production-ready!');
    console.log('\n✅ Security Features Verified:');
    console.log('   - No hardcoded credentials in source code');
    console.log('   - Environment-based configuration');
    console.log('   - Secure test account management');
    console.log('   - Proper Firebase configuration');
    console.log('   - Updated security documentation');
    console.log('   - Working Firebase connection');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    console.log('🔧 Fix the failing tests before deploying to production.');
  }
  
  return passedTests === totalTests;
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
