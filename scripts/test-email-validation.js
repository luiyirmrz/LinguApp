#!/usr/bin/env node

/**
 * Email Validation Test Script for LinguApp
 * Tests comprehensive email validation with various invalid inputs
 * Validates both client-side and server-side validation
 */

const { validateEmail, validatePassword, validateName } = require('../utils/validation.ts');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔧${colors.reset} ${msg}`),
};

console.log(`${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                    EMAIL VALIDATION TEST                    ║
║                        LinguApp Project                     ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

// Test cases for email validation
const emailTestCases = [
  // Valid emails
  { email: 'test@example.com', expected: true, description: 'Valid basic email' },
  { email: 'user.name@domain.co.uk', expected: true, description: 'Valid email with subdomain' },
  { email: 'test+tag@example.org', expected: true, description: 'Valid email with plus sign' },
  { email: 'user123@test-domain.com', expected: true, description: 'Valid email with numbers and hyphens' },
  
  // Invalid emails
  { email: '', expected: false, description: 'Empty email' },
  { email: 'invalid', expected: false, description: 'No @ symbol' },
  { email: '@example.com', expected: false, description: 'Missing local part' },
  { email: 'test@', expected: false, description: 'Missing domain' },
  { email: 'test@.com', expected: false, description: 'Domain starts with dot' },
  { email: 'test@example.', expected: false, description: 'Domain ends with dot' },
  { email: 'test..test@example.com', expected: false, description: 'Consecutive dots' },
  { email: 'test@example..com', expected: false, description: 'Consecutive dots in domain' },
  { email: 'test@example.com.', expected: false, description: 'Trailing dot' },
  { email: '.test@example.com', expected: false, description: 'Leading dot' },
  { email: 'test @example.com', expected: false, description: 'Space in email' },
  { email: 'test@example .com', expected: false, description: 'Space in domain' },
  { email: 'test@example.com ', expected: false, description: 'Trailing space' },
  { email: ' test@example.com', expected: false, description: 'Leading space' },
  { email: 'test@example@com', expected: false, description: 'Multiple @ symbols' },
  { email: 'test@example.com@', expected: false, description: 'Multiple @ symbols at end' },
  { email: 'test@example.com@domain.com', expected: false, description: 'Multiple @ symbols with domains' },
  
  // Security test cases
  { email: 'test<script>@example.com', expected: false, description: 'Script tag injection' },
  { email: 'test"@example.com', expected: false, description: 'Quote injection' },
  { email: 'test\'@example.com', expected: false, description: 'Single quote injection' },
  { email: 'test<@example.com', expected: false, description: 'Angle bracket injection' },
  { email: 'test>@example.com', expected: false, description: 'Angle bracket injection' },
  { email: 'javascript:alert(1)@example.com', expected: false, description: 'JavaScript protocol' },
  { email: 'test@javascript:alert(1)', expected: false, description: 'JavaScript protocol in domain' },
  
  // Edge cases
  { email: 'a@b.c', expected: true, description: 'Minimal valid email' },
  { email: 'a@b.co', expected: true, description: 'Short domain' },
  { email: 'very.long.email.address@very.long.domain.name.com', expected: true, description: 'Long email' },
  { email: `${'a'.repeat(64)  }@example.com`, expected: false, description: 'Local part too long' },
  { email: `test@${  'a'.repeat(250)  }.com`, expected: false, description: 'Domain too long' },
];

// Test cases for password validation
const passwordTestCases = [
  // Valid passwords
  { password: 'Password123!', expected: true, description: 'Valid strong password' },
  { password: 'MySecure123@', expected: true, description: 'Valid password with special chars' },
  { password: 'Test123#', expected: true, description: 'Valid password with hash' },
  
  // Invalid passwords
  { password: '', expected: false, description: 'Empty password' },
  { password: '123', expected: false, description: 'Too short' },
  { password: 'password', expected: false, description: 'No uppercase, numbers, or special chars' },
  { password: 'PASSWORD', expected: false, description: 'No lowercase, numbers, or special chars' },
  { password: 'Password', expected: false, description: 'No numbers or special chars' },
  { password: 'Password123', expected: false, description: 'No special chars' },
  { password: 'Password!', expected: false, description: 'No numbers' },
  { password: 'pass word', expected: false, description: 'Contains spaces' },
  { password: 'password123', expected: false, description: 'Common pattern' },
  { password: '12345678', expected: false, description: 'Only numbers' },
  { password: 'qwerty123', expected: false, description: 'Sequential characters' },
];

// Test cases for name validation
const nameTestCases = [
  // Valid names
  { name: 'John Doe', expected: true, description: 'Valid full name' },
  { name: 'Mary-Jane', expected: true, description: 'Valid name with hyphen' },
  { name: "O'Connor", expected: true, description: 'Valid name with apostrophe' },
  { name: 'Jean-Luc Picard', expected: true, description: 'Valid name with multiple parts' },
  
  // Invalid names
  { name: '', expected: false, description: 'Empty name' },
  { name: 'A', expected: false, description: 'Too short' },
  { name: '123', expected: false, description: 'Only numbers' },
  { name: 'John<script>', expected: false, description: 'Script tag injection' },
  { name: 'John"', expected: false, description: 'Quote injection' },
  { name: 'John<>', expected: false, description: 'Angle bracket injection' },
  { name: 'John@Doe', expected: false, description: 'Invalid character @' },
  { name: 'John#Doe', expected: false, description: 'Invalid character #' },
  { name: 'John$Doe', expected: false, description: 'Invalid character $' },
];

// Test function
function runTests(testCases, validator, testName) {
  log.step(`Testing ${testName}...`);
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    try {
      const result = validator(testCase.email || testCase.password || testCase.name);
      const success = result.isValid === testCase.expected;
      
      if (success) {
        log.success(`${index + 1}. ${testCase.description}`);
        passed++;
      } else {
        log.error(`${index + 1}. ${testCase.description}`);
        log.error(`   Expected: ${testCase.expected}, Got: ${result.isValid}`);
        if (result.errors && result.errors.length > 0) {
          log.error(`   Errors: ${result.errors.join(', ')}`);
        }
        failed++;
      }
    } catch (error) {
      log.error(`${index + 1}. ${testCase.description} - Exception: ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\n${colors.cyan}📊 ${testName} Results:${colors.reset}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);
  
  return { passed, failed };
}

// Run all tests
async function main() {
  try {
    const emailResults = runTests(emailTestCases, validateEmail, 'Email Validation');
    const passwordResults = runTests(passwordTestCases, validatePassword, 'Password Validation');
    const nameResults = runTests(nameTestCases, validateName, 'Name Validation');
    
    const totalPassed = emailResults.passed + passwordResults.passed + nameResults.passed;
    const totalFailed = emailResults.failed + passwordResults.failed + nameResults.failed;
    const totalTests = totalPassed + totalFailed;
    
    console.log(`${colors.bright}${colors.magenta}📋 FINAL RESULTS${colors.reset}`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log(`   📈 Overall Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    
    if (totalFailed === 0) {
      log.success('All validation tests passed! Email validation is working correctly.');
    } else {
      log.warning(`${totalFailed} tests failed. Please review the validation logic.`);
    }
    
    console.log(`\n${colors.bright}${colors.green}🎉 Email validation testing completed!${colors.reset}`);
    
  } catch (error) {
    log.error('Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main();
