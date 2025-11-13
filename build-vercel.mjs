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
  // Check environment
  console.log('Node version:', process.version);
  console.log('Working directory:', __dirname);
  console.log('Current directory:', process.cwd());
  console.log('');

  // Check files exist
  const indexHtmlPath = path.join(__dirname, 'index.html');
  const mainTsxPath = path.join(__dirname, 'src', 'main.tsx');

  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`index.html not found at ${indexHtmlPath}`);
  }
  if (!fs.existsSync(mainTsxPath)) {
    throw new Error(`src/main.tsx not found at ${mainTsxPath}`);
  }

  console.log('✓ index.html found');
  console.log('✓ src/main.tsx found');
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
  try {
    execSync('npm run build:web', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Website built successfully');
  } catch (error) {
    console.error('❌ Website build failed');
    console.error('Error:', error.message);
    throw error;
  }
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

  // STEP 1: Move React app to /app subdirectory
  console.log('  → Moving React app to /app...');
  const appSubdir = path.join(appDistPath, 'app');

  // Create /app directory
  if (!fs.existsSync(appSubdir)) {
    fs.mkdirSync(appSubdir, { recursive: true });
  }

  // Move app-spa index.html to /app/index.html
  const appIndexSrc = path.join(appDistPath, 'index.html');
  const appIndexDest = path.join(appSubdir, 'index.html');
  if (fs.existsSync(appIndexSrc)) {
    fs.renameSync(appIndexSrc, appIndexDest);
    console.log('    ✓ Moved index.html to /app/index.html');
  }

  // Assets stay in root /assets (shared by both app and website)

  // STEP 2: Copy website files to root
  console.log('  → Copying website files to root...');

  function copyRecursive(src, dest, skipDirs = []) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
      const baseName = path.basename(src);
      if (skipDirs.includes(baseName)) {
        return; // Skip this directory
      }

      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(childItemName => {
        copyRecursive(
          path.join(src, childItemName),
          path.join(dest, childItemName),
          skipDirs
        );
      });
    } else {
      // Copy file, overwriting if needed
      fs.copyFileSync(src, dest);
    }
  }

  // Copy all website files (skip _astro assets, they should stay separate)
  copyRecursive(websiteDistPath, appDistPath, []);

  // STEP 3: Copy website public files if they exist
  const websitePublicPath = path.join(__dirname, 'website', 'public');
  if (fs.existsSync(websitePublicPath)) {
    console.log('  → Copying website public files...');
    copyRecursive(websitePublicPath, appDistPath, []);
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

  // Verify deployment structure
  console.log('🔍 Verifying deployment:');

  // Check SEO homepage
  const seoHomepage = path.join(appDistPath, 'index.html');
  if (fs.existsSync(seoHomepage)) {
    console.log('✓ / → SEO homepage (Astro)');
  } else {
    console.error('✗ SEO homepage MISSING!');
  }

  // Check React app
  const appIndex = path.join(appDistPath, 'app', 'index.html');
  if (fs.existsSync(appIndex)) {
    console.log('✓ /app → React app (SPA)');
  } else {
    console.error('✗ React app MISSING!');
  }

  // Check SEO tool pages
  const seoPages = ['merge-pdf', 'split-pdf', 'compress-pdf'];
  seoPages.forEach(page => {
    const pagePath = path.join(appDistPath, `${page}.html`);
    if (fs.existsSync(pagePath)) {
      console.log(`✓ /${page} → SEO page`);
    } else {
      console.error(`✗ /${page} MISSING!`);
    }
  });
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
