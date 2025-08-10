#!/usr/bin/env node

// Создание заглушек для социальных изображений
// В продакшене замените на реальные изображения 1200x630px

import fs from 'fs';
import path from 'path';

const publicDir = 'public';

// SVG заглушка для Open Graph изображения (1200x630)
const ogImageSVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="1200" height="630" fill="url(#gradient)"/>
  
  <!-- Background pattern -->
  <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
    <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#dots)"/>
  
  <!-- Content -->
  <rect x="60" y="60" width="1080" height="510" rx="20" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  
  <!-- Icon -->
  <rect x="100" y="120" width="80" height="80" rx="16" fill="white"/>
  <text x="140" y="175" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="#3B82F6">📄</text>
  
  <!-- Main text -->
  <text x="220" y="155" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white">LocalPDF</text>
  <text x="220" y="200" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.9)">Privacy-First PDF Tools</text>
  
  <!-- Features -->
  <text x="220" y="280" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.8)">• 13 Powerful PDF Tools</text>
  <text x="220" y="320" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.8)">• 100% Private Processing</text>
  <text x="220" y="360" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.8)">• No Uploads Required</text>
  <text x="220" y="400" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.8)">• Completely Free Forever</text>
  
  <!-- URL -->
  <text x="220" y="480" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)">localpdf.online</text>
</svg>`;

// SVG заглушка для Twitter Card (1200x675 - Twitter оптимальный размер)
const twitterCardSVG = `<svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="twitterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1DA1F2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0D8BD9;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="1200" height="675" fill="url(#twitterGradient)"/>
  
  <!-- Background pattern -->
  <pattern id="twitterDots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
    <circle cx="15" cy="15" r="1.5" fill="rgba(255,255,255,0.1)"/>
  </pattern>
  <rect width="1200" height="675" fill="url(#twitterDots)"/>
  
  <!-- Content card -->
  <rect x="80" y="80" width="1040" height="515" rx="20" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  
  <!-- Icon -->
  <rect x="120" y="140" width="70" height="70" rx="14" fill="#3B82F6"/>
  <text x="155" y="190" font-family="Arial, sans-serif" font-size="42" text-anchor="middle" fill="white">📄</text>
  
  <!-- Main text -->
  <text x="220" y="170" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="#1f2937">LocalPDF</text>
  <text x="220" y="210" font-family="Arial, sans-serif" font-size="28" fill="#6b7280">Privacy-First PDF Tools</text>
  
  <!-- Description -->
  <text x="220" y="280" font-family="Arial, sans-serif" font-size="24" fill="#374151">Process PDF files directly in your browser</text>
  <text x="220" y="310" font-family="Arial, sans-serif" font-size="24" fill="#374151">No uploads • No tracking • Completely free</text>
  
  <!-- Features grid -->
  <rect x="220" y="350" width="180" height="80" rx="10" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1"/>
  <text x="310" y="380" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#3B82F6">13 Tools</text>
  <text x="310" y="400" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#6B7280">Complete toolkit</text>
  
  <rect x="420" y="350" width="180" height="80" rx="10" fill="#F0FDF4" stroke="#10B981" stroke-width="1"/>
  <text x="510" y="380" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#10B981">100% Private</text>
  <text x="510" y="400" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#6B7280">Local processing</text>
  
  <rect x="620" y="350" width="180" height="80" rx="10" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1"/>
  <text x="710" y="380" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#F59E0B">Free Forever</text>
  <text x="710" y="400" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#6B7280">No limits</text>
  
  <!-- URL -->
  <text x="220" y="500" font-family="Arial, sans-serif" font-size="22" fill="#6B7280">🌐 localpdf.online</text>
</svg>`;

// Функция для создания изображений
function createSocialImages() {
  const ogPath = path.join(publicDir, 'og-image.png');
  const twitterPath = path.join(publicDir, 'twitter-card.png');
  
  // Создаем SVG файлы (браузеры поддерживают SVG как изображения)
  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogImageSVG);
  fs.writeFileSync(path.join(publicDir, 'twitter-card.svg'), twitterCardSVG);
  
  console.log('✅ Created social media images (SVG format):');
  console.log('   - public/og-image.svg (1200x630)');
  console.log('   - public/twitter-card.svg (1200x675)');
  console.log('');
  console.log('⚠️  ВАЖНО: В продакшене замените SVG на PNG изображения:');
  console.log('   1. Конвертируйте SVG в PNG с помощью онлайн конвертера');
  console.log('   2. Или используйте дизайн-инструменты (Figma, Canva, Photoshop)');
  console.log('   3. Сохраните как:');
  console.log('      - og-image.png (1200x630px)');
  console.log('      - twitter-card.png (1200x675px)');
  console.log('');
  console.log('📐 Рекомендации для дизайна:');
  console.log('   - Используйте брендинг LocalPDF');
  console.log('   - Включите логотип и основные преимущества');
  console.log('   - Читабельный текст на мобильных устройствах');
  console.log('   - Высокое качество (не сжатые)');
}

createSocialImages();