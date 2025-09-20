#!/usr/bin/env node

/**
 * Auto-Optimization Script for LinguApp
 * Automatically applies performance optimizations to components
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
║                  LINGUAPP AUTO-OPTIMIZER                    ║
║                    Performance Booster                      ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

class AutoOptimizer {
  constructor() {
    this.optimizedFiles = [];
    this.skippedFiles = [];
    this.errors = [];
  }

  // Optimize all components in the components directory
  async optimizeComponents() {
    log.step('Optimizing components...');
    
    const componentsPath = path.join(process.cwd(), 'components');
    const componentFiles = this.getComponentFiles(componentsPath);
    
    for (const file of componentFiles) {
      try {
        await this.optimizeComponentFile(file);
      } catch (error) {
        this.errors.push({ file, error: error.message });
        log.error(`Failed to optimize ${path.basename(file)}: ${error.message}`);
      }
    }
    
    log.success(`Optimized ${this.optimizedFiles.length} components`);
    if (this.skippedFiles.length > 0) {
      log.info(`Skipped ${this.skippedFiles.length} components (already optimized)`);
    }
  }

  // Get all component files
  getComponentFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getComponentFiles(fullPath));
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
      this.optimizedFiles.push(fileName);
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
    console.log(`\n${colors.bright}${colors.cyan}📊 OPTIMIZATION REPORT${colors.reset}\n`);
    
    console.log(`${colors.bright}Optimized Components:${colors.reset}`);
    this.optimizedFiles.forEach(file => {
      console.log(`  ✅ ${file}`);
    });
    
    if (this.skippedFiles.length > 0) {
      console.log(`\n${colors.bright}Skipped Components:${colors.reset}`);
      this.skippedFiles.forEach(file => {
        console.log(`  ⏭️  ${file}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log(`\n${colors.bright}Errors:${colors.reset}`);
      this.errors.forEach(({ file, error }) => {
        console.log(`  ❌ ${file}: ${error}`);
      });
    }
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  Total files processed: ${this.optimizedFiles.length + this.skippedFiles.length}`);
    console.log(`  Optimized: ${this.optimizedFiles.length}`);
    console.log(`  Skipped: ${this.skippedFiles.length}`);
    console.log(`  Errors: ${this.errors.length}`);
  }

  // Run optimization
  async run() {
    try {
      await this.optimizeComponents();
      this.generateReport();
      
      if (this.optimizedFiles.length > 0) {
        log.success('Auto-optimization completed successfully!');
        log.info('Run "npm run build" to see the performance improvements.');
      } else {
        log.info('No components needed optimization.');
      }
    } catch (error) {
      log.error(`Optimization failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run optimization
if (require.main === module) {
  const optimizer = new AutoOptimizer();
  optimizer.run();
}

module.exports = AutoOptimizer;
