/**
 * BUNDLE ANALYZER SCRIPT
 * 
 * This script helps identify and remove unnecessary dependencies
 * to optimize bundle size and improve performance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Dependencies that can be removed or replaced
const UNNECESSARY_DEPENDENCIES = {
  // Large libraries that can be replaced
  'react-native-chart-kit': {
    size: '~2MB',
    alternatives: ['victory-native', 'react-native-svg-charts'],
    reason: 'Very large library for simple charts',
  },
  'react-native-web': {
    size: '~1.5MB',
    alternatives: ['expo-web'],
    reason: 'Expo already provides web support',
  },
  'nativewind': {
    size: '~500KB',
    alternatives: ['StyleSheet', 'styled-components'],
    reason: 'Tailwind CSS adds significant bundle size',
  },
  
  // Duplicate functionality
  '@react-navigation/native': {
    size: '~300KB',
    alternatives: ['expo-router'],
    reason: 'Expo Router provides navigation',
  },
  
  // Unused or overkill libraries
  'expo-location': {
    size: '~200KB',
    alternatives: [],
    reason: 'Not used in current app',
  },
  'expo-image-picker': {
    size: '~150KB',
    alternatives: [],
    reason: 'Not used in current app',
  },
  'expo-notifications': {
    size: '~100KB',
    alternatives: [],
    reason: 'Not used in current app',
  },
  'expo-sqlite': {
    size: '~100KB',
    alternatives: ['AsyncStorage', 'Firebase'],
    reason: 'Using Firebase for data storage',
  },
  'expo-speech': {
    size: '~80KB',
    alternatives: ['Web Speech API'],
    reason: 'Can use browser APIs on web',
  },
  'expo-blur': {
    size: '~60KB',
    alternatives: ['CSS backdrop-filter'],
    reason: 'Not essential for core functionality',
  },
  'expo-crypto': {
    size: '~50KB',
    alternatives: ['Web Crypto API'],
    reason: 'Can use browser APIs on web',
  },
  'expo-device': {
    size: '~40KB',
    alternatives: ['Platform.OS'],
    reason: 'Platform API provides basic device info',
  },
  'expo-symbols': {
    size: '~30KB',
    alternatives: ['lucide-react-native'],
    reason: 'Using Lucide for icons',
  },
  'expo-system-ui': {
    size: '~25KB',
    alternatives: ['StatusBar API'],
    reason: 'Not essential for core functionality',
  },
  'expo-web-browser': {
    size: '~20KB',
    alternatives: ['window.open'],
    reason: 'Can use browser APIs on web',
  },
};

// Performance optimization recommendations
const PERFORMANCE_RECOMMENDATIONS = [
  {
    category: 'Bundle Size',
    recommendations: [
      'Remove unused Expo modules',
      'Replace large chart library with lighter alternative',
      'Remove NativeWind in favor of StyleSheet',
      'Use dynamic imports for heavy components',
      'Implement code splitting for different screens',
    ],
  },
  {
    category: 'State Management',
    recommendations: [
      'Use selective Zustand selectors to prevent unnecessary re-renders',
      'Implement React.memo for expensive components',
      'Use useCallback and useMemo for expensive calculations',
      'Avoid creating new objects in render functions',
    ],
  },
  {
    category: 'Lazy Loading',
    recommendations: [
      'Implement lazy loading for images',
      'Use React.lazy for route-based code splitting',
      'Load heavy components only when needed',
      'Implement virtual scrolling for long lists',
    ],
  },
  {
    category: 'Memory Management',
    recommendations: [
      'Clean up event listeners in useEffect cleanup',
      'Avoid memory leaks in async operations',
      'Use proper cleanup for timers and intervals',
      'Implement proper error boundaries',
    ],
  },
];

// Analyze current bundle
function analyzeBundle() {
  console.log('🔍 Analyzing bundle size...\n');
  
  try {
    // Get package.json dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    console.log('📦 Current Dependencies:');
    Object.keys(dependencies).forEach(dep => {
      const info = UNNECESSARY_DEPENDENCIES[dep];
      if (info) {
        console.log(`❌ ${dep} (${info.size}) - ${info.reason}`);
        if (info.alternatives.length > 0) {
          console.log(`   💡 Alternatives: ${info.alternatives.join(', ')}`);
        }
      } else {
        console.log(`✅ ${dep}`);
      }
    });
    
    console.log('\n📊 Bundle Size Impact:');
    let totalSavings = 0;
    Object.entries(UNNECESSARY_DEPENDENCIES).forEach(([dep, info]) => {
      if (dependencies[dep]) {
        const size = parseFloat(info.size.replace(/[^\d.]/g, ''));
        const unit = info.size.includes('MB') ? 'MB' : 'KB';
        totalSavings += size;
        console.log(`   ${dep}: ${info.size} (${unit})`);
      }
    });
    
    console.log(`\n💰 Potential Bundle Size Savings: ~${totalSavings.toFixed(1)}MB`);
    
  } catch (error) {
    console.error('Error analyzing bundle:', error);
  }
}

// Generate optimization report
function generateReport() {
  console.log('\n📋 PERFORMANCE OPTIMIZATION REPORT\n');
  console.log('=' .repeat(50));
  
  PERFORMANCE_RECOMMENDATIONS.forEach(category => {
    console.log(`\n🎯 ${category.category}:`);
    category.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  });
  
  console.log(`\n${  '=' .repeat(50)}`);
  console.log('\n🚀 IMPLEMENTATION PRIORITY:');
  console.log('1. Remove unnecessary dependencies (immediate impact)');
  console.log('2. Implement React.memo and selective selectors (high impact)');
  console.log('3. Add lazy loading for components (medium impact)');
  console.log('4. Optimize images and assets (medium impact)');
  console.log('5. Implement virtual scrolling (low impact, high complexity)');
}

// Generate optimized package.json
function generateOptimizedPackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Remove unnecessary dependencies
    Object.keys(UNNECESSARY_DEPENDENCIES).forEach(dep => {
      if (packageJson.dependencies[dep]) {
        delete packageJson.dependencies[dep];
      }
      if (packageJson.devDependencies[dep]) {
        delete packageJson.devDependencies[dep];
      }
    });
    
    // Add performance-focused dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      'react-native-fast-image': '^8.6.3',
      'react-native-reanimated': '^3.6.0',
      'react-native-gesture-handler': '^2.14.0',
    };
    
    // Write optimized package.json
    fs.writeFileSync(
      'package-optimized.json',
      JSON.stringify(packageJson, null, 2),
    );
    
    console.log('\n✅ Generated optimized package.json as package-optimized.json');
    
  } catch (error) {
    console.error('Error generating optimized package.json:', error);
  }
}

// Generate performance monitoring code
function generatePerformanceCode() {
  const performanceCode = `
// Performance monitoring utilities
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (__DEV__) {
      console.log(\`\${componentName} rendered \${renderCount.current} times, \${timeSinceLastRender}ms since last render\`);
    }
  });
};

// Bundle size monitoring
export const logBundleSize = () => {
  if (__DEV__) {
    console.log('Bundle size monitoring enabled');
    // Add bundle size tracking logic here
  }
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  useEffect(() => {
    if (__DEV__) {
      const interval = setInterval(() => {
        if (global.performance && global.performance.memory) {
          const memory = global.performance.memory;
          console.log('Memory usage:', {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
          });
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);
};
`;

  fs.writeFileSync('utils/performance-monitor.ts', performanceCode);
  console.log('✅ Generated performance monitoring utilities');
}

// Main function
function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      analyzeBundle();
      break;
    case 'report':
      generateReport();
      break;
    case 'optimize':
      generateOptimizedPackageJson();
      generatePerformanceCode();
      break;
    case 'all':
      analyzeBundle();
      generateReport();
      generateOptimizedPackageJson();
      generatePerformanceCode();
      break;
    default:
      console.log('Usage: node bundle-analyzer.js [analyze|report|optimize|all]');
      console.log('\nCommands:');
      console.log('  analyze  - Analyze current bundle size and dependencies');
      console.log('  report   - Generate performance optimization report');
      console.log('  optimize - Generate optimized package.json and utilities');
      console.log('  all      - Run all analyses and optimizations');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundle,
  generateReport,
  generateOptimizedPackageJson,
  generatePerformanceCode,
  UNNECESSARY_DEPENDENCIES,
  PERFORMANCE_RECOMMENDATIONS,
};
