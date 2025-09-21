#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Copy web-specific files to dist directory
const copyWebAssets = () => {
  const distDir = path.join(__dirname, '..', 'dist');
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Copy web-styles.css
  const webStylesSrc = path.join(__dirname, '..', 'web-styles.css');
  const webStylesDest = path.join(distDir, 'web-styles.css');
  
  if (fs.existsSync(webStylesSrc)) {
    fs.copyFileSync(webStylesSrc, webStylesDest);
    console.log('✅ Copied web-styles.css to dist/');
  }
  
  // Copy public directory contents
  if (fs.existsSync(publicDir)) {
    const publicFiles = fs.readdirSync(publicDir);
    
    publicFiles.forEach(file => {
      const srcPath = path.join(publicDir, file);
      const destPath = path.join(distDir, file);
      
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file} to dist/`);
      }
    });
  }
  
  console.log('🎉 Web assets copied successfully!');
};

// Run the copy function
copyWebAssets();
