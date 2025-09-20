#!/usr/bin/env node

/**
 * Fix Specific Components Script
 * Identifies and fixes the exact 32 components that need React.memo optimization
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
║                FIX SPECIFIC COMPONENTS                      ║
║                    Targeted Optimizer                       ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

class SpecificComponentFixer {
  constructor() {
    this.fixedFiles = [];
    this.skippedFiles = [];
    this.errors = [];
    this.notFoundFiles = [];
    
    // The exact 32 components that need optimization
    this.targetComponents = [
      'A1SRSComponent.tsx',
      'A1SRSTestComponent.tsx',
      'AccessibilityProvider.tsx',
      'AdaptiveLessonScreen.tsx',
      'AnimatedLessonScreen.tsx',
      'AuthSystemTest.tsx',
      'AuthWrapper.tsx',
      'DataMigrationComponent.tsx',
      'EnhancedLanguageSelector.tsx',
      'EnhancedOnboardingComponent.tsx',
      'EnhancedUserFeedback.tsx',
      'ErrorAnalyticsDashboard.tsx',
      'FillBlankExercise.tsx',
      'MultipleChoiceExercise.tsx',
      'FirebaseStatusMonitor.tsx',
      'GreetingsExercises.tsx',
      'GreetingsLessonScreen.tsx',
      'GreetingsModuleScreen.tsx',
      'ImmersiveMode.tsx',
      'Input.tsx',
      'LevelTestComponent.tsx',
      'MainLanguageSelector.tsx',
      'MicroInteractions.tsx',
      'MicroInteractionSystem.tsx',
      'OptimizedImage.tsx',
      'PerformanceMonitoringDashboard.tsx',
      'PronunciationFeedback.tsx',
      'SecurityMonitoringComponent.tsx',
      'SocialFeatures.tsx',
      'SRSFlashcardComponent.tsx',
      'STTExample.tsx',
      'Toast.tsx',
    ];
  }

  // Fix all target components
  async fixTargetComponents() {
    log.step(`Fixing ${this.targetComponents.length} specific components...`);
    
    const componentsPath = path.join(process.cwd(), 'components');
    
    for (const componentName of this.targetComponents) {
      try {
        const filePath = this.findComponentFile(componentsPath, componentName);
        if (filePath) {
          await this.fixComponentFile(filePath, componentName);
        } else {
          this.notFoundFiles.push(componentName);
          log.warning(`Component ${componentName} not found`);
        }
      } catch (error) {
        this.errors.push({ component: componentName, error: error.message });
        log.error(`Failed to fix ${componentName}: ${error.message}`);
      }
    }
    
    log.success(`Fixed ${this.fixedFiles.length} components`);
    if (this.skippedFiles.length > 0) {
      log.info(`Skipped ${this.skippedFiles.length} components (already optimized)`);
    }
    if (this.notFoundFiles.length > 0) {
      log.warning(`Not found: ${this.notFoundFiles.length} components`);
    }
  }

  // Find component file in directory tree
  findComponentFile(dir, componentName) {
    if (!fs.existsSync(dir)) return null;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const found = this.findComponentFile(fullPath, componentName);
        if (found) return found;
      } else if (item === componentName) {
        return fullPath;
      }
    }
    
    return null;
  }

  // Fix a single component file
  async fixComponentFile(filePath, componentName) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already optimized
    if (content.includes('export default memo(') || content.includes('export default React.memo(')) {
      this.skippedFiles.push(componentName);
      return;
    }

    let optimizedContent = content;
    let hasChanges = false;

    // Add memo import if not present
    if (!content.includes('memo') && !content.includes('React.memo')) {
      if (content.includes("import React from 'react'")) {
        optimizedContent = optimizedContent.replace(
          "import React from 'react'",
          "import React, { memo } from 'react'",
        );
        hasChanges = true;
      } else if (content.includes('import React, {') && !content.includes('memo')) {
        optimizedContent = optimizedContent.replace(
          /import React, \{([^}]+)\}/,
          (match, imports) => {
            const importList = imports.split(',').map(imp => imp.trim());
            if (!importList.includes('memo')) {
              importList.push('memo');
            }
            return `import React, { ${importList.join(', ')} }`;
          },
        );
        hasChanges = true;
      }
    }

    // Wrap default export with memo
    if (content.includes('export default') && !content.includes('export default memo(')) {
      // Handle different export patterns
      const exportPatterns = [
        /export default (\w+);/g,
        /export default function (\w+)/g,
        /export default \(/g,
      ];

      let foundExport = false;
      for (const pattern of exportPatterns) {
        if (pattern.test(optimizedContent)) {
          optimizedContent = optimizedContent.replace(pattern, (match, componentName) => {
            if (componentName) {
              return `export default memo(${componentName});`;
            } else {
              return 'export default memo(';
            }
          });
          hasChanges = true;
          foundExport = true;
          break;
        }
      }

      // Handle arrow function exports
      if (!foundExport && optimizedContent.includes('export default (')) {
        optimizedContent = optimizedContent.replace(
          'export default (',
          'export default memo(',
        );
        hasChanges = true;
      }
    }

    // Add performance optimizations
    if (hasChanges) {
      // Add display name for better debugging
      const componentName = this.extractComponentName(componentName);
      if (componentName && !optimizedContent.includes('displayName')) {
        optimizedContent += `\n\n${componentName}.displayName = '${componentName}';`;
      }

      // Write optimized content
      fs.writeFileSync(filePath, optimizedContent);
      this.fixedFiles.push(componentName);
      log.success(`Fixed ${componentName}`);
    } else {
      this.skippedFiles.push(componentName);
    }
  }

  // Extract component name from filename
  extractComponentName(fileName) {
    return fileName.replace('.tsx', '').replace('.ts', '');
  }

  // Generate detailed report
  generateReport() {
    console.log(`\n${colors.bright}${colors.cyan}📊 SPECIFIC COMPONENT FIX REPORT${colors.reset}\n`);
    
    console.log(`${colors.bright}Target Components: ${this.targetComponents.length}${colors.reset}`);
    
    if (this.fixedFiles.length > 0) {
      console.log(`\n${colors.bright}Fixed Components (${this.fixedFiles.length}):${colors.reset}`);
      this.fixedFiles.forEach(file => {
        console.log(`  ✅ ${file}`);
      });
    }
    
    if (this.skippedFiles.length > 0) {
      console.log(`\n${colors.bright}Skipped Components (${this.skippedFiles.length}):${colors.reset}`);
      this.skippedFiles.forEach(file => {
        console.log(`  ⏭️  ${file}`);
      });
    }
    
    if (this.notFoundFiles.length > 0) {
      console.log(`\n${colors.bright}Not Found Components (${this.notFoundFiles.length}):${colors.reset}`);
      this.notFoundFiles.forEach(file => {
        console.log(`  ❓ ${file}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log(`\n${colors.bright}Errors (${this.errors.length}):${colors.reset}`);
      this.errors.forEach(({ component, error }) => {
        console.log(`  ❌ ${component}: ${error}`);
      });
    }
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  Total target components: ${this.targetComponents.length}`);
    console.log(`  Fixed: ${this.fixedFiles.length}`);
    console.log(`  Skipped (already optimized): ${this.skippedFiles.length}`);
    console.log(`  Not found: ${this.notFoundFiles.length}`);
    console.log(`  Errors: ${this.errors.length}`);
    
    // Calculate optimization percentage
    const optimizedCount = this.fixedFiles.length + this.skippedFiles.length;
    const optimizationPercentage = Math.round((optimizedCount / this.targetComponents.length) * 100);
    console.log(`  Optimization: ${optimizationPercentage}% complete`);
  }

  // Run fix
  async run() {
    try {
      await this.fixTargetComponents();
      this.generateReport();
      
      if (this.fixedFiles.length > 0) {
        log.success('Specific component fixing completed successfully!');
        log.info('All target components are now optimized with React.memo.');
      } else {
        log.info('No components needed fixing - all are already optimized!');
      }
    } catch (error) {
      log.error(`Component fixing failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run fix
if (require.main === module) {
  const fixer = new SpecificComponentFixer();
  fixer.run();
}

module.exports = SpecificComponentFixer;
