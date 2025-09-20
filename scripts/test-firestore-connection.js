#!/usr/bin/env node

/**
 * Firestore Connection Test Script for LinguApp
 * Tests Firestore connectivity and configuration
 * Provides detailed diagnostics and troubleshooting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Project configuration
const PROJECT_ID = 'linguapp-final';

console.log(`${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                  FIRESTORE CONNECTION TEST                  ║
║                        LinguApp Project                     ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

// Test 1: Environment Configuration
function testEnvironmentConfig() {
  log.step('Test 1: Environment Configuration');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');
  
  if (fs.existsSync(envPath)) {
    log.success('.env file found');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
      'EXPO_PUBLIC_FIREBASE_API_KEY',
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    ];
    
    let allVarsPresent = true;
    requiredVars.forEach(varName => {
      if (envContent.includes(varName)) {
        log.success(`${varName} is configured`);
      } else {
        log.error(`${varName} is missing`);
        allVarsPresent = false;
      }
    });
    
    if (allVarsPresent) {
      log.success('All required environment variables are present');
    } else {
      log.warning('Some environment variables are missing');
      log.info('Copy env.example to .env and fill in your Firebase configuration');
    }
  } else {
    log.warning('.env file not found');
    if (fs.existsSync(envExamplePath)) {
      log.info('Copy env.example to .env and configure your Firebase settings');
    }
  }
  
  console.log();
}

// Test 2: Firebase Project Access
function testProjectAccess() {
  log.step('Test 2: Firebase Project Access');
  
  try {
    // Use Firebase CLI instead of gcloud for better compatibility
    const result = execSync('firebase projects:list', { 
      stdio: 'pipe',
      encoding: 'utf8',
    });
    
    if (result.includes(PROJECT_ID)) {
      log.success(`Project ${PROJECT_ID} is accessible via Firebase CLI`);
      // Extract project info from Firebase CLI output
      const lines = result.split('\n');
      for (const line of lines) {
        if (line.includes(PROJECT_ID)) {
          const parts = line.split(/\s+/);
          if (parts.length >= 3) {
            log.info(`Project Name: ${parts[0]}`);
            log.info(`Project Number: ${parts[2]}`);
          }
          break;
        }
      }
    } else {
      log.error(`Cannot access project ${PROJECT_ID}`);
      log.info('Make sure you are authenticated with Firebase CLI');
      log.info('Run: firebase login');
    }
    
  } catch (error) {
    log.error(`Cannot access project ${PROJECT_ID}`);
    log.info('Make sure you are authenticated with Firebase CLI');
    log.info('Run: firebase login');
  }
  
  console.log();
}

// Test 3: Firestore API Status
function testFirestoreAPI() {
  log.step('Test 3: Firestore API Status');
  
  try {
    // Use Firebase CLI to check Firestore status
    const result = execSync('firebase firestore:databases:list', { 
      stdio: 'pipe',
      encoding: 'utf8',
    });
    
    if (result.includes('(default)')) {
      log.success('Firestore API is enabled and accessible');
    } else {
      log.error('Firestore API is not enabled');
      log.info('Run: npm run enable:firestore');
    }
  } catch (error) {
    log.error('Cannot check Firestore API status');
    log.info('Make sure you have proper permissions');
  }
  
  console.log();
}

// Test 4: Firebase CLI Authentication
function testFirebaseAuth() {
  log.step('Test 4: Firebase CLI Authentication');
  
  try {
    const result = execSync('firebase projects:list', { stdio: 'pipe', encoding: 'utf8' });
    
    if (result.includes(PROJECT_ID)) {
      log.success('Firebase CLI is authenticated and can see the project');
    } else {
      log.warning('Firebase CLI is authenticated but project not found in list');
      log.info('Run: firebase use --add');
    }
  } catch (error) {
    log.error('Firebase CLI authentication failed');
    log.info('Run: firebase login');
  }
  
  console.log();
}

// Test 5: Firestore Database Status
function testFirestoreDatabase() {
  log.step('Test 5: Firestore Database Status');
  
  try {
    // Use Firebase CLI to check database status
    const result = execSync('firebase firestore:databases:list', { 
      stdio: 'pipe',
      encoding: 'utf8',
    });
    
    if (result.includes('(default)')) {
      log.success('Firestore database exists and is accessible');
      
      // Extract database info from Firebase CLI output
      const lines = result.split('\n');
      for (const line of lines) {
        if (line.includes('(default)')) {
          log.info(`Database: ${line.trim()}`);
          break;
        }
      }
    } else {
      log.warning('No Firestore database found');
      log.info('Create database in Firebase Console or run: firebase init firestore');
    }
  } catch (error) {
    log.error('Cannot check Firestore database status');
    log.info('Make sure Firestore API is enabled first');
  }
  
  console.log();
}

// Test 6: Security Rules
function testSecurityRules() {
  log.step('Test 6: Security Rules');
  
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  
  if (fs.existsSync(rulesPath)) {
    log.success('firestore.rules file found');
    
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    
    // Check for basic security patterns
    const securityChecks = [
      { pattern: /rules_version = '2'/, name: 'Rules version 2' },
      { pattern: /service cloud\.firestore/, name: 'Firestore service declaration' },
      { pattern: /request\.auth != null/, name: 'Authentication checks' },
      { pattern: /request\.auth\.uid/, name: 'User ID validation' },
      { pattern: /allow read, write: if false/, name: 'Default deny rule' },
    ];
    
    securityChecks.forEach(check => {
      if (check.pattern.test(rulesContent)) {
        log.success(`${check.name} is present`);
      } else {
        log.warning(`${check.name} is missing`);
      }
    });
  } else {
    log.warning('firestore.rules file not found');
    log.info('Create firestore.rules file with proper security rules');
  }
  
  console.log();
}

// Test 7: Network Connectivity
function testNetworkConnectivity() {
  log.step('Test 7: Network Connectivity');
  
  const testUrls = [
    'https://firestore.googleapis.com',
    'https://firebase.googleapis.com',
    'https://identitytoolkit.googleapis.com',
  ];
  
  testUrls.forEach(url => {
    try {
      execSync(`curl -s --connect-timeout 5 ${url}`, { stdio: 'pipe' });
      log.success(`Can reach ${url}`);
    } catch (error) {
      log.warning(`Cannot reach ${url}`);
    }
  });
  
  console.log();
}

// Test 8: Application Configuration
function testAppConfiguration() {
  log.step('Test 8: Application Configuration');
  
  const firebaseConfigPath = path.join(process.cwd(), 'config', 'firebase.ts');
  
  if (fs.existsSync(firebaseConfigPath)) {
    log.success('Firebase configuration file found');
    
    const configContent = fs.readFileSync(firebaseConfigPath, 'utf8');
    
    // Check for important configuration elements
    const configChecks = [
      { pattern: /initializeApp/, name: 'Firebase app initialization' },
      { pattern: /getFirestore|initializeFirestore/, name: 'Firestore initialization' },
      { pattern: /process\.env\.EXPO_PUBLIC_FIREBASE/, name: 'Environment variable usage' },
      { pattern: /checkFirestoreConnection/, name: 'Connection health checks' },
      { pattern: /retryFirestoreConnection/, name: 'Connection retry logic' },
    ];
    
    configChecks.forEach(check => {
      if (check.pattern.test(configContent)) {
        log.success(`${check.name} is implemented`);
      } else {
        log.warning(`${check.name} is missing`);
      }
    });
  } else {
    log.error('Firebase configuration file not found');
  }
  
  console.log();
}

// Generate Summary Report
function generateSummary() {
  log.step('Summary Report');
  
  console.log(`${colors.bright}${colors.cyan}📋 Next Steps:${colors.reset}`);
  console.log('1. Ensure all environment variables are configured in .env');
  console.log('2. Enable Firestore API: npm run enable:firestore');
  console.log('3. Deploy security rules: firebase deploy --only firestore:rules');
  console.log('4. Test the connection: npm run test:firebase');
  console.log('5. Restart your application');
  
  console.log(`\n${colors.bright}${colors.yellow}🔗 Useful Links:${colors.reset}`);
  console.log(`• Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID}`);
  console.log(`• Firestore API: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${PROJECT_ID}`);
  console.log(`• Google Cloud Console: https://console.cloud.google.com/firestore?project=${PROJECT_ID}`);
  
  console.log(`\n${colors.bright}${colors.green}🎉 Test completed!${colors.reset}`);
}

// Main execution
async function main() {
  try {
    testEnvironmentConfig();
    testProjectAccess();
    testFirestoreAPI();
    testFirebaseAuth();
    testFirestoreDatabase();
    testSecurityRules();
    testNetworkConnectivity();
    testAppConfiguration();
    generateSummary();
  } catch (error) {
    log.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
