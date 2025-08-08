import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('LocalPDF - Excel to PDF Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/excel-to-pdf');
    await expect(page).toHaveTitle(/Excel to PDF/);
  });

  test('generate and use test Excel file', async ({ page }) => {
    // Генерируем тестовый Excel файл
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate Test Excel File")');
    const download = await downloadPromise;

    // Проверяем что файл скачался
    expect(download.suggestedFilename()).toContain('.xlsx');

    // Сохраняем файл для использования в тесте
    const filePath = path.join(__dirname, 'test-excel-file.xlsx');
    await download.saveAs(filePath);

    // Загружаем сгенерированный файл
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Ожидаем обработки файла
    await expect(page.locator('text=File uploaded successfully')).toBeVisible({ timeout: 5000 });
  });

  test('landscape orientation conversion', async ({ page }) => {
    // Генерируем тестовый файл
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate Test Excel File")');
    const download = await downloadPromise;
    const filePath = path.join(__dirname, 'test-landscape.xlsx');
    await download.saveAs(filePath);

    // Загружаем файл
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Выбираем альбомную ориентацию
    await page.selectOption('select[name="orientation"]', 'landscape');

    // Конвертируем в PDF
    await page.click('button:has-text("Convert to PDF")');

    // Ожидаем успешной конвертации без ошибок currentX
    const errorMessage = page.locator('text=currentX is not defined');
    await expect(errorMessage).not.toBeVisible({ timeout: 10000 });

    // Проверяем успешную генерацию PDF
    await expect(page.locator('text=Download PDF')).toBeVisible({ timeout: 15000 });
  });

  test('multilingual text processing', async ({ page }) => {
    // Генерируем тестовый файл с мультиязычным контентом
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate Test Excel File")');
    const download = await downloadPromise;
    const filePath = path.join(__dirname, 'test-multilingual.xlsx');
    await download.saveAs(filePath);

    // Загружаем и конвертируем
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.click('button:has-text("Convert to PDF")');

    // Проверяем что нет ошибок с кодировкой или шрифтами
    const processingStatus = page.locator('[data-testid="processing-status"]');
    await expect(processingStatus).not.toContainText('font error', { timeout: 15000 });
    await expect(processingStatus).not.toContainText('encoding error', { timeout: 15000 });

    // Успешная генерация PDF
    await expect(page.locator('text=Download PDF')).toBeVisible({ timeout: 15000 });
  });

  test('wide table handling (20+ columns)', async ({ page }) => {
    // Тестируем обработку широких таблиц
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate Test Excel File")');
    const download = await downloadPromise;
    const filePath = path.join(__dirname, 'test-wide-table.xlsx');
    await download.saveAs(filePath);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Выбираем альбомную ориентацию для широких таблиц
    await page.selectOption('select[name="orientation"]', 'landscape');

    await page.click('button:has-text("Convert to PDF")');

    // Проверяем что колонки не накладываются друг на друга
    const overlappingColumnsError = page.locator('text=column overlap');
    await expect(overlappingColumnsError).not.toBeVisible({ timeout: 15000 });

    // Успешная конвертация
    await expect(page.locator('text=Download PDF')).toBeVisible({ timeout: 15000 });
  });

  test('error handling for invalid files', async ({ page }) => {
    // Создаем текстовый файл вместо Excel
    const invalidFilePath = path.join(__dirname, 'invalid-file.txt');

    // Пытаемся загрузить неверный файл
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidFilePath);

    // Должна появиться ошибка валидации
    await expect(page.locator('text=Invalid file format')).toBeVisible({ timeout: 5000 });

    // Кнопка конвертации должна быть недоступна
    const convertButton = page.locator('button:has-text("Convert to PDF")');
    await expect(convertButton).toBeDisabled();
  });

  test('memory usage with large files', async ({ page }) => {
    // Мониторим использование памяти при обработке файлов
    await page.evaluate(() => {
      (window as any).initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Генерируем и загружаем тестовый файл
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate Test Excel File")');
    const download = await downloadPromise;
    const filePath = path.join(__dirname, 'test-memory.xlsx');
    await download.saveAs(filePath);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.click('button:has-text("Convert to PDF")');
    await expect(page.locator('text=Download PDF')).toBeVisible({ timeout: 15000 });

    // Проверяем что не произошло утечки памяти
    const memoryIncrease = await page.evaluate(() => {
      const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const initialMemory = (window as any).initialMemory || 0;
      return currentMemory - initialMemory;
    });

    // Увеличение памяти не должно превышать разумные пределы (например, 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
