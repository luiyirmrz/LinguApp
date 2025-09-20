#!/usr/bin/env node

/**
 * Firestore API Enablement Script for LinguApp
 * Automatically enables Firestore API in Firebase project
 * Supports multiple enablement methods with fallbacks
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
const FIRESTORE_API = 'firestore.googleapis.com';

console.log(`${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                    FIRESTORE API ENABLEMENT                 ║
║                        LinguApp Project                     ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

log.info(`Project ID: ${PROJECT_ID}`);
log.info(`Target API: ${FIRESTORE_API}`);

// Method 1: Google Cloud CLI (gcloud)
async function enableWithGCloud() {
  log.step('Method 1: Using Google Cloud CLI (gcloud)');
  
  try {
    // Check if gcloud is installed
    execSync('gcloud --version', { stdio: 'pipe' });
    log.info('Google Cloud CLI found');
    
    // Set project
    execSync(`gcloud config set project ${PROJECT_ID}`, { stdio: 'pipe' });
    log.info(`Project set to: ${PROJECT_ID}`);
    
    // Enable Firestore API
    execSync(`gcloud services enable ${FIRESTORE_API}`, { stdio: 'pipe' });
    log.success('Firestore API enabled successfully via gcloud');
    
    return true;
  } catch (error) {
    log.warning('gcloud method failed:', error.message);
    return false;
  }
}

// Method 2: REST API
async function enableWithREST() {
  log.step('Method 2: Using REST API');
  
  try {
    const https = require('https');
    const url = `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/${FIRESTORE_API}:enable`;
    
    // Note: This requires authentication token
    log.warning('REST API method requires authentication token');
    log.info('Please use gcloud auth application-default login first');
    
    return false;
  } catch (error) {
    log.warning('REST API method failed:', error.message);
    return false;
  }
}

// Method 3: Firebase CLI
async function enableWithFirebaseCLI() {
  log.step('Method 3: Using Firebase CLI');
  
  try {
    // Check if Firebase CLI is installed
    execSync('firebase --version', { stdio: 'pipe' });
    log.info('Firebase CLI found');
    
    // Login to Firebase
    log.info('Please ensure you are logged in to Firebase CLI');
    log.info('Run: firebase login');
    
    // Initialize Firestore
    execSync(`firebase init firestore --project ${PROJECT_ID}`, { stdio: 'pipe' });
    log.success('Firestore initialized via Firebase CLI');
    
    return true;
  } catch (error) {
    log.warning('Firebase CLI method failed:', error.message);
    return false;
  }
}

// Method 4: Direct Console Link
function provideConsoleLink() {
  log.step('Method 4: Manual Console Enablement');
  
  const consoleLink = `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${PROJECT_ID}`;
  const firebaseConsoleLink = `https://console.firebase.google.com/project/${PROJECT_ID}/firestore`;
  
  log.info('Manual enablement links:');
  console.log(`\n${colors.cyan}🔗 Google Cloud Console:${colors.reset}`);
  console.log(`   ${consoleLink}`);
  console.log(`\n${colors.cyan}🔗 Firebase Console:${colors.reset}`);
  console.log(`   ${firebaseConsoleLink}`);
  
  console.log(`\n${colors.yellow}📋 Manual Steps:${colors.reset}`);
  console.log('   1. Click the Google Cloud Console link above');
  console.log('   2. Click "Enable" button');
  console.log('   3. Wait 2-5 minutes for propagation');
  console.log('   4. Restart your application');
  
  return true;
}

// Test Firestore connection
async function testConnection() {
  log.step('Testing Firestore connection...');
  
  try {
    // Check if we can access the project
    execSync(`gcloud projects describe ${PROJECT_ID}`, { stdio: 'pipe' });
    log.success('Project access confirmed');
    
    // Check if Firestore API is enabled
    const result = execSync(`gcloud services list --enabled --filter="name:${FIRESTORE_API}" --project=${PROJECT_ID}`, { 
      stdio: 'pipe',
      encoding: 'utf8',
    });
    
    if (result.includes(FIRESTORE_API)) {
      log.success('Firestore API is enabled!');
      return true;
    } else {
      log.warning('Firestore API is not yet enabled');
      return false;
    }
  } catch (error) {
    log.warning('Connection test failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  log.info('Starting Firestore API enablement process...\n');
  
  // Test current status
  const isEnabled = await testConnection();
  
  if (isEnabled) {
    log.success('Firestore API is already enabled!');
    log.info('Your application should be able to connect to Firestore.');
    return;
  }
  
  log.warning('Firestore API is not enabled. Attempting to enable...\n');
  
  // Try different methods
  const methods = [
    { name: 'Google Cloud CLI', fn: enableWithGCloud },
    { name: 'Firebase CLI', fn: enableWithFirebaseCLI },
    { name: 'REST API', fn: enableWithREST },
  ];
  
  let success = false;
  
  for (const method of methods) {
    try {
      success = await method.fn();
      if (success) {
        log.success(`Firestore API enabled using ${method.name}`);
        break;
      }
    } catch (error) {
      log.warning(`${method.name} failed:`, error.message);
    }
  }
  
  if (!success) {
    log.warning('All automated methods failed. Using manual method...\n');
    provideConsoleLink();
  }
  
  // Wait and test again
  if (success) {
    log.info('Waiting 30 seconds for API enablement to propagate...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const finalTest = await testConnection();
    if (finalTest) {
      log.success('Firestore API is now enabled and ready!');
      log.info('You can now restart your application.');
    } else {
      log.warning('API enablement may still be propagating. Please wait a few more minutes.');
    }
  }
  
  console.log(`\n${colors.bright}${colors.green}🎉 Firestore enablement process completed!${colors.reset}`);
}

// Error handling
process.on('unhandledRejection', (error) => {
  log.error('Unhandled error:', error.message);
  process.exit(1);
});

// Run the script
main().catch(error => {
  log.error('Script failed:', error.message);
  process.exit(1);
});
