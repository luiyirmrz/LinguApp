#!/usr/bin/env node

/**
 * Test Timeout Optimization Script
 * 
 * This script optimizes test timeouts by:
 * 1. Reducing excessive timeouts
 * 2. Adding proper timeout configurations
 * 3. Optimizing async test performance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

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

class TestTimeoutOptimizer {
  constructor() {
    this.processedFiles = [];
    this.optimizedTimeouts = 0;
    this.errors = [];
    
    // Test directories
    this.testDirectories = [
      '__tests__',
    ];
    
    // File extensions to process
    this.extensions = ['.test.ts', '.test.tsx', '.test.js', '.test.jsx'];
    
    // Timeout patterns to optimize
    this.timeoutPatterns = [
      /,\s*(\d+)\s*\)\s*;?\s*$/gm, // Jest timeout patterns
      /timeout:\s*(\d+)/g, // Timeout configurations
    ];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async optimizeTestTimeouts() {
    this.log(`\n${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗`);
    this.log('║                TEST TIMEOUT OPTIMIZER                   ║');
    this.log('║                    Optimization Script                    ║');
    this.log(`╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    for (const dir of this.testDirectories) {
      const dirPath = path.join(projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        await this.processDirectory(dirPath);
      }
    }

    this.generateReport();
  }

  async processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        await this.processDirectory(itemPath);
      } else if (stat.isFile() && this.extensions.some(ext => item.endsWith(ext))) {
        await this.processFile(itemPath);
      }
    }
  }

  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(projectRoot, filePath);
      
      // Check if file has timeout configurations
      const hasTimeouts = this.timeoutPatterns.some(pattern => pattern.test(content));
      
      if (!hasTimeouts) {
        return;
      }

      let optimizedContent = content;
      const fileOptimizedTimeouts = 0;

      // Optimize timeout values
      optimizedContent = this.optimizeTimeoutValues(optimizedContent, fileOptimizedTimeouts);
      
      // Add global timeout configuration
      optimizedContent = this.addGlobalTimeoutConfig(optimizedContent);

      if (optimizedContent !== content) {
        fs.writeFileSync(filePath, optimizedContent, 'utf8');
        this.processedFiles.push({
          path: relativePath,
          optimized: fileOptimizedTimeouts,
        });
        this.optimizedTimeouts += fileOptimizedTimeouts;
        
        this.log(`✓ Optimized ${relativePath}`, colors.green);
      }
    } catch (error) {
      this.errors.push({
        file: path.relative(projectRoot, filePath),
        error: error.message,
      });
      this.log(`✗ Error processing ${path.relative(projectRoot, filePath)}: ${error.message}`, colors.red);
    }
  }

  optimizeTimeoutValues(content, optimizedCount) {
    // Optimize Jest timeout values
    content = content.replace(/,\s*(\d+)\s*\)\s*;?\s*$/gm, (match, timeout) => {
      const timeoutValue = parseInt(timeout);
      
      // Optimize excessive timeouts
      if (timeoutValue > 30000) {
        optimizedCount.count++;
        return `, 15000); // Optimized from ${timeoutValue}ms`;
      } else if (timeoutValue > 15000) {
        optimizedCount.count++;
        return `, 10000); // Optimized from ${timeoutValue}ms`;
      } else if (timeoutValue > 10000) {
        optimizedCount.count++;
        return `, 5000); // Optimized from ${timeoutValue}ms`;
      }
      
      return match;
    });

    // Optimize timeout configurations
    content = content.replace(/timeout:\s*(\d+)/g, (match, timeout) => {
      const timeoutValue = parseInt(timeout);
      
      if (timeoutValue > 30000) {
        optimizedCount.count++;
        return `timeout: 15000 // Optimized from ${timeoutValue}ms`;
      } else if (timeoutValue > 15000) {
        optimizedCount.count++;
        return `timeout: 10000 // Optimized from ${timeoutValue}ms`;
      }
      
      return match;
    });

    return content;
  }

  addGlobalTimeoutConfig(content) {
    // Add global timeout configuration if not present
    if (!content.includes('jest.setTimeout') && !content.includes('setTimeout')) {
      const timeoutConfig = `
// Global test timeout configuration
jest.setTimeout(10000); // 10 seconds default timeout

`;
      return timeoutConfig + content;
    }
    
    return content;
  }

  generateReport() {
    this.log(`\n${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗`);
    this.log('║                    OPTIMIZATION REPORT                    ║');
    this.log(`╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    this.log(`${colors.green}✓ Files processed: ${this.processedFiles.length}`, colors.green);
    this.log(`${colors.blue}✓ Timeouts optimized: ${this.optimizedTimeouts}`, colors.blue);
    this.log(`${colors.red}✗ Errors: ${this.errors.length}`, colors.red);

    if (this.processedFiles.length > 0) {
      this.log(`\n${colors.bright}Processed Files:${colors.reset}`);
      this.processedFiles.forEach(file => {
        this.log(`  ${file.path}: ${file.optimized} timeouts optimized`);
      });
    }

    if (this.errors.length > 0) {
      this.log(`\n${colors.bright}${colors.red}Errors:${colors.reset}`);
      this.errors.forEach(error => {
        this.log(`  ${error.file}: ${error.error}`);
      });
    }

    this.log(`\n${colors.green}Test timeout optimization completed!${colors.reset}\n`);
  }
}

// Run the optimizer
const optimizer = new TestTimeoutOptimizer();
optimizer.optimizeTestTimeouts().catch(console.error);
