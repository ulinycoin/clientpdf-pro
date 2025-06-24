#!/usr/bin/env node
/**
 * Bundle Analyzer Script
 * Analyzes webpack bundle size and provides optimization recommendations
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

const BUNDLE_SIZE_LIMITS = {
  initial: 250 * 1024, // 250KB gzipped
  total: 500 * 1024,   // 500KB gzipped
  css: 50 * 1024       // 50KB gzipped
};

async function analyzeBundleSize() {
  console.log('🔍 Analyzing bundle size...\n');

  try {
    // Build the project first
    console.log('📦 Building project...');
    execSync('npm run build', { stdio: 'inherit' });

    // Get build stats
    const distPath = path.join(process.cwd(), 'dist');
    if (!existsSync(distPath)) {
      throw new Error('dist folder not found. Build may have failed.');
    }

    // Analyze assets
    const assets = analyzeAssets(distPath);
    
    // Generate report
    generateReport(assets);
    
    // Check against limits
    checkLimits(assets);

  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

function analyzeAssets(distPath) {
  const assets = {
    js: [],
    css: [],
    other: []
  };

  function scanDirectory(dir) {
    const { readdirSync, statSync } = require('fs');
    const files = readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else {
        const size = stat.size;
        const relativePath = path.relative(distPath, filePath);
        
        if (file.endsWith('.js')) {
          assets.js.push({ name: relativePath, size });
        } else if (file.endsWith('.css')) {
          assets.css.push({ name: relativePath, size });
        } else {
          assets.other.push({ name: relativePath, size });
        }
      }
    });
  }

  scanDirectory(distPath);
  return assets;
}

function formatSize(bytes) {
  const sizes = ['B', 'KB', 'MB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function generateReport(assets) {
  console.log('📊 Bundle Analysis Report\n');
  console.log('═'.repeat(50));

  // JavaScript files
  const totalJSSize = assets.js.reduce((sum, file) => sum + file.size, 0);
  console.log('\n📦 JavaScript Files:');
  console.log('─'.repeat(30));
  assets.js
    .sort((a, b) => b.size - a.size)
    .forEach(file => {
      const size = formatSize(file.size);
      const percentage = ((file.size / totalJSSize) * 100).toFixed(1);
      console.log(`  ${file.name.padEnd(25)} ${size.padStart(8)} (${percentage}%)`);
    });
  console.log(`\n  Total JS: ${formatSize(totalJSSize)}`);

  // CSS files
  const totalCSSSize = assets.css.reduce((sum, file) => sum + file.size, 0);
  if (assets.css.length > 0) {
    console.log('\n🎨 CSS Files:');
    console.log('─'.repeat(30));
    assets.css
      .sort((a, b) => b.size - a.size)
      .forEach(file => {
        const size = formatSize(file.size);
        console.log(`  ${file.name.padEnd(25)} ${size.padStart(8)}`);
      });
    console.log(`\n  Total CSS: ${formatSize(totalCSSSize)}`);
  }

  // Other assets
  const totalOtherSize = assets.other.reduce((sum, file) => sum + file.size, 0);
  if (assets.other.length > 0) {
    console.log('\n📁 Other Assets:');
    console.log('─'.repeat(30));
    assets.other
      .sort((a, b) => b.size - a.size)
      .slice(0, 10) // Show top 10 only
      .forEach(file => {
        const size = formatSize(file.size);
        console.log(`  ${file.name.padEnd(25)} ${size.padStart(8)}`);
      });
    console.log(`\n  Total Other: ${formatSize(totalOtherSize)}`);
  }

  const totalSize = totalJSSize + totalCSSSize + totalOtherSize;
  console.log('\n═'.repeat(50));
  console.log(`📊 Total Bundle Size: ${formatSize(totalSize)}`);
  console.log('═'.repeat(50));
}

function checkLimits(assets) {
  console.log('\n🎯 Performance Budget Check\n');

  const totalJS = assets.js.reduce((sum, file) => sum + file.size, 0);
  const totalCSS = assets.css.reduce((sum, file) => sum + file.size, 0);
  const totalSize = totalJS + totalCSS;

  // Find main entry file (largest JS file is usually the main entry)
  const mainEntry = assets.js.reduce((largest, file) => 
    file.size > largest.size ? file : largest, { size: 0 });

  const checks = [
    {
      name: 'Initial JS Bundle',
      current: mainEntry.size,
      limit: BUNDLE_SIZE_LIMITS.initial,
      file: mainEntry.name
    },
    {
      name: 'Total Bundle Size',
      current: totalSize,
      limit: BUNDLE_SIZE_LIMITS.total
    },
    {
      name: 'CSS Bundle',
      current: totalCSS,
      limit: BUNDLE_SIZE_LIMITS.css
    }
  ];

  let allPassed = true;

  checks.forEach(check => {
    const percentage = (check.current / check.limit * 100).toFixed(1);
    const status = check.current <= check.limit ? '✅' : '❌';
    const fileInfo = check.file ? ` (${check.file})` : '';
    
    console.log(`${status} ${check.name}:`);
    console.log(`   Current: ${formatSize(check.current)}${fileInfo}`);
    console.log(`   Limit:   ${formatSize(check.limit)}`);
    console.log(`   Usage:   ${percentage}%\n`);

    if (check.current > check.limit) {
      allPassed = false;
    }
  });

  if (!allPassed) {
    console.log('⚠️  Some bundles exceed the performance budget!');
    console.log('\n💡 Optimization Suggestions:');
    console.log('   • Enable code splitting for routes');
    console.log('   • Lazy load PDF libraries');
    console.log('   • Tree-shake unused dependencies');
    console.log('   • Use dynamic imports for heavy libraries');
    console.log('   • Optimize Tailwind CSS purging');
  } else {
    console.log('🎉 All bundles are within performance budget!');
  }

  return allPassed;
}

// Optimization recommendations
function generateOptimizationSuggestions(assets) {
  console.log('\n💡 Optimization Suggestions:\n');

  const largeFiles = assets.js.filter(file => file.size > 100 * 1024); // > 100KB
  
  if (largeFiles.length > 0) {
    console.log('🔍 Large JavaScript files detected:');
    largeFiles.forEach(file => {
      console.log(`   • ${file.name} (${formatSize(file.size)})`);
    });
    console.log('\n   Consider code splitting or lazy loading these files.\n');
  }

  console.log('🚀 General optimizations:');
  console.log('   • Implement route-based code splitting');
  console.log('   • Use React.lazy() for page components');
  console.log('   • Dynamic import PDF libraries only when needed');
  console.log('   • Optimize Tailwind CSS with PurgeCSS');
  console.log('   • Use Vite\'s manual chunks strategy');
  console.log('   • Consider using a lighter alternative to heavy libraries');
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeBundleSize();
}

export { analyzeBundleSize, checkLimits };
