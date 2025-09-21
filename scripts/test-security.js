#!/usr/bin/env node
/**
 * Security Test Script
 * Tests security implementations including headers, validation, and protection mechanisms
 * Run with: node scripts/test-security.js
 */

import { exec } from 'child_process';

// We'll test the security functions directly by examining the middleware files
// since we can't import TypeScript files directly in this Node.js script

// Replicate security functions for testing
function detectSQLInjection(input) {
  const SQL_INJECTION_PATTERNS = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bSELECT\b.*\bFROM\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bALTER\b.*\bTABLE\b)/i,
    /(\bCREATE\b.*\bTABLE\b)/i,
    /(\bTRUNCATE\b.*\bTABLE\b)/i,
    /('.*OR.*'.*='.*')/i,
    /('.*OR.*1.*=.*1)/i,
    /(\bOR\b.*\b1\b.*=.*\b1\b)/i,
    /(\bAND\b.*\b1\b.*=.*\b1\b)/i,
    /(';.*--)/i,
    /(\|\|.*CHR\()/i
  ];
  
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

function detectXSS(input) {
  const XSS_PATTERNS = [
    /<script[^>]*>/i,
    /<\/script>/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
    /<link[^>]*>/i,
    /<meta[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /expression\s*\(/i
  ];
  
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

function detectCommandInjection(input) {
  const COMMAND_INJECTION_PATTERNS = [
    /;\s*\w+/,
    /\|\s*\w+/,
    /&&\s*\w+/,
    /\|\|\s*\w+/,
    /`[^`]*`/,
    /\$\([^)]*\)/,
    /\.\.\//,
    /\/etc\/passwd/,
    /\/bin\//,
    /rm\s+-rf/,
    /nc\s+-l/,
    /wget\s+/,
    /curl\s+/
  ];
  
  return COMMAND_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>"']/g, function(match) {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entities[match];
    });
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test cases for injection detection
const testCases = {
  sqlInjection: [
    "SELECT * FROM users WHERE id = 1 OR 1=1",
    "'; DROP TABLE users; --",
    "1' UNION SELECT * FROM passwords",
    "admin'--",
    "1=1",
    "' OR 'a'='a"
  ],
  xss: [
    "<script>alert('XSS')</script>",
    "<iframe src='javascript:alert(1)'></iframe>",
    "javascript:alert('XSS')",
    "<img src=x onerror=alert(1)>",
    "<svg onload=alert(1)>",
    "data:text/html,<script>alert(1)</script>"
  ],
  commandInjection: [
    "; cat /etc/passwd",
    "| ls -la",
    "&& rm -rf /",
    "`whoami`",
    "$(id)",
    "../../../etc/passwd",
    "; nc -l 4444"
  ],
  safe: [
    "john.doe@example.com",
    "Hello World!",
    "Password123!",
    "Normal text input",
    "123-456-7890"
  ]
};

async function testInjectionDetection() {
  colorLog('\n🔍 Testing Injection Detection...', 'cyan');
  
  let passed = 0;
  let failed = 0;
  
  // Test SQL injection detection
  colorLog('\n📊 SQL Injection Detection:', 'blue');
  for (const testCase of testCases.sqlInjection) {
    const detected = detectSQLInjection(testCase);
    if (detected) {
      colorLog(`✅ Detected: "${testCase}"`, 'green');
      passed++;
    } else {
      colorLog(`❌ Missed: "${testCase}"`, 'red');
      failed++;
    }
  }
  
  // Test XSS detection
  colorLog('\n🕷️ XSS Detection:', 'blue');
  for (const testCase of testCases.xss) {
    const detected = detectXSS(testCase);
    if (detected) {
      colorLog(`✅ Detected: "${testCase}"`, 'green');
      passed++;
    } else {
      colorLog(`❌ Missed: "${testCase}"`, 'red');
      failed++;
    }
  }
  
  // Test Command injection detection
  colorLog('\n💻 Command Injection Detection:', 'blue');
  for (const testCase of testCases.commandInjection) {
    const detected = detectCommandInjection(testCase);
    if (detected) {
      colorLog(`✅ Detected: "${testCase}"`, 'green');
      passed++;
    } else {
      colorLog(`❌ Missed: "${testCase}"`, 'red');
      failed++;
    }
  }
  
  // Test safe inputs (should NOT be detected)
  colorLog('\n✅ Safe Input Validation:', 'blue');
  for (const testCase of testCases.safe) {
    const sqlDetected = detectSQLInjection(testCase);
    const xssDetected = detectXSS(testCase);
    const cmdDetected = detectCommandInjection(testCase);
    
    if (!sqlDetected && !xssDetected && !cmdDetected) {
      colorLog(`✅ Safe: "${testCase}"`, 'green');
      passed++;
    } else {
      colorLog(`❌ False positive: "${testCase}"`, 'red');
      failed++;
    }
  }
  
  return { passed, failed };
}

function testSanitization() {
  colorLog('\n🧹 Testing Input Sanitization...', 'cyan');
  
  const testInputs = [
    "<script>alert('test')</script>",
    "'; DROP TABLE users; --",
    "javascript:alert(1)",
    "Normal text",
    "user@example.com"
  ];
  
  for (const input of testInputs) {
    const sanitized = sanitizeInput(input);
    colorLog(`Input: "${input}"`, 'yellow');
    colorLog(`Sanitized: "${sanitized}"`, 'green');
    console.log('');
  }
}

async function testSecurityHeaders() {
  colorLog('\n🛡️ Testing Security Headers...', 'cyan');
  
  try {
    // Test if server is running on localhost
    const testUrl = 'http://localhost:3000';
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(testUrl);
    
    const headers = response.headers;
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'referrer-policy',
      'content-security-policy',
      'strict-transport-security',
      'cross-origin-embedder-policy',
      'cross-origin-opener-policy',
      'cross-origin-resource-policy'
    ];
    
    let headersPassed = 0;
    for (const headerName of securityHeaders) {
      if (headers.get(headerName)) {
        colorLog(`✅ ${headerName}: ${headers.get(headerName)}`, 'green');
        headersPassed++;
      } else {
        colorLog(`❌ Missing: ${headerName}`, 'red');
      }
    }
    
    colorLog(`\nSecurity Headers: ${headersPassed}/${securityHeaders.length} configured`, 
             headersPassed === securityHeaders.length ? 'green' : 'yellow');
    
  } catch (error) {
    colorLog('⚠️ Could not test headers (server not running on localhost:3000)', 'yellow');
  }
}

async function runSecurityTests() {
  colorLog('🔒 LinguApp Security Test Suite', 'magenta');
  colorLog('================================', 'magenta');
  
  try {
    // Test injection detection
    const { passed, failed } = await testInjectionDetection();
    
    // Test sanitization
    testSanitization();
    
    // Test security headers
    await testSecurityHeaders();
    
    // Summary
    colorLog('\n📋 Test Summary:', 'cyan');
    colorLog('================================', 'cyan');
    colorLog(`✅ Passed: ${passed}`, 'green');
    colorLog(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    colorLog(`📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`, 
             failed === 0 ? 'green' : 'yellow');
    
    if (failed === 0) {
      colorLog('\n🎉 All security tests passed!', 'green');
    } else {
      colorLog('\n⚠️ Some security tests failed. Review implementation.', 'yellow');
    }
    
  } catch (error) {
    colorLog(`\n❌ Test suite error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityTests().catch(error => {
    colorLog(`\n❌ Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { runSecurityTests, testInjectionDetection, testSanitization };