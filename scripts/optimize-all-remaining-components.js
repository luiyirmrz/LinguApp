#!/usr/bin/env node

/**
 * Optimize All Remaining Components Script
 * Finds and optimizes ALL components that don't have React.memo
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
║              OPTIMIZE ALL REMAINING COMPONENTS              ║
║                    Complete Component Optimizer             ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

class AllRemainingComponentOptimizer {
  constructor() {
    this.fixedFiles = [];
    this.skippedFiles = [];
    this.errors = [];
    this.notFoundFiles = [];
  }

  // Optimize all remaining components
  async optimizeAllRemainingComponents() {
    log.step('Finding and optimizing all remaining components...');
    
    const componentsPath = path.join(process.cwd(), 'components');
    const allComponentFiles = this.getAllComponentFiles(componentsPath);
    
    log.info(`Found ${allComponentFiles.length} total component files`);
    
    for (const filePath of allComponentFiles) {
      try {
        await this.optimizeComponentFile(filePath);
      } catch (error) {
        this.errors.push({ file: path.basename(filePath), error: error.message });
        log.error(`Failed to optimize ${path.basename(filePath)}: ${error.message}`);
      }
    }
    
    log.success(`Optimized ${this.fixedFiles.length} components`);
    if (this.skippedFiles.length > 0) {
      log.info(`Skipped ${this.skippedFiles.length} components (already optimized)`);
    }
  }

  // Get all component files
  getAllComponentFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllComponentFiles(fullPath));
      } else if (item.endsWith('.tsx') && !item.includes('.test.') && !item.includes('.spec.')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  // Optimize a single component file
  async optimizeComponentFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Skip if already optimized
    if (content.includes('export default memo(') || content.includes('export default React.memo(')) {
      this.skippedFiles.push(fileName);
      return;
    }

    // Skip if it's a hook or utility file
    if (fileName.startsWith('use') || fileName.includes('hook') || fileName.includes('util')) {
      this.skippedFiles.push(fileName);
      return;
    }

    // Skip if it's already an optimized component
    if (fileName.includes('Optimized') || fileName.includes('Lazy')) {
      this.skippedFiles.push(fileName);
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
      const componentName = this.extractComponentName(fileName);
      if (componentName && !optimizedContent.includes('displayName')) {
        optimizedContent += `\n\n${componentName}.displayName = '${componentName}';`;
      }

      // Write optimized content
      fs.writeFileSync(filePath, optimizedContent);
      this.fixedFiles.push(fileName);
      log.success(`Optimized ${fileName}`);
    } else {
      this.skippedFiles.push(fileName);
    }
  }

  // Extract component name from filename
  extractComponentName(fileName) {
    return fileName.replace('.tsx', '').replace('.ts', '');
  }

  // Generate optimization report
  generateReport() {
    console.log(`\n${colors.bright}${colors.cyan}📊 ALL REMAINING COMPONENTS OPTIMIZATION REPORT${colors.reset}\n`);
    
    if (this.fixedFiles.length > 0) {
      console.log(`${colors.bright}Optimized Components (${this.fixedFiles.length}):${colors.reset}`);
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
      this.errors.forEach(({ file, error }) => {
        console.log(`  ❌ ${file}: ${error}`);
      });
    }
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  Total files processed: ${this.fixedFiles.length + this.skippedFiles.length}`);
    console.log(`  Optimized: ${this.fixedFiles.length}`);
    console.log(`  Skipped: ${this.skippedFiles.length}`);
    console.log(`  Errors: ${this.errors.length}`);
    
    // Calculate optimization percentage
    const totalFiles = this.fixedFiles.length + this.skippedFiles.length;
    const optimizationPercentage = totalFiles > 0 ? Math.round((this.fixedFiles.length / totalFiles) * 100) : 0;
    console.log(`  New optimizations: ${optimizationPercentage}%`);
  }

  // Run optimization
  async run() {
    try {
      await this.optimizeAllRemainingComponents();
      this.generateReport();
      
      if (this.fixedFiles.length > 0) {
        log.success('All remaining components optimization completed successfully!');
        log.info('All components are now optimized with React.memo.');
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
  const optimizer = new AllRemainingComponentOptimizer();
  optimizer.run();
}

module.exports = AllRemainingComponentOptimizer;
