const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Bundle analysis configuration
const BUNDLE_CONFIG = {
  entryPoints: ['app/index.tsx'],
  outdir: 'dist',
  minify: true,
  sourcemap: false,
  treeShaking: true,
  splitting: true,
  format: 'esm',
  target: ['es2020'],
  plugins: [
    // Add any esbuild plugins here
  ],
};

// Analyze bundle size
function analyzeBundle() {
  console.log('🔍 Analyzing bundle size...');
  
  try {
    // Build the bundle
    execSync('npx expo export --platform web', { stdio: 'inherit' });
    
    // Analyze the output
    const distPath = path.join(process.cwd(), 'dist');
    const files = fs.readdirSync(distPath);
    
    let totalSize = 0;
    const fileSizes = {};
    
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const sizeInKB = Math.round(stats.size / 1024);
      fileSizes[file] = sizeInKB;
      totalSize += sizeInKB;
    });
    
    console.log('\n📊 Bundle Analysis Results:');
    console.log('========================');
    
    Object.entries(fileSizes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([file, size]) => {
        console.log(`${file}: ${size}KB`);
      });
    
    console.log(`\n📦 Total Bundle Size: ${totalSize}KB`);
    
    // Check for large dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    console.log('\n🔍 Large Dependencies (>100KB):');
    Object.entries(dependencies).forEach(([name, version]) => {
      try {
        const pkgPath = require.resolve(name);
        const pkgStats = fs.statSync(pkgPath);
        const sizeInKB = Math.round(pkgStats.size / 1024);
        if (sizeInKB > 100) {
          console.log(`${name}: ${sizeInKB}KB`);
        }
      } catch (error) {
        // Package not found or not accessible
      }
    });
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
  }
}

// Generate bundle report
function generateBundleReport() {
  console.log('📋 Generating bundle report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    bundleConfig: BUNDLE_CONFIG,
    recommendations: [
      'Use dynamic imports for large components',
      'Implement code splitting for routes',
      'Optimize images and assets',
      'Remove unused dependencies',
      'Use tree shaking effectively',
    ],
  };
  
  fs.writeFileSync(
    'bundle-report.json',
    JSON.stringify(report, null, 2),
  );
  
  console.log('✅ Bundle report generated: bundle-report.json');
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      analyzeBundle();
      break;
    case 'report':
      generateBundleReport();
      break;
    default:
      console.log('Usage: node analyze-bundle.js [analyze|report]');
  }
}

module.exports = {
  analyzeBundle,
  generateBundleReport,
  BUNDLE_CONFIG,
};
