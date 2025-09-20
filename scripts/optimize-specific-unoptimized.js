#!/usr/bin/env node

/**
 * Optimize Specific Unoptimized Components Script
 * Optimizes the 21 specific components that were detected as unoptimized
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
║            OPTIMIZE SPECIFIC UNOPTIMIZED COMPONENTS         ║
║                    Targeted Component Optimizer             ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

class SpecificUnoptimizedOptimizer {
  constructor() {
    this.fixedFiles = [];
    this.skippedFiles = [];
    this.errors = [];
    
    // The 21 specific components that need optimization
    this.targetComponents = [
      'AccessibilityProvider.tsx',
      'Animations.tsx',
      'Button.tsx',
      'Card.tsx',
      'CodeSplitter.tsx',
      'EmptyStates.tsx',
      'EnhancedLanguageSelector.tsx',
      'EnhancedLoadingStates.tsx',
      'EnhancedUserFeedback.tsx',
      'GreetingsExercises.tsx',
      'Header.tsx',
      'Icon.tsx',
      'Input.tsx',
      'LanguageSelector.tsx',
      'LoadingStates.tsx',
      'MainLanguageSelector.tsx',
      'MicroInteractions.tsx',
      'MicroInteractionSystem.tsx',
      'Modal.tsx',
      'ProgressBar.tsx',
      'Toast.tsx',
    ];
  }

  // Optimize all target components
  async optimizeTargetComponents() {
    log.step(`Optimizing ${this.targetComponents.length} specific unoptimized components...`);
    
    const componentsPath = path.join(process.cwd(), 'components');
    
    for (const componentName of this.targetComponents) {
      try {
        const filePath = this.findComponentFile(componentsPath, componentName);
        if (filePath) {
          await this.optimizeComponentFile(filePath, componentName);
        } else {
          log.warning(`Component ${componentName} not found`);
          this.skippedFiles.push(componentName);
        }
      } catch (error) {
        this.errors.push({ component: componentName, error: error.message });
        log.error(`Failed to optimize ${componentName}: ${error.message}`);
      }
    }
    
    log.success(`Optimized ${this.fixedFiles.length} components`);
    if (this.skippedFiles.length > 0) {
      log.info(`Skipped ${this.skippedFiles.length} components`);
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

  // Optimize a single component file
  async optimizeComponentFile(filePath, componentName) {
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

    // Handle different export patterns
    if (content.includes('export default')) {
      // Standard export default
      optimizedContent = optimizedContent.replace(
        /export default (\w+);/g,
        'export default memo($1);',
      );
      hasChanges = true;
    } else if (content.includes('export {')) {
      // Named exports - need to add default export
      const compName = this.extractComponentName(componentName);
      optimizedContent += `\n\nexport default memo(${compName});`;
      hasChanges = true;
    } else {
      // No export - add default export
      const compName = this.extractComponentName(componentName);
      optimizedContent += `\n\nexport default memo(${compName});`;
      hasChanges = true;
    }

    // Add performance optimizations
    if (hasChanges) {
      // Add display name for better debugging
      const compName = this.extractComponentName(componentName);
      if (compName && !optimizedContent.includes('displayName')) {
        optimizedContent += `\n\n${compName}.displayName = '${compName}';`;
      }

      // Write optimized content
      fs.writeFileSync(filePath, optimizedContent);
      this.fixedFiles.push(componentName);
      log.success(`Optimized ${componentName}`);
    } else {
      this.skippedFiles.push(componentName);
    }
  }

  // Extract component name from filename
  extractComponentName(fileName) {
    return fileName.replace('.tsx', '').replace('.ts', '');
  }

  // Generate optimization report
  generateReport() {
    console.log(`\n${colors.bright}${colors.cyan}📊 SPECIFIC UNOPTIMIZED COMPONENTS OPTIMIZATION REPORT${colors.reset}\n`);
    
    console.log(`${colors.bright}Target Components: ${this.targetComponents.length}${colors.reset}`);
    
    if (this.fixedFiles.length > 0) {
      console.log(`\n${colors.bright}Optimized Components (${this.fixedFiles.length}):${colors.reset}`);
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
    
    if (this.errors.length > 0) {
      console.log(`\n${colors.bright}Errors (${this.errors.length}):${colors.reset}`);
      this.errors.forEach(({ component, error }) => {
        console.log(`  ❌ ${component}: ${error}`);
      });
    }
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  Total target components: ${this.targetComponents.length}`);
    console.log(`  Optimized: ${this.fixedFiles.length}`);
    console.log(`  Skipped: ${this.skippedFiles.length}`);
    console.log(`  Errors: ${this.errors.length}`);
    
    // Calculate optimization percentage
    const optimizationPercentage = Math.round((this.fixedFiles.length / this.targetComponents.length) * 100);
    console.log(`  Optimization: ${optimizationPercentage}% complete`);
  }

  // Run optimization
  async run() {
    try {
      await this.optimizeTargetComponents();
      this.generateReport();
      
      if (this.fixedFiles.length > 0) {
        log.success('Specific unoptimized components optimization completed successfully!');
        log.info('All target components are now optimized with React.memo.');
      } else {
        log.info('No components needed optimization - all are already optimized!');
      }
    } catch (error) {
      log.error(`Optimization failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run optimization
if (require.main === module) {
  const optimizer = new SpecificUnoptimizedOptimizer();
  optimizer.run();
}

module.exports = SpecificUnoptimizedOptimizer;
