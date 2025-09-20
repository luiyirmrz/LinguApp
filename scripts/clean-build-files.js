#!/usr/bin/env node

/**
 * Build Files Cleanup Script
 * 
 * This script cleans up build artifacts and temporary files by:
 * 1. Removing dist/ directory
 * 2. Removing .expo/ directory
 * 3. Removing node_modules/.cache
 * 4. Removing build artifacts
 * 5. Cleaning up temporary files
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

class BuildFilesCleaner {
  constructor() {
    this.cleanedDirectories = [];
    this.cleanedFiles = [];
    this.errors = [];
    
    // Directories and files to clean
    this.cleanupTargets = [
      'dist',
      '.expo',
      'node_modules/.cache',
      'android/build',
      'android/app/build',
      'ios/build',
      'coverage',
      '.nyc_output',
      '*.log',
      '*.tmp',
      '*.temp',
    ];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async cleanBuildFiles() {
    this.log(`\n${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗`);
    this.log('║                BUILD FILES CLEANER                       ║');
    this.log('║                    Cleanup Script                         ║');
    this.log(`╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    for (const target of this.cleanupTargets) {
      await this.cleanTarget(target);
    }

    this.generateReport();
  }

  async cleanTarget(target) {
    try {
      const targetPath = path.join(projectRoot, target);
      
      if (target.includes('*')) {
        // Handle glob patterns
        await this.cleanGlobPattern(target);
      } else if (fs.existsSync(targetPath)) {
        const stat = fs.statSync(targetPath);
        
        if (stat.isDirectory()) {
          await this.cleanDirectory(targetPath, target);
        } else if (stat.isFile()) {
          await this.cleanFile(targetPath, target);
        }
      } else {
        this.log(`⚠ Target not found: ${target}`, colors.yellow);
      }
    } catch (error) {
      this.errors.push({
        target,
        error: error.message,
      });
      this.log(`✗ Error cleaning ${target}: ${error.message}`, colors.red);
    }
  }

  async cleanDirectory(dirPath, target) {
    try {
      // Calculate directory size before deletion
      const size = this.getDirectorySize(dirPath);
      
      // Remove directory
      fs.rmSync(dirPath, { recursive: true, force: true });
      
      this.cleanedDirectories.push({
        path: target,
        size,
      });
      
      this.log(`✓ Cleaned directory: ${target} (${this.formatBytes(size)})`, colors.green);
    } catch (error) {
      throw new Error(`Failed to clean directory: ${error.message}`);
    }
  }

  async cleanFile(filePath, target) {
    try {
      // Get file size
      const stat = fs.statSync(filePath);
      const size = stat.size;
      
      // Remove file
      fs.unlinkSync(filePath);
      
      this.cleanedFiles.push({
        path: target,
        size,
      });
      
      this.log(`✓ Cleaned file: ${target} (${this.formatBytes(size)})`, colors.green);
    } catch (error) {
      throw new Error(`Failed to clean file: ${error.message}`);
    }
  }

  async cleanGlobPattern(pattern) {
    // For now, we'll handle specific patterns manually
    if (pattern === '*.log') {
      await this.cleanLogFiles();
    } else if (pattern === '*.tmp' || pattern === '*.temp') {
      await this.cleanTempFiles();
    }
  }

  async cleanLogFiles() {
    const logFiles = this.findFilesByPattern('*.log');
    for (const logFile of logFiles) {
      await this.cleanFile(logFile, path.basename(logFile));
    }
  }

  async cleanTempFiles() {
    const tempFiles = [
      ...this.findFilesByPattern('*.tmp'),
      ...this.findFilesByPattern('*.temp'),
    ];
    for (const tempFile of tempFiles) {
      await this.cleanFile(tempFile, path.basename(tempFile));
    }
  }

  findFilesByPattern(pattern) {
    const files = [];
    const searchDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            searchDir(itemPath);
          } else if (stat.isFile() && this.matchesPattern(item, pattern)) {
            files.push(itemPath);
          }
        }
      } catch (error) {
        // Ignore errors when searching
      }
    };
    
    searchDir(projectRoot);
    return files;
  }

  matchesPattern(filename, pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filename);
  }

  getDirectorySize(dirPath) {
    let size = 0;
    try {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          size += this.getDirectorySize(itemPath);
        } else {
          size += stat.size;
        }
      }
    } catch (error) {
      // Ignore errors when calculating size
    }
    return size;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  }

  generateReport() {
    this.log(`\n${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗`);
    this.log('║                    CLEANUP REPORT                         ║');
    this.log(`╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    this.log(`${colors.green}✓ Directories cleaned: ${this.cleanedDirectories.length}`, colors.green);
    this.log(`${colors.blue}✓ Files cleaned: ${this.cleanedFiles.length}`, colors.blue);
    this.log(`${colors.red}✗ Errors: ${this.errors.length}`, colors.red);

    const totalSize = [
      ...this.cleanedDirectories,
      ...this.cleanedFiles,
    ].reduce((sum, item) => sum + item.size, 0);

    this.log(`${colors.magenta}💾 Total space freed: ${this.formatBytes(totalSize)}`, colors.magenta);

    if (this.cleanedDirectories.length > 0) {
      this.log(`\n${colors.bright}Cleaned Directories:${colors.reset}`);
      this.cleanedDirectories.forEach(dir => {
        this.log(`  ${dir.path}: ${this.formatBytes(dir.size)}`);
      });
    }

    if (this.cleanedFiles.length > 0) {
      this.log(`\n${colors.bright}Cleaned Files:${colors.reset}`);
      this.cleanedFiles.forEach(file => {
        this.log(`  ${file.path}: ${this.formatBytes(file.size)}`);
      });
    }

    if (this.errors.length > 0) {
      this.log(`\n${colors.bright}${colors.red}Errors:${colors.reset}`);
      this.errors.forEach(error => {
        this.log(`  ${error.target}: ${error.error}`);
      });
    }

    this.log(`\n${colors.green}Build files cleanup completed!${colors.reset}\n`);
  }
}

// Run the cleaner
const cleaner = new BuildFilesCleaner();
cleaner.cleanBuildFiles().catch(console.error);
