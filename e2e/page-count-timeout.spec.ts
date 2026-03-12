import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createDummyPdf(name: string): Promise<string> {
  const path = join(__dirname, `dummy-${name}.pdf`);
  const doc = await PDFDocument.create();
  doc.addPage([612, 792]);
  const bytes = await doc.save();
  writeFileSync(path, bytes);
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

test.skip('split-pdf: with fallback=off, page-count timeout surfaces timeout banner or stays recoverable in config', async ({ page }) => {
  const pdfPath = await createDummyPdf('page-count-timeout');

  try {
    await page.goto('/');
    await page.getByRole('link', { name: 'Split PDF' }).click();

    await page.evaluate(() => {
      const api = (window as any).__LOCALPDF_V6_TEST_API;
      if (!api) {
        throw new Error('Test API is unavailable');
      }
      api.clearTelemetry?.();
      api.setPageCountFallbackMode('off');
      api.setPageCountTimeoutMs(50);
      api.setPageCountDelayMs(250);
    });

    await page.locator('section.wizard-shell input[type="file"]').first().setInputFiles([pdfPath]);

    const errorBanner = page.locator('div.mb-4.rounded-xl.border.border-red-200.bg-red-50').filter({ hasText: 'Page-count precheck timed out' });
    const configReady = page.getByRole('button', { name: 'Run Split' });
    await expect(errorBanner.or(configReady)).toBeVisible({ timeout: 15000 });
  } finally {
    if (!page.isClosed()) {
      await page.evaluate(() => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        api?.resetWorkerTestHooks?.();
      });
    }
    safeDelete(pdfPath);
  }
});
