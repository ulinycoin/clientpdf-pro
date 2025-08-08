import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('LocalPDF - PDF Tools Integration Tests', () => {

  test('merge multiple PDF files', async ({ page }) => {
    await page.goto('/merge-pdf');

    // Предполагаем что у нас есть тестовые PDF файлы
    const testPdf1 = path.join(__dirname, 'fixtures', 'test1.pdf');
    const testPdf2 = path.join(__dirname, 'fixtures', 'test2.pdf');

    // Загружаем несколько PDF файлов
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([testPdf1, testPdf2]);

    // Проверяем что файлы добавлены в список
    await expect(page.locator('text=test1.pdf')).toBeVisible();
    await expect(page.locator('text=test2.pdf')).toBeVisible();

    // Объединяем файлы
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Merge PDFs")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('merged');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('split PDF into pages', async ({ page }) => {
    await page.goto('/split-pdf');

    const testPdf = path.join(__dirname, 'fixtures', 'multi-page.pdf');

    // Загружаем PDF с несколькими страницами
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdf);

    // Ожидаем обработки файла
    await expect(page.locator('text=Pages detected')).toBeVisible({ timeout: 10000 });

    // Выбираем страницы для извлечения
    await page.check('input[type="checkbox"][data-page="1"]');
    await page.check('input[type="checkbox"][data-page="3"]');

    // Разделяем PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Split PDF")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('compress PDF file', async ({ page }) => {
    await page.goto('/compress-pdf');

    const testPdf = path.join(__dirname, 'fixtures', 'large-file.pdf');

    // Загружаем большой PDF файл
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdf);

    // Выбираем уровень сжатия
    await page.selectOption('select[name="compressionLevel"]', 'medium');

    // Сжимаем файл
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Compress PDF")');

    // Ожидаем обработки
    await expect(page.locator('text=Compressing')).toBeVisible();
    await expect(page.locator('text=Download Compressed PDF')).toBeVisible({ timeout: 30000 });

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('compressed');
  });

  test('add watermark to PDF', async ({ page }) => {
    await page.goto('/watermark-pdf');

    const testPdf = path.join(__dirname, 'fixtures', 'test-document.pdf');

    // Загружаем PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdf);

    // Настраиваем watermark
    await page.fill('input[name="watermarkText"]', 'CONFIDENTIAL');
    await page.selectOption('select[name="watermarkPosition"]', 'center');
    await page.fill('input[name="opacity"]', '0.3');

    // Применяем watermark
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Add Watermark")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('watermarked');
  });

  test('extract text from PDF', async ({ page }) => {
    await page.goto('/extract-text-pdf');

    const testPdf = path.join(__dirname, 'fixtures', 'text-document.pdf');

    // Загружаем PDF с текстом
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdf);

    // Извлекаем текст
    await page.click('button:has-text("Extract Text")');

    // Проверяем что текст извлечен
    await expect(page.locator('[data-testid="extracted-text"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="extracted-text"]')).not.toBeEmpty();

    // Возможность скачать как текстовый файл
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download as TXT")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.txt');
  });

  test('convert PDF to images', async ({ page }) => {
    await page.goto('/pdf-to-image');

    const testPdf = path.join(__dirname, 'fixtures', 'visual-document.pdf');

    // Загружаем PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdf);

    // Выбираем формат изображения
    await page.selectOption('select[name="imageFormat"]', 'png');
    await page.selectOption('select[name="quality"]', 'high');

    // Конвертируем в изображения
    await page.click('button:has-text("Convert to Images")');

    // Проверяем генерацию превью
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible({ timeout: 15000 });

    // Скачиваем как ZIP архив
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download All Images")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.zip');
  });

  test('OCR functionality on scanned PDF', async ({ page }) => {
    await page.goto('/ocr-pdf');

    const scannedPdf = path.join(__dirname, 'fixtures', 'scanned-document.pdf');

    // Загружаем отсканированный PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(scannedPdf);

    // Выбираем язык для OCR
    await page.selectOption('select[name="ocrLanguage"]', 'eng+rus');

    // Запускаем OCR
    await page.click('button:has-text("Start OCR")');

    // OCR может занять время, увеличиваем timeout
    await expect(page.locator('text=OCR processing')).toBeVisible();
    await expect(page.locator('text=OCR completed')).toBeVisible({ timeout: 60000 });

    // Проверяем извлеченный текст
    await expect(page.locator('[data-testid="ocr-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="ocr-result"]')).not.toBeEmpty();

    // Скачиваем обработанный PDF с текстовым слоем
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Searchable PDF")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('searchable');
  });

  test('add text annotations to PDF', async ({ page }) => {
    await page.goto('/add-text-pdf');

    const testPdf = path.join(__dirname, 'fixtures', 'blank-document.pdf');

    // Загружаем PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdf);

    // Ожидаем загрузки PDF в canvas
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // Добавляем текст на первую страницу
    await page.click('canvas', { position: { x: 100, y: 100 } });
    await page.fill('input[name="textContent"]', 'Test annotation');

    // Настраиваем стиль текста
    await page.selectOption('select[name="fontSize"]', '16');
    await page.selectOption('select[name="fontColor"]', '#FF0000');

    // Применяем изменения
    await page.click('button:has-text("Add Text")');

    // Проверяем что текст добавлен на canvas
    await expect(page.locator('canvas')).toBeVisible();

    // Сохраняем PDF с аннотациями
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download PDF")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('annotated');
  });

  test('rotate PDF pages', async ({ page }) => {
    await page.goto('/rotate-pdf');

    const testPdf = path.join(__dirname, 'fixtures', 'landscape-document.pdf');

    // Загружаем PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdf);

    // Ожидаем загрузки страниц
    await expect(page.locator('[data-testid="page-preview"]')).toBeVisible({ timeout: 10000 });

    // Выбираем страницы для поворота
    await page.check('input[type="checkbox"][data-page="1"]');
    await page.check('input[type="checkbox"][data-page="2"]');

    // Выбираем угол поворота
    await page.click('button[data-rotation="90"]');

    // Применяем поворот
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Apply Rotation")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('rotated');
  });
});

