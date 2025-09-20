#!/usr/bin/env node

/**
 * Performance Analyzer for LinguApp
 * Analyzes bundle size, performance metrics, and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
║                  LINGUAPP PERFORMANCE ANALYZER              ║
║                        Optimization Report                  ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

// Performance analysis functions
class PerformanceAnalyzer {
  constructor() {
    this.results = {
      bundleSize: {},
      dependencies: {},
      components: {},
      recommendations: [],
    };
  }

  // Analyze bundle size
  analyzeBundleSize() {
    log.step('Analyzing bundle size...');
    
    try {
      // Check if dist folder exists
      const distPath = path.join(process.cwd(), 'dist');
      if (!fs.existsSync(distPath)) {
        log.warning('Dist folder not found. Building project first...');
        execSync('npm run build', { stdio: 'pipe' });
      }

      // Analyze bundle files
      const bundleFiles = this.getBundleFiles(distPath);
      let totalSize = 0;

      bundleFiles.forEach(file => {
        const stats = fs.statSync(file);
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += sizeKB;
        
        this.results.bundleSize[path.basename(file)] = {
          size: sizeKB,
          sizeFormatted: this.formatSize(stats.size),
        };
      });

      this.results.bundleSize.total = {
        size: totalSize,
        sizeFormatted: this.formatSize(totalSize * 1024),
      };

      log.success(`Total bundle size: ${this.formatSize(totalSize * 1024)}`);
      
      // Check for large files
      const largeFiles = Object.entries(this.results.bundleSize)
        .filter(([name, data]) => name !== 'total' && data.size > 500)
        .sort((a, b) => b[1].size - a[1].size);

      if (largeFiles.length > 0) {
        log.warning('Large files detected:');
        largeFiles.forEach(([name, data]) => {
          log.warning(`  - ${name}: ${data.sizeFormatted}`);
        });
      }

    } catch (error) {
      log.error(`Bundle analysis failed: ${error.message}`);
    }
  }

  // Analyze dependencies
  analyzeDependencies() {
    log.step('Analyzing dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for heavy dependencies
      const heavyDeps = [
        'react-native-reanimated',
        'expo-av',
        'lottie-react-native',
        '@react-native-firebase',
        'react-native-chart-kit',
      ];

      heavyDeps.forEach(dep => {
        if (dependencies[dep]) {
          this.results.dependencies[dep] = {
            version: dependencies[dep],
            impact: 'high',
            recommendation: 'Consider lazy loading or alternatives',
          };
        }
      });

      // Check for duplicate dependencies
      const duplicateDeps = this.findDuplicateDependencies(dependencies);
      if (duplicateDeps.length > 0) {
        log.warning('Potential duplicate dependencies:');
        duplicateDeps.forEach(dep => log.warning(`  - ${dep}`));
      }

      log.success(`Analyzed ${Object.keys(dependencies).length} dependencies`);

    } catch (error) {
      log.error(`Dependency analysis failed: ${error.message}`);
    }
  }

  // Analyze components
  analyzeComponents() {
    log.step('Analyzing components...');
    
    try {
      const componentsPath = path.join(process.cwd(), 'components');
      const componentFiles = this.getComponentFiles(componentsPath);
      
      componentFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const analysis = this.analyzeComponentFile(content, file);
        this.results.components[path.basename(file)] = analysis;
      });

      // Find components that could benefit from optimization
      const unoptimizedComponents = Object.entries(this.results.components)
        .filter(([name, analysis]) => !analysis.hasMemo && analysis.hasState)
        .map(([name]) => name);

      if (unoptimizedComponents.length > 0) {
        log.warning('Components that could benefit from React.memo:');
        unoptimizedComponents.forEach(name => log.warning(`  - ${name}`));
      }

      log.success(`Analyzed ${componentFiles.length} components`);

    } catch (error) {
      log.error(`Component analysis failed: ${error.message}`);
    }
  }

  // Generate recommendations
  generateRecommendations() {
    log.step('Generating optimization recommendations...');
    
    const recommendations = [];

    // Bundle size recommendations
    if (this.results.bundleSize.total && this.results.bundleSize.total.size > 2000) {
      recommendations.push({
        category: 'Bundle Size',
        priority: 'high',
        title: 'Bundle size is large',
        description: 'Consider code splitting and lazy loading',
        action: 'Implement lazy loading for heavy components',
      });
    }

    // Component optimization recommendations
    const unoptimizedCount = Object.values(this.results.components)
      .filter(comp => !comp.hasMemo && comp.hasState).length;
    
    if (unoptimizedCount > 0) {
      recommendations.push({
        category: 'Components',
        priority: 'medium',
        title: `${unoptimizedCount} components need optimization`,
        description: 'Add React.memo to prevent unnecessary re-renders',
        action: 'Wrap components with React.memo',
      });
    }

    // Dependency recommendations
    const heavyDeps = Object.keys(this.results.dependencies);
    if (heavyDeps.length > 0) {
      recommendations.push({
        category: 'Dependencies',
        priority: 'medium',
        title: 'Heavy dependencies detected',
        description: 'Consider lazy loading or alternatives',
        action: 'Implement lazy loading for heavy libraries',
      });
    }

    this.results.recommendations = recommendations;
    log.success(`Generated ${recommendations.length} recommendations`);
  }

  // Helper methods
  getBundleFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getBundleFiles(fullPath));
      } else if (item.endsWith('.js') || item.endsWith('.css')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  getComponentFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getComponentFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  analyzeComponentFile(content, filePath) {
    return {
      hasMemo: content.includes('React.memo') || content.includes('memo('),
      hasState: content.includes('useState') || content.includes('useReducer'),
      hasEffect: content.includes('useEffect'),
      hasCallback: content.includes('useCallback'),
      hasMemo: content.includes('useMemo'),
      lines: content.split('\n').length,
      size: content.length,
    };
  }

  findDuplicateDependencies(dependencies) {
    const duplicates = [];
    const seen = new Set();
    
    Object.keys(dependencies).forEach(dep => {
      const baseName = dep.split('@')[0];
      if (seen.has(baseName)) {
        duplicates.push(dep);
      }
      seen.add(baseName);
    });
    
    return duplicates;
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  }

  // Generate report
  generateReport() {
    console.log(`\n${colors.bright}${colors.cyan}📊 PERFORMANCE ANALYSIS REPORT${colors.reset}\n`);
    
    // Bundle size report
    console.log(`${colors.bright}Bundle Size Analysis:${colors.reset}`);
    if (this.results.bundleSize.total) {
      console.log(`  Total Size: ${this.results.bundleSize.total.sizeFormatted}`);
    }
    
    // Recommendations
    console.log(`\n${colors.bright}Optimization Recommendations:${colors.reset}`);
    this.results.recommendations.forEach((rec, index) => {
      const priorityColor = rec.priority === 'high' ? colors.red : 
                           rec.priority === 'medium' ? colors.yellow : colors.green;
      
      console.log(`\n${index + 1}. ${priorityColor}[${rec.priority.toUpperCase()}]${colors.reset} ${rec.title}`);
      console.log(`   Category: ${rec.category}`);
      console.log(`   Description: ${rec.description}`);
      console.log(`   Action: ${rec.action}`);
    });

    // Save report to file
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    log.success(`Report saved to ${reportPath}`);
  }

  // Run full analysis
  async run() {
    try {
      this.analyzeBundleSize();
      this.analyzeDependencies();
      this.analyzeComponents();
      this.generateRecommendations();
      this.generateReport();
      
      log.success('Performance analysis completed!');
    } catch (error) {
      log.error(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run analysis
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.run();
}

module.exports = PerformanceAnalyzer;
