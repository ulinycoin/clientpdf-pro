#!/usr/bin/env node

// Создаем только отсутствующие Twitter Card файлы
import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Отсутствующие файлы
const MISSING_FILES = [
  'twitter-card-compress-pdf-de.png',
  'twitter-card-compress-pdf-en.png', 
  'twitter-card-compress-pdf-es.png',
  'twitter-card-compress-pdf-fr.png',
  'twitter-card-compress-pdf-ru.png',
  'twitter-card-excel-to-pdf-de.png'
];

// Данные для отсутствующих инструментов
const TOOL_DATA = {
  'compress-pdf': {
    icon: '🗜️',
    en: { title: 'Compress PDF Files - LocalPDF', description: 'Reduce PDF file size intelligently. Maintain quality while optimizing for web and email.' },
    ru: { title: 'Сжать PDF файлы - LocalPDF', description: 'Уменьшите размер PDF файлов умно. Сохраняйте качество при оптимизации для веба.' },
    de: { title: 'PDF komprimieren - LocalPDF', description: 'PDF-Dateigröße intelligent reduzieren. Qualität beibehalten bei Web-Optimierung.' },
    fr: { title: 'Compresser PDF - LocalPDF', description: 'Réduire intelligemment la taille des fichiers PDF. Maintenir la qualité lors de l\'optimisation.' },
    es: { title: 'Comprimir PDF - LocalPDF', description: 'Reducir inteligentemente el tamaño de archivos PDF. Mantener calidad al optimizar.' }
  },
  'excel-to-pdf': {
    icon: '📊',
    de: { title: 'Excel zu PDF - LocalPDF', description: 'Excel-Tabellen in PDF-Format konvertieren. Multi-Blatt-Unterstützung mit Auto-Größe.' }
  }
};

// Градиенты
const GRADIENTS = {
  'compress-pdf': ['#10b981', '#047857'], // green
  'excel-to-pdf': ['#10b981', '#047857']  // green
};

const generateCard = async (filename) => {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');
  
  // Парсим имя файла
  const match = filename.match(/twitter-card-(.+)-(.+)\.png/);
  if (!match) return;
  
  const toolId = match[1];
  const language = match[2];
  
  const toolData = TOOL_DATA[toolId];
  if (!toolData || !toolData[language]) return;
  
  const { title, description } = toolData[language];
  const icon = toolData.icon;
  const [color1, color2] = GRADIENTS[toolId] || ['#3b82f6', '#1e40af'];
  
  // Создаем градиент фона
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  
  // Фон
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);
  
  // Полупрозрачный overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, 1200, 630);
  
  // Большая фоновая иконка
  ctx.font = '200px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, 300, 400);
  
  // Основная иконка
  ctx.font = 'bold 120px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(icon, 180, 200);
  
  // Заголовок
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  
  // Разбиваем заголовок на строки
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
  
  // Описание
  ctx.font = '32px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  
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
  
  // LocalPDF логотип
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('LocalPDF.online', 100, 570);
  
  // Privacy badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(950, 500, 200, 80);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(950, 500, 200, 80);
  
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('🔒 PRIVACY FIRST', 1050, 525);
  ctx.fillText('No Uploads', 1050, 545);
  ctx.fillText('100% Local', 1050, 565);
  
  return canvas;
};

// Генерируем отсутствующие файлы
const generateMissing = async () => {
  console.log('🎨 Generating missing Twitter Cards...');
  
  const outputDir = path.join(__dirname, '..', 'public', 'twitter-cards');
  
  for (const filename of MISSING_FILES) {
    try {
      console.log(`📄 Generating ${filename}...`);
      const canvas = await generateCard(filename);
      
      if (canvas) {
        const buffer = canvas.toBuffer('image/png');
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, buffer);
        console.log(`✅ Generated ${filename}`);
      } else {
        console.log(`⚠️ Skipped ${filename} (no data)`);
      }
    } catch (error) {
      console.error(`❌ Error generating ${filename}:`, error.message);
    }
  }
  
  console.log('🎉 Missing Twitter Cards generated!');
};

// Запуск генерации
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMissing().catch(console.error);
}

export { generateMissing };