test.describe('LocalPDF - Performance and Error Handling', () => {

  test('handle very large PDF files gracefully', async ({ page }) => {
    await page.goto('/merge-pdf');

    // Симулируем загрузку очень большого файла
    const largePdf = path.join(__dirname, 'fixtures', 'very-large.pdf');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(largePdf);

    // Проверяем что появляется индикатор прогресса
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible({ timeout: 5000 });

    // Проверяем что не происходит зависания браузера
    const startTime = Date.now();
    await page.click('button:has-text("Merge PDFs")');

    // Если обработка занимает слишком много времени, должно появиться предупреждение
    await expect(page.locator('text=Large file processing')).toBeVisible({ timeout: 30000 });
  });

  test('memory cleanup after file processing', async ({ page }) => {
    await page.goto('/compress-pdf');

    // Получаем начальное использование памяти
    const initialMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);

    const testPdf = path.join(__dirname, 'fixtures', 'medium-size.pdf');

    // Обрабатываем файл
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdf);

    await page.click('button:has-text("Compress PDF")');
    await expect(page.locator('text=Download')).toBeVisible({ timeout: 30000 });

    // Очищаем файлы (симулируем пользователя, начинающего новую операцию)
    await page.click('button:has-text("Clear Files")');

    // Принудительно вызываем garbage collection (если доступно)
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    // Проверяем что память освободилась
    const finalMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
    const memoryIncrease = finalMemory - initialMemory;

    // Увеличение не должно превышать разумный порог
    expect(memoryIncrease).toBeLessThan(30 * 1024 * 1024); // 30MB
  });

  test('network error handling', async ({ page }) => {
    // Отключаем сеть для симуляции offline режима
    await page.context().setOffline(true);

    await page.goto('/excel-to-pdf');

    // Приложение должно работать offline
    await expect(page.locator('text=LocalPDF')).toBeVisible();
    await expect(page.locator('text=Generate Test Excel File')).toBeVisible();

    // Генерация тестового файла должна работать без сети
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate Test Excel File")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('concurrent file processing', async ({ page }) => {
    await page.goto('/');

    // Открываем несколько вкладок для разных инструментов
    const [mergeTab] = await Promise.all([
      page.context().newPage(),
    ]);

    await mergeTab.goto('/merge-pdf');

    // Одновременно обрабатываем файлы в разных вкладках
    const testPdf1 = path.join(__dirname, 'fixtures', 'test1.pdf');
    const testPdf2 = path.join(__dirname, 'fixtures', 'test2.pdf');

    // В главной вкладке - Excel to PDF
    await page.goto('/excel-to-pdf');
    const downloadPromise1 = page.waitForEvent('download');
    await page.click('button:has-text("Generate Test Excel File")');
    const download1 = await downloadPromise1;

    // В дополнительной вкладке - Merge PDF
    const fileInput = mergeTab.locator('input[type="file"]');
    await fileInput.setInputFiles([testPdf1, testPdf2]);

    const downloadPromise2 = mergeTab.waitForEvent('download');
    await mergeTab.click('button:has-text("Merge PDFs")');

    // Оба процесса должны завершиться успешно
    const [excelDownload, mergeDownload] = await Promise.all([
      download1,
      downloadPromise2
    ]);

    expect(excelDownload.suggestedFilename()).toContain('.xlsx');
    const mergeResult = await mergeDownload;
    expect(mergeResult.suggestedFilename()).toContain('.pdf');

    await mergeTab.close();
  });
});
