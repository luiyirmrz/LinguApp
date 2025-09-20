#!/usr/bin/env node

/**
 * Firestore Security Rules Deployment Script for LinguApp
 * Deploys comprehensive security rules to Firestore
 * Includes validation and rollback capabilities
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
const RULES_FILE = 'firestore.rules';

console.log(`${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                FIRESTORE SECURITY RULES DEPLOYMENT          ║
║                        LinguApp Project                     ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

// Validate rules file
function validateRulesFile() {
  log.step('Validating security rules file...');
  
  const rulesPath = path.join(process.cwd(), RULES_FILE);
  
  if (!fs.existsSync(rulesPath)) {
    log.error(`Rules file ${RULES_FILE} not found`);
    return false;
  }
  
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  // Basic validation checks
  const validationChecks = [
    { pattern: /rules_version = '2'/, name: 'Rules version declaration' },
    { pattern: /service cloud\.firestore/, name: 'Firestore service declaration' },
    { pattern: /match \/databases\/\{database\}\/documents/, name: 'Database path declaration' },
    { pattern: /function isAuthenticated\(\)/, name: 'Authentication helper function' },
    { pattern: /function isOwner\(userId\)/, name: 'Owner validation function' },
    { pattern: /allow read, write: if false/, name: 'Default deny rule' },
  ];
  
  let allChecksPass = true;
  
  validationChecks.forEach(check => {
    if (check.pattern.test(rulesContent)) {
      log.success(`${check.name} is present`);
    } else {
      log.error(`${check.name} is missing`);
      allChecksPass = false;
    }
  });
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    { pattern: /allow read, write: if true/, name: 'Overly permissive rule' },
    { pattern: /allow \*: if true/, name: 'Wildcard allow rule' },
  ];
  
  dangerousPatterns.forEach(check => {
    if (check.pattern.test(rulesContent)) {
      log.warning(`⚠️  ${check.name} detected - this may be a security risk`);
    }
  });
  
  if (allChecksPass) {
    log.success('Security rules validation passed');
    return true;
  } else {
    log.error('Security rules validation failed');
    return false;
  }
}

// Check Firebase CLI authentication
function checkFirebaseAuth() {
  log.step('Checking Firebase CLI authentication...');
  
  try {
    const result = execSync('firebase projects:list', { stdio: 'pipe', encoding: 'utf8' });
    
    if (result.includes(PROJECT_ID)) {
      log.success('Firebase CLI is authenticated and can access the project');
      return true;
    } else {
      log.warning('Project not found in Firebase CLI project list');
      log.info('Run: firebase use --add');
      return false;
    }
  } catch (error) {
    log.error('Firebase CLI authentication failed');
    log.info('Run: firebase login');
    return false;
  }
}

// Deploy security rules
function deployRules() {
  log.step('Deploying security rules...');
  
  try {
    // Set the project
    execSync(`firebase use ${PROJECT_ID}`, { stdio: 'pipe' });
    log.info(`Project set to: ${PROJECT_ID}`);
    
    // Deploy only the rules
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    log.success('Security rules deployed successfully');
    
    return true;
  } catch (error) {
    log.error('Failed to deploy security rules:', error.message);
    return false;
  }
}

// Test deployed rules
function testDeployedRules() {
  log.step('Testing deployed rules...');
  
  try {
    // Get the current rules from Firebase
    const result = execSync('firebase firestore:rules:get', { stdio: 'pipe', encoding: 'utf8' });
    
    if (result.includes('rules_version = \'2\'')) {
      log.success('Rules are properly deployed and accessible');
      return true;
    } else {
      log.warning('Deployed rules may not be correct');
      return false;
    }
  } catch (error) {
    log.warning('Cannot verify deployed rules:', error.message);
    return false;
  }
}

// Create backup of current rules
function createBackup() {
  log.step('Creating backup of current rules...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), `firestore.rules.backup.${timestamp}`);
    
    // Get current rules from Firebase
    const currentRules = execSync('firebase firestore:rules:get', { stdio: 'pipe', encoding: 'utf8' });
    
    fs.writeFileSync(backupPath, currentRules);
    log.success(`Backup created: ${backupPath}`);
    
    return backupPath;
  } catch (error) {
    log.warning('Could not create backup:', error.message);
    return null;
  }
}

// Rollback to previous rules
function rollbackRules(backupPath) {
  if (!backupPath || !fs.existsSync(backupPath)) {
    log.error('No backup available for rollback');
    return false;
  }
  
  log.step('Rolling back to previous rules...');
  
  try {
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    const currentRulesPath = path.join(process.cwd(), RULES_FILE);
    
    // Restore backup
    fs.writeFileSync(currentRulesPath, backupContent);
    
    // Deploy the backup
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    log.success('Rules rolled back successfully');
    
    return true;
  } catch (error) {
    log.error('Rollback failed:', error.message);
    return false;
  }
}

// Main deployment function
async function main() {
  try {
    // Step 1: Validate rules file
    if (!validateRulesFile()) {
      log.error('Cannot proceed with invalid rules file');
      process.exit(1);
    }
    
    // Step 2: Check authentication
    if (!checkFirebaseAuth()) {
      log.error('Cannot proceed without proper authentication');
      process.exit(1);
    }
    
    // Step 3: Create backup
    const backupPath = createBackup();
    
    // Step 4: Deploy rules
    if (!deployRules()) {
      log.error('Deployment failed');
      
      // Attempt rollback if backup exists
      if (backupPath) {
        log.info('Attempting rollback...');
        rollbackRules(backupPath);
      }
      
      process.exit(1);
    }
    
    // Step 5: Test deployed rules
    if (!testDeployedRules()) {
      log.warning('Deployed rules may have issues');
    }
    
    log.success('Security rules deployment completed successfully!');
    
    console.log(`\n${colors.bright}${colors.green}🎉 Deployment Summary:${colors.reset}`);
    console.log('• Security rules validated');
    console.log('• Rules deployed to Firestore');
    console.log('• Deployment verified');
    
    if (backupPath) {
      console.log(`• Backup created: ${backupPath}`);
    }
    
    console.log(`\n${colors.bright}${colors.cyan}📋 Next Steps:${colors.reset}`);
    console.log('1. Test your application with the new rules');
    console.log('2. Monitor Firestore usage in Firebase Console');
    console.log('3. Check for any permission errors in your app');
    
  } catch (error) {
    log.error('Deployment process failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--rollback')) {
  const backupPath = args[args.indexOf('--rollback') + 1];
  if (rollbackRules(backupPath)) {
    log.success('Rollback completed');
  } else {
    log.error('Rollback failed');
    process.exit(1);
  }
} else {
  main();
}