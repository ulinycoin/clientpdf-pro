import { test, expect } from '@playwright/test';

test.describe('LocalPDF - PDF Tools Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LocalPDF/);
  });

  test('homepage loads correctly', async ({ page }) => {
    // Проверяем основные элементы главной страницы
    await expect(page.locator('h1')).toContainText('LocalPDF');

    // Проверяем наличие главных инструментов
    await expect(page.locator('text=Merge PDF')).toBeVisible();
    await expect(page.locator('text=Split PDF')).toBeVisible();
    await expect(page.locator('text=Compress PDF')).toBeVisible();
  });

  test('navigate to Excel to PDF tool', async ({ page }) => {
    // Переход к инструменту Excel to PDF
    await page.click('text=Excel to PDF');

    // Проверяем URL
    await expect(page).toHaveURL(/excel-to-pdf/);

    // Проверяем наличие зоны загрузки файлов
    await expect(page.locator('text=Drag and drop')).toBeVisible();

    // Проверяем кнопку генерации тестового файла
    await expect(page.locator('text=Generate Test Excel File')).toBeVisible();
  });

  test('merge PDF tool navigation', async ({ page }) => {
    await page.click('text=Merge PDF');
    await expect(page).toHaveURL(/merge-pdf/);
    await expect(page.locator('text=Select PDF files')).toBeVisible();
  });

  test('split PDF tool navigation', async ({ page }) => {
    await page.click('text=Split PDF');
    await expect(page).toHaveURL(/split-pdf/);
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });
});

test.describe('LocalPDF - Privacy and Security', () => {
  test('no external requests during normal usage', async ({ page }) => {
    const externalRequests: string[] = [];

    // Отслеживаем все network запросы
    page.on('request', (request) => {
      const url = request.url();
      // Исключаем localhost и локальные ресурсы
      if (!url.includes('localhost') && !url.includes('127.0.0.1') && !url.startsWith('file://')) {
        externalRequests.push(url);
      }
    });

    await page.goto('/');
    await page.click('text=Excel to PDF');

    // Должно быть 0 внешних запросов (privacy-first принцип)
    expect(externalRequests).toHaveLength(0);
  });

  test('no cookies or local storage for file data', async ({ page }) => {
    await page.goto('/excel-to-pdf');

    // Проверяем что нет cookies
    const cookies = await page.context().cookies();
    const fileCookies = cookies.filter(cookie =>
      cookie.name.includes('file') ||
      cookie.name.includes('pdf') ||
      cookie.name.includes('excel')
    );
    expect(fileCookies).toHaveLength(0);

    // Проверяем localStorage
    const localStorage = await page.evaluate(() => {
      const items = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.includes('file') || key.includes('pdf') || key.includes('excel'))) {
          items.push(key);
        }
      }
      return items;
    });
    expect(localStorage).toHaveLength(0);
  });
});
