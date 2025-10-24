#!/usr/bin/env node

// Build script for Vercel deployment (Node.js version)
// This script builds both app-spa and website, then merges them

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building LocalPDF v3 for Vercel');
console.log('====================================');
console.log('');

try {
  // Check Node version
  console.log('Node version:', process.version);
  console.log('');

  // Step 1: Build app-spa (React)
  console.log('📦 Step 1/3: Building app-spa...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ App-spa built successfully');
  } catch (error) {
    console.error('❌ App-spa build failed');
    throw error;
  }
  console.log('');

  // Step 2: Build website (Astro)
  console.log('📦 Step 2/3: Building website...');
  execSync('npm run build:web', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Website built successfully');
  console.log('');

  // Step 3: Merge builds
  console.log('📦 Step 3/3: Merging builds...');

  const websiteDistPath = path.join(__dirname, 'website', 'dist');
  const appDistPath = path.join(__dirname, 'dist');

  if (!fs.existsSync(websiteDistPath)) {
    throw new Error('Website dist not found!');
  }

  if (!fs.existsSync(appDistPath)) {
    throw new Error('App-spa dist not found!');
  }

  // Copy website files to dist (recursively)
  function copyRecursive(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(childItemName => {
        copyRecursive(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        );
      });
    } else {
      // Only copy if destination doesn't exist (don't overwrite app-spa files)
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
      }
    }
  }

  // Copy all website files
  copyRecursive(websiteDistPath, appDistPath);

  // Override specific files that should come from website
  const filesToOverride = [
    'robots.txt',
    'sitemap.xml',
    'manifest.json',
    'google34adca022b79f1a0.html',
    'be13ab7c5d7548a1b51e5ce3c969af42.txt'
  ];

  filesToOverride.forEach(file => {
    const srcFile = path.join(websiteDistPath, file);
    const destFile = path.join(appDistPath, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
    }
  });

  // Copy website public files if they exist
  const websitePublicPath = path.join(__dirname, 'website', 'public');
  if (fs.existsSync(websitePublicPath)) {
    copyRecursive(websitePublicPath, appDistPath);
  }

  console.log('✅ Builds merged successfully');
  console.log('');

  // Step 4: Verify structure
  console.log('📋 Deployment structure:');
  console.log('========================');
  const distContents = fs.readdirSync(appDistPath);
  distContents.slice(0, 20).forEach(item => console.log(item));
  if (distContents.length > 20) {
    console.log(`... and ${distContents.length - 20} more`);
  }
  console.log('');

  console.log('✅ Build completed successfully!');
  console.log('');
  console.log('Output directory: dist/');
  console.log('Ready for deployment to Vercel 🎉');

  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
