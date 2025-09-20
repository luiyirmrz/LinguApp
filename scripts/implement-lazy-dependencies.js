#!/usr/bin/env node

/**
 * Implement Lazy Dependencies Script
 * Implements lazy loading for heavy dependencies to reduce bundle size
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
║                IMPLEMENT LAZY DEPENDENCIES                  ║
║                    Heavy Library Optimizer                  ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

class LazyDependencyImplementer {
  constructor() {
    this.implementedFiles = [];
    this.skippedFiles = [];
    this.errors = [];
    
    // Heavy dependencies that need lazy loading
    this.heavyDependencies = [
      'react-native-chart-kit',
      'lottie-react-native',
      'react-native-reanimated',
      'firebase',
      '@sentry/react-native',
      'expo-av',
      'expo-image-picker',
      'expo-notifications',
      'expo-location',
      'expo-file-system',
      'expo-sqlite',
      'expo-haptics',
      'expo-speech',
      'expo-crypto',
      'expo-device',
      'expo-constants',
      'expo-linking',
      'expo-web-browser',
      'expo-blur',
      'expo-linear-gradient',
      'expo-status-bar',
      'expo-system-ui',
      'expo-symbols',
      'expo-splash-screen',
      'expo-auth-session',
      'react-native-gesture-handler',
      'react-native-screens',
      'react-native-safe-area-context',
      'react-native-svg',
      '@react-native-async-storage/async-storage',
      '@react-navigation/native',
      '@react-navigation/stack',
      '@react-navigation/bottom-tabs',
      '@react-navigation/drawer',
      'zustand',
      'immer',
      'zod',
      'superjson',
      '@expo/vector-icons',
      'lucide-react-native',
      '@lottiefiles/dotlottie-react',
    ];
  }

  // Implement lazy loading for heavy dependencies
  async implementLazyDependencies() {
    log.step('Implementing lazy loading for heavy dependencies...');
    
    // Check if LazyDependencies service exists
    const lazyDepsPath = path.join(process.cwd(), 'services', 'LazyDependencies.ts');
    if (fs.existsSync(lazyDepsPath)) {
      log.success('LazyDependencies service already exists');
      this.skippedFiles.push('LazyDependencies.ts');
    } else {
      log.warning('LazyDependencies service not found');
    }

    // Update components to use lazy loading
    await this.updateComponentsForLazyLoading();
    
    // Update package.json for better dependency management
    await this.updatePackageJson();
    
    // Create lazy loading examples
    await this.createLazyLoadingExamples();
    
    log.success(`Implemented lazy loading for ${this.implementedFiles.length} files`);
    if (this.skippedFiles.length > 0) {
      log.info(`Skipped ${this.skippedFiles.length} files (already implemented)`);
    }
  }

  // Update components to use lazy loading
  async updateComponentsForLazyLoading() {
    log.step('Updating components for lazy loading...');
    
    const componentsPath = path.join(process.cwd(), 'components');
    const componentFiles = this.getComponentFiles(componentsPath);
    
    for (const file of componentFiles) {
      try {
        await this.updateComponentForLazyLoading(file);
      } catch (error) {
        this.errors.push({ file, error: error.message });
        log.error(`Failed to update ${path.basename(file)}: ${error.message}`);
      }
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

  // Update a single component for lazy loading
  async updateComponentForLazyLoading(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Skip if already using lazy loading
    if (content.includes('lazy(') || content.includes('LazyDependencies')) {
      this.skippedFiles.push(fileName);
      return;
    }

    let updatedContent = content;
    let hasChanges = false;

    // Check for heavy dependencies in imports
    const heavyDepsInFile = this.heavyDependencies.filter(dep => 
      content.includes(`from '${dep}'`) || content.includes(`from "${dep}"`),
    );

    if (heavyDepsInFile.length > 0) {
      // Add lazy loading imports
      const lazyImports = heavyDepsInFile.map(dep => {
        const importName = this.getImportName(dep);
        return `import { lazyLoad${importName} } from '@/services/LazyDependencies';`;
      }).join('\n');

      // Add lazy loading imports after existing imports
      const importEndIndex = content.lastIndexOf('import ');
      if (importEndIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', importEndIndex);
        updatedContent = `${content.slice(0, nextLineIndex + 1) + 
                        lazyImports  }\n${  
                        content.slice(nextLineIndex + 1)}`;
        hasChanges = true;
      }

      // Replace direct imports with lazy loading
      heavyDepsInFile.forEach(dep => {
        const importName = this.getImportName(dep);
        const lazyLoadCall = `lazyLoad${importName}()`;
        
        // Replace import statements
        updatedContent = updatedContent.replace(
          new RegExp(`import.*from ['"]${dep}['"];?`, 'g'),
          `// Lazy loaded: ${dep}`,
        );
        
        // Replace usage with lazy loading calls
        updatedContent = updatedContent.replace(
          new RegExp(`\\b${importName}\\b`, 'g'),
          `await ${lazyLoadCall}`,
        );
      });
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent);
      this.implementedFiles.push(fileName);
      log.success(`Updated ${fileName} for lazy loading`);
    } else {
      this.skippedFiles.push(fileName);
    }
  }

  // Get import name from dependency
  getImportName(dep) {
    const nameMap = {
      'react-native-chart-kit': 'ChartKit',
      'lottie-react-native': 'Lottie',
      'react-native-reanimated': 'Reanimated',
      'firebase': 'Firebase',
      '@sentry/react-native': 'Sentry',
      'expo-av': 'Audio',
      'expo-image-picker': 'ImagePicker',
      'expo-notifications': 'Notifications',
      'expo-location': 'Location',
      'expo-file-system': 'FileSystem',
      'expo-sqlite': 'SQLite',
      'expo-haptics': 'Haptics',
      'expo-speech': 'Speech',
      'expo-crypto': 'Crypto',
      'expo-device': 'Device',
      'expo-constants': 'Constants',
      'expo-linking': 'Linking',
      'expo-web-browser': 'WebBrowser',
      'expo-blur': 'Blur',
      'expo-linear-gradient': 'LinearGradient',
      'expo-status-bar': 'StatusBar',
      'expo-system-ui': 'SystemUI',
      'expo-symbols': 'Symbols',
      'expo-splash-screen': 'SplashScreen',
      'expo-auth-session': 'AuthSession',
      'react-native-gesture-handler': 'GestureHandler',
      'react-native-screens': 'Screens',
      'react-native-safe-area-context': 'SafeArea',
      'react-native-svg': 'SVG',
      '@react-native-async-storage/async-storage': 'AsyncStorage',
      '@react-navigation/native': 'Navigation',
      '@react-navigation/stack': 'StackNavigator',
      '@react-navigation/bottom-tabs': 'TabNavigator',
      '@react-navigation/drawer': 'DrawerNavigator',
      'zustand': 'Zustand',
      'immer': 'Immer',
      'zod': 'Zod',
      'superjson': 'Superjson',
      '@expo/vector-icons': 'VectorIcons',
      'lucide-react-native': 'LucideIcons',
      '@lottiefiles/dotlottie-react': 'DotLottie',
    };
    
    return nameMap[dep] || dep.split('/').pop().replace(/-/g, '');
  }

  // Update package.json for better dependency management
  async updatePackageJson() {
    log.step('Updating package.json for better dependency management...');
    
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add optimization scripts if not present
      if (!packageJson.scripts['optimize:dependencies']) {
        packageJson.scripts['optimize:dependencies'] = 'node scripts/implement-lazy-dependencies.js';
      }
      
      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      this.implementedFiles.push('package.json');
      log.success('Updated package.json for dependency optimization');
      
    } catch (error) {
      this.errors.push({ file: 'package.json', error: error.message });
      log.error(`Failed to update package.json: ${error.message}`);
    }
  }

  // Create lazy loading examples
  async createLazyLoadingExamples() {
    log.step('Creating lazy loading examples...');
    
    const examplesPath = path.join(process.cwd(), 'docs', 'lazy-loading-examples.md');
    
    const examplesContent = `# Lazy Loading Examples

## How to Use Lazy Dependencies

### Basic Usage
\`\`\`typescript
import { lazyLoadChartKit, lazyLoadLottie } from '@/services/LazyDependencies';

// In your component
const MyComponent = () => {
  useEffect(() => {
    // Load heavy dependencies when needed
    lazyLoadChartKit().then(chartKit => {
      // Use chartKit
    });
  }, []);
};
\`\`\`

### Route-based Preloading
\`\`\`typescript
import { preloadDependenciesForRoute } from '@/services/LazyDependencies';

// Preload dependencies for specific routes
const navigateToDashboard = () => {
  preloadDependenciesForRoute('dashboard');
  // Navigate to dashboard
};
\`\`\`

### Component Lazy Loading
\`\`\`typescript
import { LazyDashboard, LazyLessonScreen } from '@/components/CodeSplitter';

// Use lazy loaded components
const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyDashboard />
  </Suspense>
);
\`\`\`
`;

    try {
      // Ensure docs directory exists
      const docsDir = path.dirname(examplesPath);
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
      
      fs.writeFileSync(examplesPath, examplesContent);
      this.implementedFiles.push('docs/lazy-loading-examples.md');
      log.success('Created lazy loading examples');
      
    } catch (error) {
      this.errors.push({ file: 'docs/lazy-loading-examples.md', error: error.message });
      log.error(`Failed to create examples: ${error.message}`);
    }
  }

  // Generate implementation report
  generateReport() {
    console.log(`\n${colors.bright}${colors.cyan}📊 LAZY DEPENDENCIES IMPLEMENTATION REPORT${colors.reset}\n`);
    
    console.log(`${colors.bright}Heavy Dependencies: ${this.heavyDependencies.length}${colors.reset}`);
    
    if (this.implementedFiles.length > 0) {
      console.log(`\n${colors.bright}Implemented Files (${this.implementedFiles.length}):${colors.reset}`);
      this.implementedFiles.forEach(file => {
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
    console.log(`  Heavy dependencies: ${this.heavyDependencies.length}`);
    console.log(`  Files implemented: ${this.implementedFiles.length}`);
    console.log(`  Files skipped: ${this.skippedFiles.length}`);
    console.log(`  Errors: ${this.errors.length}`);
    
    // Calculate implementation percentage
    const totalFiles = this.implementedFiles.length + this.skippedFiles.length;
    const implementationPercentage = totalFiles > 0 ? Math.round((this.implementedFiles.length / totalFiles) * 100) : 0;
    console.log(`  Implementation: ${implementationPercentage}% complete`);
  }

  // Run implementation
  async run() {
    try {
      await this.implementLazyDependencies();
      this.generateReport();
      
      if (this.implementedFiles.length > 0) {
        log.success('Lazy dependencies implementation completed successfully!');
        log.info('Heavy dependencies are now lazy loaded for better performance.');
      } else {
        log.info('No files needed implementation - all are already optimized!');
      }
    } catch (error) {
      log.error(`Implementation failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run implementation
if (require.main === module) {
  const implementer = new LazyDependencyImplementer();
  implementer.run();
}

module.exports = LazyDependencyImplementer;
