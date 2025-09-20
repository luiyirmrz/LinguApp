#!/usr/bin/env node

/**
 * Detect Unoptimized Components Script
 * Accurately detects which components need React.memo optimization
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
║              DETECT UNOPTIMIZED COMPONENTS                  ║
║                    Accurate Component Detector              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

class UnoptimizedComponentDetector {
  constructor() {
    this.optimizedComponents = [];
    this.unoptimizedComponents = [];
    this.nonComponents = [];
    this.errors = [];
  }

  // Detect unoptimized components
  async detectUnoptimizedComponents() {
    log.step('Detecting unoptimized components...');
    
    const componentsPath = path.join(process.cwd(), 'components');
    const allComponentFiles = this.getAllComponentFiles(componentsPath);
    
    log.info(`Found ${allComponentFiles.length} total component files`);
    
    for (const filePath of allComponentFiles) {
      try {
        await this.analyzeComponentFile(filePath);
      } catch (error) {
        this.errors.push({ file: path.basename(filePath), error: error.message });
        log.error(`Failed to analyze ${path.basename(filePath)}: ${error.message}`);
      }
    }
    
    log.success('Analysis completed');
    log.info(`Optimized: ${this.optimizedComponents.length}`);
    log.info(`Unoptimized: ${this.unoptimizedComponents.length}`);
    log.info(`Non-components: ${this.nonComponents.length}`);
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

  // Analyze a single component file
  async analyzeComponentFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Check if it's actually a component (has JSX or React component patterns)
    const hasJSX = content.includes('<') && content.includes('>');
    const hasReactComponent = content.includes('function ') || content.includes('const ') || content.includes('= ()');
    const hasExportDefault = content.includes('export default');
    
    // Skip if it's not a component
    if (!hasJSX && !hasReactComponent) {
      this.nonComponents.push(fileName);
      return;
    }
    
    // Skip if it's a hook or utility
    if (fileName.startsWith('use') || fileName.includes('hook') || fileName.includes('util')) {
      this.nonComponents.push(fileName);
      return;
    }
    
    // Skip if it's already an optimized component
    if (fileName.includes('Optimized') || fileName.includes('Lazy')) {
      this.nonComponents.push(fileName);
      return;
    }
    
    // Check if it has React.memo
    const hasMemo = content.includes('export default memo(') || 
                   content.includes('export default React.memo(') ||
                   (content.includes('memo(') && content.includes('export default'));
    
    if (hasMemo) {
      this.optimizedComponents.push(fileName);
    } else {
      this.unoptimizedComponents.push({
        fileName,
        hasExportDefault,
        hasJSX,
        hasReactComponent,
        needsOptimization: true,
      });
    }
  }

  // Generate detection report
  generateReport() {
    console.log(`\n${colors.bright}${colors.cyan}📊 UNOPTIMIZED COMPONENTS DETECTION REPORT${colors.reset}\n`);
    
    if (this.optimizedComponents.length > 0) {
      console.log(`${colors.bright}Optimized Components (${this.optimizedComponents.length}):${colors.reset}`);
      this.optimizedComponents.forEach(file => {
        console.log(`  ✅ ${file}`);
      });
    }
    
    if (this.unoptimizedComponents.length > 0) {
      console.log(`\n${colors.bright}Unoptimized Components (${this.unoptimizedComponents.length}):${colors.reset}`);
      this.unoptimizedComponents.forEach(comp => {
        console.log(`  ❌ ${comp.fileName}`);
        console.log(`     - Has export default: ${comp.hasExportDefault ? 'Yes' : 'No'}`);
        console.log(`     - Has JSX: ${comp.hasJSX ? 'Yes' : 'No'}`);
        console.log(`     - Has React component: ${comp.hasReactComponent ? 'Yes' : 'No'}`);
      });
    }
    
    if (this.nonComponents.length > 0) {
      console.log(`\n${colors.bright}Non-Components (${this.nonComponents.length}):${colors.reset}`);
      this.nonComponents.forEach(file => {
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
    console.log(`  Total files analyzed: ${this.optimizedComponents.length + this.unoptimizedComponents.length + this.nonComponents.length}`);
    console.log(`  Optimized components: ${this.optimizedComponents.length}`);
    console.log(`  Unoptimized components: ${this.unoptimizedComponents.length}`);
    console.log(`  Non-components: ${this.nonComponents.length}`);
    console.log(`  Errors: ${this.errors.length}`);
    
    // Calculate optimization percentage
    const totalComponents = this.optimizedComponents.length + this.unoptimizedComponents.length;
    const optimizationPercentage = totalComponents > 0 ? Math.round((this.optimizedComponents.length / totalComponents) * 100) : 0;
    console.log(`  Optimization: ${optimizationPercentage}% complete`);
    
    // Save unoptimized components list
    if (this.unoptimizedComponents.length > 0) {
      const unoptimizedList = this.unoptimizedComponents.map(comp => comp.fileName);
      const reportPath = path.join(process.cwd(), 'unoptimized-components.json');
      fs.writeFileSync(reportPath, JSON.stringify(unoptimizedList, null, 2));
      log.success(`Unoptimized components list saved to ${reportPath}`);
    }
  }

  // Run detection
  async run() {
    try {
      await this.detectUnoptimizedComponents();
      this.generateReport();
      
      if (this.unoptimizedComponents.length > 0) {
        log.warning(`${this.unoptimizedComponents.length} components need optimization`);
      } else {
        log.success('All components are optimized!');
      }
    } catch (error) {
      log.error(`Detection failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run detection
if (require.main === module) {
  const detector = new UnoptimizedComponentDetector();
  detector.run();
}

module.exports = UnoptimizedComponentDetector;
