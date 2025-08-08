import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Скрипт для генерации тестовых PDF файлов для E2E тестов LocalPDF
 */

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

// Создаем директорию если не существует
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

async function createBasicPDF(filename: string, content: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(content, {
    x: 50,
    y: 300,
    size: 16,
    font,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(FIXTURES_DIR, filename), pdfBytes);
  console.log(`✅ Created ${filename}`);
}

async function createMultiPagePDF(filename: string, pageCount: number): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i++) {
    const page = pdfDoc.addPage([600, 400]);
    page.drawText(`Page ${i} of ${pageCount}`, {
      x: 50,
      y: 300,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`This is content for page ${i}`, {
      x: 50,
      y: 250,
      size: 14,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(FIXTURES_DIR, filename), pdfBytes);
  console.log(`✅ Created ${filename} with ${pageCount} pages`);
}

async function createLargePDF(filename: string, targetSizeMB: number): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Создаем много страниц с текстом для достижения нужного размера
  const pagesNeeded = Math.ceil(targetSizeMB * 20); // Примерно 50KB на страницу

  for (let i = 1; i <= pagesNeeded; i++) {
    const page = pdfDoc.addPage([600, 800]);

    // Заполняем страницу текстом
    for (let line = 0; line < 40; line++) {
      page.drawText(`Line ${line + 1} on page ${i} - Lorem ipsum dolor sit amet, consectetur adipiscing elit.`, {
        x: 50,
        y: 750 - (line * 18),
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(FIXTURES_DIR, filename), pdfBytes);
  const sizeKB = Math.round(pdfBytes.length / 1024);
  console.log(`✅ Created ${filename} (${sizeKB}KB, target: ${targetSizeMB}MB)`);
}

async function createLandscapePDF(filename: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([800, 600]); // Альбомная ориентация
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText('Landscape Document', {
    x: 300,
    y: 400,
    size: 24,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText('This document is in landscape orientation', {
    x: 250,
    y: 350,
    size: 14,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(FIXTURES_DIR, filename), pdfBytes);
  console.log(`✅ Created ${filename} (landscape)`);
}

async function createTextDocumentPDF(filename: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const textContent = [
    'Text Extraction Test Document',
    '',
    'This document contains extractable text content.',
    'It includes multiple paragraphs and different formatting.',
    '',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation.',
    '',
    'Special characters: © ® ™ € $ £ ¥',
    'Numbers: 123456789',
    'Symbols: @#$%^&*()_+-=[]{}|;:,.<>?',
  ];

  let yPosition = 750;
  for (const line of textContent) {
    if (line) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
    }
    yPosition -= 20;
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(FIXTURES_DIR, filename), pdfBytes);
  console.log(`✅ Created ${filename} (text document)`);
}

async function createBlankPDF(filename: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage([600, 800]); // Пустая страница для аннотаций

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(FIXTURES_DIR, filename), pdfBytes);
  console.log(`✅ Created ${filename} (blank)`);
}

async function createInvalidTextFile(): Promise<void> {
  const content = 'This is not a PDF file\nIt is a text file for testing error handling';
  fs.writeFileSync(path.join(FIXTURES_DIR, 'invalid-file.txt'), content);
  console.log(`✅ Created invalid-file.txt (for error testing)`);
}

async function generateAllTestFixtures(): Promise<void> {
  console.log('🚀 Generating test fixtures for LocalPDF E2E tests...\n');

  try {
    // Базовые PDF файлы
    await createBasicPDF('test1.pdf', 'Test Document 1\nSimple PDF for merge testing');
    await createBasicPDF('test2.pdf', 'Test Document 2\nAnother PDF for merge testing');

    // Многостраничные документы
    await createMultiPagePDF('multi-page.pdf', 5);

    // Документы разных размеров
    await createLargePDF('large-file.pdf', 5); // 5MB
    await createLargePDF('very-large.pdf', 50); // 50MB
    await createLargePDF('medium-size.pdf', 2); // 2MB

    // Специальные документы
    await createLandscapePDF('landscape-document.pdf');
    await createTextDocumentPDF('text-document.pdf');
    await createBlankPDF('blank-document.pdf');

    // Копии для разных тестов
    await createBasicPDF('test-document.pdf', 'Document for watermark testing');
    await createMultiPagePDF('visual-document.pdf', 3);

    // Файл для OCR тестирования (простой текст как заглушка)
    await createTextDocumentPDF('scanned-document.pdf');

    // Невалидный файл
    await createInvalidTextFile();

    console.log('\n✨ All test fixtures generated successfully!');
    console.log(`📁 Files created in: ${FIXTURES_DIR}`);

    // Показываем размеры файлов
    const files = fs.readdirSync(FIXTURES_DIR);
    console.log('\n📊 File sizes:');
    files.forEach(file => {
      const filePath = path.join(FIXTURES_DIR, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`   ${file}: ${sizeKB}KB`);
    });

  } catch (error) {
    console.error('❌ Error generating fixtures:', error);
    process.exit(1);
  }
}

// Запускаем генерацию если скрипт вызван напрямую
if (require.main === module) {
  generateAllTestFixtures();
}

export { generateAllTestFixtures };
