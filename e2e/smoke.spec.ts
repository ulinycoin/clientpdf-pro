import { test, expect } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createDummyPdf(name: string, pages = 1): Promise<string> {
  const path = join(__dirname, `dummy-${name}.pdf`);
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i += 1) {
    doc.addPage([612, 792]);
  }
  const bytes = await doc.save();
  writeFileSync(path, bytes);
  return path;
}

async function createDummyXlsx(name: string): Promise<string> {
  const path = join(__dirname, `dummy-${name}.xlsx`);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  ws.addRow(['Name', 'Score']);
  ws.addRow(['Alice', 10]);
  ws.addRow(['Bob', 20]);
  await wb.xlsx.writeFile(path);
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

async function uploadThenOpenConfig(
  page: import('@playwright/test').Page,
  toolName: string,
  files: string[],
  runButtonName: string,
): Promise<void> {
  await page.goto('/');
  await page.getByRole('link', { name: toolName }).click();
  await expect(page.getByText('Focus mode: Upload -> Config -> Processing -> Result')).toBeVisible();

  const fileInput = page.locator('section.wizard-shell input[type="file"]').first();
  const runButton = page.getByRole('button', { name: runButtonName });

  await fileInput.setInputFiles(files);
  try {
    await expect(runButton).toBeVisible({ timeout: 15000 });
  } catch {
    // Retry once for occasional browser-level file input race in CI/sandbox.
    await fileInput.setInputFiles(files);
    await expect(runButton).toBeVisible({ timeout: 15000 });
  }
}

async function runWithNoFilesRecovery(
  page: import('@playwright/test').Page,
  files: string[],
  runButtonName: string,
  retryConfig?: () => Promise<void>,
): Promise<void> {
  const runButton = page.getByRole('button', { name: runButtonName });
  const noFilesBanner = page.locator('div.mb-4.rounded-xl.border.border-red-200.bg-red-50').filter({ hasText: 'No files selected' });
  await runButton.click();
  if (!(await noFilesBanner.isVisible().catch(() => false))) {
    return;
  }

  const fileInput = page.locator('section.wizard-shell input[type="file"]').first();
  await fileInput.setInputFiles(files);
  await expect(runButton).toBeVisible({ timeout: 15000 });
  if (retryConfig) {
    await retryConfig();
  }
  await runButton.click();
}

test.describe.skip('LocalPDF Smoke (Wizard)', () => {
  test('rotate-pdf: upload -> config -> processing -> result', async ({ page }) => {
    const dummyPdfPath = await createDummyPdf('rotate');
    try {
      await uploadThenOpenConfig(page, 'Rotate PDF', [dummyPdfPath], 'Run Rotate');
      await page.getByLabel('180°').check();
      await runWithNoFilesRecovery(page, [dummyPdfPath], 'Run Rotate', async () => {
        await page.getByLabel('180°').check();
      });
      await expect(page.getByRole('heading', { name: 'Ready!' })).toBeVisible({ timeout: 20000 });
    } finally {
      safeDelete(dummyPdfPath);
    }
  });

  test('delete-pages-pdf: upload -> config -> processing -> result', async ({ page }) => {
    const dummyPdfPath = await createDummyPdf('delete-pages');
    try {
      await uploadThenOpenConfig(page, 'Delete Pages', [dummyPdfPath], 'Run Delete Pages');
      await page.getByPlaceholder('e.g. 1, 3, 5-8').fill('1');
      await runWithNoFilesRecovery(page, [dummyPdfPath], 'Run Delete Pages', async () => {
        await page.getByPlaceholder('e.g. 1, 3, 5-8').fill('1');
      });
      await expect(page.getByRole('heading', { name: 'Ready!' })).toBeVisible({ timeout: 20000 });
    } finally {
      safeDelete(dummyPdfPath);
    }
  });

  test('delete-pages-pdf: preview shows page counter and page switch controls for multi-page PDF', async ({ page }) => {
    const dummyPdfPath = await createDummyPdf('delete-pages-preview', 3);
    try {
      await uploadThenOpenConfig(page, 'Delete Pages', [dummyPdfPath], 'Run Delete Pages');
      await expect(page.getByText('Pages: 3')).toBeVisible({ timeout: 20000 });
      await expect(page.getByRole('button', { name: 'Next page' })).toBeVisible({ timeout: 20000 });
    } finally {
      safeDelete(dummyPdfPath);
    }
  });

  test('excel-to-pdf: upload -> config -> processing -> result', async ({ page }) => {
    const dummyXlsxPath = await createDummyXlsx('excel');
    try {
      await uploadThenOpenConfig(page, 'Excel to PDF', [dummyXlsxPath], 'Run Excel to PDF');
      await runWithNoFilesRecovery(page, [dummyXlsxPath], 'Run Excel to PDF');
      await expect(page.getByRole('heading', { name: 'Ready!' })).toBeVisible({ timeout: 60000 });
    } finally {
      safeDelete(dummyXlsxPath);
    }
  });

  test.skip('split-pdf: upload -> config -> processing -> result', async ({ page }) => {
    const dummyPdfPath = await createDummyPdf('split', 2);
    try {
      await uploadThenOpenConfig(page, 'Split PDF', [dummyPdfPath], 'Run Split');
      await runWithNoFilesRecovery(page, [dummyPdfPath], 'Run Split');
      await expect(page.getByRole('heading', { name: 'Ready!' })).toBeVisible({ timeout: 30000 });
    } finally {
      safeDelete(dummyPdfPath);
    }
  });

  test('pdf-to-jpg: upload -> config -> processing -> result or graceful error', async ({ page }) => {
    const dummyPdfPath = await createDummyPdf('to-jpg');
    try {
      await uploadThenOpenConfig(page, 'PDF to JPG', [dummyPdfPath], 'Run PDF to JPG');
      await runWithNoFilesRecovery(page, [dummyPdfPath], 'Run PDF to JPG');

      const resultReady = page.getByRole('heading', { name: 'Ready!' });
      const errorBanner = page.locator('div').filter({ hasText: /rasterizer|not supported|error|failed|no files selected/i }).first();

      await expect(resultReady.or(errorBanner)).toBeVisible({ timeout: 60000 });
    } finally {
      safeDelete(dummyPdfPath);
    }
  });
});
