#!/usr/bin/env node

/**
 * Console Log Optimization Script
 * 
 * This script optimizes console.log statements in the codebase by:
 * 1. Removing console.log in production builds
 * 2. Converting console.log to console.debug for development
 * 3. Adding proper logging levels
 * 4. Removing unused console statements
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

class ConsoleLogOptimizer {
  constructor() {
    this.processedFiles = [];
    this.optimizedLogs = 0;
    this.removedLogs = 0;
    this.errors = [];
    
    // Directories to process
    this.directories = [
      'components',
      'hooks',
      'services',
      'utils',
      'app',
    ];
    
    // File extensions to process
    this.extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    // Console patterns to optimize
    this.consolePatterns = [
      /console\.log\s*\(/g,
      /console\.warn\s*\(/g,
      /console\.error\s*\(/g,
      /console\.info\s*\(/g,
      /console\.debug\s*\(/g,
    ];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async optimizeConsoleLogs() {
    this.log(`\n${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗`);
    this.log('║                CONSOLE LOG OPTIMIZER                      ║');
    this.log('║                    Optimization Script                    ║');
    this.log(`╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    for (const dir of this.directories) {
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
      
      // Check if file has console statements
      const hasConsoleLogs = this.consolePatterns.some(pattern => pattern.test(content));
      
      if (!hasConsoleLogs) {
        return;
      }

      let optimizedContent = content;
      const fileOptimizedLogs = { count: 0 };
      const fileRemovedLogs = { count: 0 };

      // Optimize console.log statements
      optimizedContent = this.optimizeConsoleStatements(optimizedContent, fileOptimizedLogs, fileRemovedLogs);
      
      // Remove unused console statements in production
      optimizedContent = this.removeUnusedConsoleStatements(optimizedContent, fileRemovedLogs);
      
      // Add proper logging levels
      optimizedContent = this.addLoggingLevels(optimizedContent, fileOptimizedLogs);

      if (optimizedContent !== content) {
        fs.writeFileSync(filePath, optimizedContent, 'utf8');
        this.processedFiles.push({
          path: relativePath,
          optimized: fileOptimizedLogs.count,
          removed: fileRemovedLogs.count,
        });
        this.optimizedLogs += fileOptimizedLogs.count;
        this.removedLogs += fileRemovedLogs.count;
        
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

  optimizeConsoleStatements(content, optimizedCount, removedCount) {
    // Convert console.log to console.debug for development
    content = content.replace(/console\.log\s*\(/g, (match) => {
      optimizedCount.count++;
      return 'console.debug(';
    });

    // Remove console.log in production builds
    content = content.replace(/console\.log\s*\([^)]*\)\s*;?\s*/g, (match) => {
      removedCount.count++;
      return '';
    });

    return content;
  }

  removeUnusedConsoleStatements(content, removedCount) {
    // Remove standalone console statements that don't provide value
    const unusedPatterns = [
      /console\.log\s*\(\s*['"`][^'"`]*['"`]\s*\)\s*;?\s*/g,
      /console\.log\s*\(\s*['"`]debug['"`]\s*\)\s*;?\s*/g,
      /console\.log\s*\(\s*['"`]test['"`]\s*\)\s*;?\s*/g,
    ];

    unusedPatterns.forEach(pattern => {
      content = content.replace(pattern, (match) => {
        removedCount.count++;
        return '';
      });
    });

    return content;
  }

  addLoggingLevels(content, optimizedCount) {
    // Add proper logging levels based on context
    content = content.replace(/console\.debug\s*\(\s*['"`]error['"`]/g, 'console.error(');
    content = content.replace(/console\.debug\s*\(\s*['"`]warn['"`]/g, 'console.warn(');
    content = content.replace(/console\.debug\s*\(\s*['"`]info['"`]/g, 'console.info(');

    return content;
  }

  generateReport() {
    this.log(`\n${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗`);
    this.log('║                    OPTIMIZATION REPORT                    ║');
    this.log(`╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    this.log(`${colors.green}✓ Files processed: ${this.processedFiles.length}`, colors.green);
    this.log(`${colors.blue}✓ Console logs optimized: ${this.optimizedLogs}`, colors.blue);
    this.log(`${colors.yellow}✓ Console logs removed: ${this.removedLogs}`, colors.yellow);
    this.log(`${colors.red}✗ Errors: ${this.errors.length}`, colors.red);

    if (this.processedFiles.length > 0) {
      this.log(`\n${colors.bright}Processed Files:${colors.reset}`);
      this.processedFiles.forEach(file => {
        this.log(`  ${file.path}: ${file.optimized} optimized, ${file.removed} removed`);
      });
    }

    if (this.errors.length > 0) {
      this.log(`\n${colors.bright}${colors.red}Errors:${colors.reset}`);
      this.errors.forEach(error => {
        this.log(`  ${error.file}: ${error.error}`);
      });
    }

    this.log(`\n${colors.green}Console log optimization completed!${colors.reset}\n`);
  }
}

// Run the optimizer
const optimizer = new ConsoleLogOptimizer();
optimizer.optimizeConsoleLogs().catch(console.error);
