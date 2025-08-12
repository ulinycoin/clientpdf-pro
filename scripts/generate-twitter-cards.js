#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tool configurations
const TOOLS = [
  'merge-pdf',
  'split-pdf', 
  'compress-pdf',
  'pdf-to-jpg',
  'word-to-pdf',
  'excel-to-pdf'
];

const LANGUAGES = ['en', 'ru', 'de', 'fr', 'es'];

const GRADIENTS = {
  'merge-pdf': 'blue',
  'split-pdf': 'purple',
  'compress-pdf': 'green',
  'pdf-to-jpg': 'blue',
  'word-to-pdf': 'purple',
  'excel-to-pdf': 'green'
};

// Use the same icons as in the project ToolsGrid.tsx
const PROJECT_TOOL_ICONS = {
  'merge-pdf': {
    type: 'text',
    value: 'MERGE',
    emoji: '🔗' // From ToolCard iconMap
  },
  'split-pdf': {
    type: 'text', 
    value: 'SPLIT',
    emoji: '✂️' // From RelatedTools
  },
  'compress-pdf': {
    type: 'text',
    value: 'COMPRESS', 
    emoji: '🗜️' // From ToolCard iconMap and RelatedTools
  },
  'pdf-to-jpg': {
    type: 'text',
    value: 'IMAGE',
    emoji: '🖼️' // From ToolsGrid pdfToImage
  },
  'word-to-pdf': {
    type: 'emoji',
    value: '📄', // Direct from ToolsGrid
    text: 'WORD'
  },
  'excel-to-pdf': {
    type: 'emoji', 
    value: '📊', // Direct from ToolsGrid
    text: 'EXCEL'
  },
  'compress-pdf': {
    type: 'text',
    value: 'COMPRESS', 
    emoji: '🗜️' // From ToolCard iconMap and RelatedTools
  }
};

// Load translations
const loadTranslations = (language) => {
  const translationPath = path.join(__dirname, '..', 'src', 'locales', `${language}.ts`);
  if (!fs.existsSync(translationPath)) {
    console.warn(`Translation file not found: ${translationPath}`);
    return {};
  }
  
  try {
    const content = fs.readFileSync(translationPath, 'utf8');
    // Simple extraction of translation data (would need proper TypeScript parsing in production)
    const match = content.match(/export const \w+: Translations = ({[\s\S]*});/);
    if (match) {
      // This is a simplified parser - in production, use proper TS/JS parsing
      return { tools: {} }; // Placeholder
    }
  } catch (error) {
    console.warn(`Error loading translations for ${language}:`, error.message);
  }
  
  return {};
};

// Fallback tool data
const TOOL_DATA = {
  en: {
    'merge-pdf': { title: 'Merge PDFs', description: 'Combine multiple PDF files into one document' },
    'split-pdf': { title: 'Split PDF', description: 'Split PDF into separate pages or ranges' },
    'compress-pdf': { title: 'Compress PDF', description: 'Reduce PDF file size without quality loss' },
    'pdf-to-jpg': { title: 'PDF to JPG', description: 'Convert PDF pages to JPG images' },
    'word-to-pdf': { title: 'Word to PDF', description: 'Convert Word documents to PDF format' },
    'excel-to-pdf': { title: 'Excel to PDF', description: 'Convert Excel spreadsheets to PDF format' }
  },
  ru: {
    'merge-pdf': { title: 'Объединить PDF', description: 'Объединить несколько PDF файлов в один документ' },
    'split-pdf': { title: 'Разделить PDF', description: 'Разделить PDF на отдельные страницы или диапазоны' },
    'compress-pdf': { title: 'Сжать PDF', description: 'Уменьшить размер PDF файла без потери качества' },
    'pdf-to-jpg': { title: 'PDF в JPG', description: 'Конвертировать страницы PDF в изображения JPG' },
    'word-to-pdf': { title: 'Word в PDF', description: 'Конвертировать документы Word в формат PDF' },
    'excel-to-pdf': { title: 'Excel в PDF', description: 'Конвертировать таблицы Excel в формат PDF' }
  },
  de: {
    'merge-pdf': { title: 'PDF zusammenführen', description: 'Mehrere PDF-Dateien zu einem Dokument kombinieren' },
    'split-pdf': { title: 'PDF teilen', description: 'PDF in separate Seiten oder Bereiche aufteilen' },
    'compress-pdf': { title: 'PDF komprimieren', description: 'PDF-Dateigröße ohne Qualitätsverlust reduzieren' },
    'pdf-to-jpg': { title: 'PDF zu JPG', description: 'PDF-Seiten in JPG-Bilder konvertieren' },
    'word-to-pdf': { title: 'Word zu PDF', description: 'Word-Dokumente in PDF-Format konvertieren' },
    'excel-to-pdf': { title: 'Excel zu PDF', description: 'Excel-Tabellen in PDF-Format konvertieren' }
  },
  fr: {
    'merge-pdf': { title: 'Fusionner PDF', description: 'Combiner plusieurs fichiers PDF en un seul document' },
    'split-pdf': { title: 'Diviser PDF', description: 'Diviser PDF en pages ou plages séparées' },
    'compress-pdf': { title: 'Compresser PDF', description: 'Réduire la taille du fichier PDF sans perte de qualité' },
    'pdf-to-jpg': { title: 'PDF vers JPG', description: 'Convertir les pages PDF en images JPG' },
    'word-to-pdf': { title: 'Word vers PDF', description: 'Convertir les documents Word au format PDF' },
    'excel-to-pdf': { title: 'Excel vers PDF', description: 'Convertir les feuilles Excel au format PDF' }
  },
  es: {
    'merge-pdf': { title: 'Combinar PDF', description: 'Combinar múltiples archivos PDF en un documento' },
    'split-pdf': { title: 'Dividir PDF', description: 'Dividir PDF en páginas o rangos separados' },
    'compress-pdf': { title: 'Comprimir PDF', description: 'Reducir el tamaño del archivo PDF sin pérdida de calidad' },
    'pdf-to-jpg': { title: 'PDF a JPG', description: 'Convertir páginas PDF a imágenes JPG' },
    'word-to-pdf': { title: 'Word a PDF', description: 'Convertir documentos Word a formato PDF' },
    'excel-to-pdf': { title: 'Excel a PDF', description: 'Convertir hojas Excel a formato PDF' }
  }
};

