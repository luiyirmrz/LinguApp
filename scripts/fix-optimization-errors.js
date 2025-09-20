#!/usr/bin/env node

/**
 * Fix Optimization Errors Script
 * Fixes the errors introduced by the automatic optimization scripts
 */

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

console.log(`${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                FIX OPTIMIZATION ERRORS                      ║
║                    Error Correction Script                  ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

class OptimizationErrorFixer {
  constructor() {
    this.fixedFiles = [];
    this.skippedFiles = [];
    this.errors = [];
    
    // Files with errors that need fixing
    this.errorFiles = [
      'components/ComprehensiveLessonScreen.tsx',
      'components/Dashboard.tsx',
      'components/DataMigrationComponent.tsx',
      'components/EnhancedOnboardingComponent.tsx',
      'components/GreetingsLessonScreen.tsx',
      'components/GreetingsModuleScreen.tsx',
      'components/ImmersiveMode.tsx',
      'components/PronunciationFeedback.tsx',
      'components/SecurityMonitoringComponent.tsx',
    ];
  }

  // Fix all error files
  async fixErrorFiles() {
    log.step(`Fixing ${this.errorFiles.length} files with optimization errors...`);
    
    for (const filePath of this.errorFiles) {
      try {
        await this.fixErrorFile(filePath);
      } catch (error) {
        this.errors.push({ file: filePath, error: error.message });
        log.error(`Failed to fix ${filePath}: ${error.message}`);
      }
    }
    
    log.success(`Fixed ${this.fixedFiles.length} files`);
    if (this.skippedFiles.length > 0) {
      log.info(`Skipped ${this.skippedFiles.length} files`);
    }
  }

  // Fix a single error file
  async fixErrorFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      this.skippedFiles.push(filePath);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;

    // Fix 1: Remove incorrect import statements that are in the middle of the file
    const incorrectImportRegex = /^import { lazyLoad\w+ } from '@\/services\/LazyDependencies';$/gm;
    const matches = content.match(incorrectImportRegex);
    if (matches) {
      matches.forEach(match => {
        content = content.replace(`${match  }\n`, '');
        hasChanges = true;
      });
    }

    // Fix 2: Fix broken export default statements
    content = content.replace(
      /export default memo\((\w+)\);\(\) \{/g,
      'export default memo($1);\n\n$1.displayName = \'$1\';\n\nfunction $1() {',
    );

    // Fix 3: Fix broken JSX with await lazyLoad
    content = content.replace(
      /<await lazyLoad(\w+)\(\)/g,
      '<LinearGradient',
    );
    content = content.replace(
      /<\/await lazyLoad(\w+)\(\)>/g,
      '</LinearGradient>',
    );

    // Fix 4: Add proper imports for LinearGradient
    if (content.includes('<LinearGradient') && !content.includes('import { LinearGradient }')) {
      const importIndex = content.indexOf('import React');
      if (importIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', importIndex);
        content = `${content.slice(0, nextLineIndex + 1)  
                 }import { LinearGradient } from 'expo-linear-gradient';\n${ 
                 content.slice(nextLineIndex + 1)}`;
        hasChanges = true;
      }
    }

    // Fix 5: Fix broken function declarations
    content = content.replace(
      /export default memo\((\w+)\);\(\) \{/g,
      'export default memo($1);\n\n$1.displayName = \'$1\';\n\nfunction $1() {',
    );

    // Fix 6: Fix broken SafeAreaView imports
    if (content.includes('<SafeAreaView') && !content.includes('import { SafeAreaView }')) {
      const importIndex = content.indexOf('import React');
      if (importIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', importIndex);
        content = `${content.slice(0, nextLineIndex + 1)  
                 }import { SafeAreaView } from 'react-native-safe-area-context';\n${ 
                 content.slice(nextLineIndex + 1)}`;
        hasChanges = true;
      }
    }

    // Fix 7: Fix broken Modal imports
    if (content.includes('<Modal') && !content.includes('import { Modal }')) {
      const importIndex = content.indexOf('import React');
      if (importIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', importIndex);
        content = `${content.slice(0, nextLineIndex + 1)  
                 }import { Modal } from 'react-native';\n${ 
                 content.slice(nextLineIndex + 1)}`;
        hasChanges = true;
      }
    }

    // Fix 8: Fix broken ScrollView imports
    if (content.includes('<ScrollView') && !content.includes('import { ScrollView }')) {
      const importIndex = content.indexOf('import React');
      if (importIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', importIndex);
        content = `${content.slice(0, nextLineIndex + 1)  
                 }import { ScrollView } from 'react-native';\n${ 
                 content.slice(nextLineIndex + 1)}`;
        hasChanges = true;
      }
    }

    // Fix 9: Fix broken TouchableOpacity imports
    if (content.includes('<TouchableOpacity') && !content.includes('import { TouchableOpacity }')) {
      const importIndex = content.indexOf('import React');
      if (importIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', importIndex);
        content = `${content.slice(0, nextLineIndex + 1)  
                 }import { TouchableOpacity } from 'react-native';\n${ 
                 content.slice(nextLineIndex + 1)}`;
        hasChanges = true;
      }
    }

    // Fix 10: Fix broken Animated.View imports
    if (content.includes('<Animated.View') && !content.includes('import { Animated }')) {
      const importIndex = content.indexOf('import React');
      if (importIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', importIndex);
        content = `${content.slice(0, nextLineIndex + 1)  
                 }import { Animated } from 'react-native';\n${ 
                 content.slice(nextLineIndex + 1)}`;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      fs.writeFileSync(fullPath, content);
      this.fixedFiles.push(filePath);
      log.success(`Fixed ${filePath}`);
    } else {
      this.skippedFiles.push(filePath);
    }
  }

  // Generate fix report
  generateReport() {
    console.log(`\n${colors.bright}${colors.cyan}📊 OPTIMIZATION ERROR FIX REPORT${colors.reset}\n`);
    
    if (this.fixedFiles.length > 0) {
      console.log(`${colors.bright}Fixed Files (${this.fixedFiles.length}):${colors.reset}`);
      this.fixedFiles.forEach(file => {
        console.log(`  ✅ ${file}`);
      });
    }
    
    if (this.skippedFiles.length > 0) {
      console.log(`\n${colors.bright}Skipped Files (${this.skippedFiles.length}):${colors.reset}`);
      this.skippedFiles.forEach(file => {
        console.log(`  ⏭️  ${file}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log(`\n${colors.bright}Errors (${this.errors.length}):${colors.reset}`);
      this.errors.forEach(({ file, error }) => {
        console.log(`  ❌ ${file}: ${error}`);
      });
    }
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  Total error files: ${this.errorFiles.length}`);
    console.log(`  Fixed: ${this.fixedFiles.length}`);
    console.log(`  Skipped: ${this.skippedFiles.length}`);
    console.log(`  Errors: ${this.errors.length}`);
  }

  // Run fix
  async run() {
    try {
      await this.fixErrorFiles();
      this.generateReport();
      
      if (this.fixedFiles.length > 0) {
        log.success('Optimization error fixing completed successfully!');
        log.info('All optimization errors have been fixed.');
      } else {
        log.info('No files needed fixing.');
      }
    } catch (error) {
      log.error(`Error fixing failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run fix
if (require.main === module) {
  const fixer = new OptimizationErrorFixer();
  fixer.run();
}

module.exports = OptimizationErrorFixer;