const GRADIENT_COLORS = {
  blue: ['#667eea', '#764ba2'],
  purple: ['#a855f7', '#3b82f6'],
  green: ['#10b981', '#059669']
};

// Generate Twitter Card image
const generateTwitterCard = async (toolId, language, gradient) => {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradientColors = GRADIENT_COLORS[gradient];
  const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGradient.addColorStop(0, gradientColors[0]);
  bgGradient.addColorStop(1, gradientColors[1]);
  
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Полупрозрачный overlay как в HTML примере
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, 1200, 630);

  // Get tool data
  const toolData = TOOL_DATA[language][toolId];
  const title = toolData.title;
  const description = toolData.description;

  // Большая фоновая иконка (центр-левая часть) как в HTML примере
  const iconData = PROJECT_TOOL_ICONS[toolId] || PROJECT_TOOL_ICONS['merge-pdf'];
  const iconSymbol = iconData.type === 'emoji' ? iconData.value : iconData.emoji;
  
  ctx.font = '200px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(iconSymbol, 300, 400);
  
  // Основная иконка
  ctx.font = 'bold 120px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(iconSymbol, 180, 200);

  // Заголовок как в HTML примере
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  
  // Разбиваем заголовок на строки если он длинный
  const titleWords = title.split(' ');
  let titleLine1 = '';
  let titleLine2 = '';
  let currentLine = '';
  
  for (let word of titleWords) {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 650 && currentLine !== '') {
      titleLine1 = currentLine.trim();
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  }
  titleLine2 = currentLine.trim();
  
  if (titleLine1) {
    ctx.fillText(titleLine1, 100, 280);
    ctx.fillText(titleLine2, 100, 340);
  } else {
    ctx.fillText(title, 100, 310);
  }
  
  // Описание как в HTML примере
  ctx.font = '32px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  
  // Разбиваем описание на строки
  const descWords = description.split(' ');
  let descLine1 = '';
  let descLine2 = '';
  let descCurrentLine = '';
  
  for (let word of descWords) {
    const testLine = descCurrentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 800 && descCurrentLine !== '') {
      descLine1 = descCurrentLine.trim();
      descCurrentLine = word + ' ';
    } else {
      descCurrentLine = testLine;
    }
  }
  descLine2 = descCurrentLine.trim();
  
  const descY = titleLine1 ? 420 : 390;
  if (descLine1) {
    ctx.fillText(descLine1, 100, descY);
    ctx.fillText(descLine2, 100, descY + 40);
  } else {
    ctx.fillText(description, 100, descY);
  }

  // LocalPDF логотип внизу как в HTML примере
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('LocalPDF.online', 100, 570);
  
  // Privacy badge как в HTML примере
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(950, 500, 200, 80);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(950, 500, 200, 80);
  
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('🔒 PRIVACY FIRST', 1050, 525);
  ctx.fillText('No Uploads', 1050, 545);
  ctx.fillText('100% Local', 1050, 565);

  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 1196, 626);

  return canvas;
};

// Main generation function
const generateAllCards = async () => {
  console.log('🎨 Generating Twitter Cards for LocalPDF...');
  
  const outputDir = path.join(__dirname, '..', 'public', 'twitter-cards');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let generated = 0;
  const total = TOOLS.length * LANGUAGES.length;

  for (const toolId of TOOLS) {
    for (const language of LANGUAGES) {
      try {
        const gradient = GRADIENTS[toolId] || 'blue';
        const canvas = await generateTwitterCard(toolId, language, gradient);
        
        const filename = `${toolId}-${language}.png`;
        const filepath = path.join(outputDir, filename);
        
        // Save as PNG
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filepath, buffer);
        
        generated++;
        console.log(`✅ Generated ${filename} (${generated}/${total})`);
        
      } catch (error) {
        console.error(`❌ Error generating ${toolId}-${language}:`, error.message);
      }
    }
  }

  console.log(`\n🎉 Generated ${generated} Twitter Card images!`);
  console.log(`📁 Output directory: ${outputDir}`);
  
  // Generate index file for easy reference
  const indexContent = {
    generated: new Date().toISOString(),
    tools: TOOLS,
    languages: LANGUAGES,
    total: generated,
    files: TOOLS.flatMap(tool => 
      LANGUAGES.map(lang => `${tool}-${lang}.png`)
    )
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(indexContent, null, 2)
  );
  
  console.log('📝 Created index.json with file listings');
};

// Add Canvas roundRect polyfill if not available
const testCanvas = createCanvas(1, 1);
const testCtx = testCanvas.getContext('2d');
if (!testCtx.roundRect) {
  testCtx.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
}

// Run the generator
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllCards().catch(console.error);
}

export { generateAllCards };