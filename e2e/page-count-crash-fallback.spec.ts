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

test.skip('split-pdf: with fallback=on, slow page-count path avoids timeout banner via safe fallback', async ({ page }) => {
  const pdfPath = await createDummyPdf('page-count-crash-fallback');

  try {
    await page.goto('/');
    await page.getByRole('link', { name: 'Split PDF' }).click();

    await page.evaluate(() => {
      const api = (window as any).__LOCALPDF_V6_TEST_API;
      if (!api) {
        throw new Error('Test API is unavailable');
      }
      api.setPageCountFallbackMode?.('on');
      api.setPageCountTimeoutMs?.(1200);
      api.setPageCountDelayMs?.(2000);
    });

    const fileInput = page.locator('section.wizard-shell input[type="file"]').first();
    const runButton = page.getByRole('button', { name: 'Run Split' });
    await fileInput.setInputFiles([pdfPath]);
    try {
      await expect(runButton).toBeVisible({ timeout: 20000 });
    } catch {
      await fileInput.setInputFiles([pdfPath]);
      await expect(runButton).toBeVisible({ timeout: 20000 });
    }
    const timeoutError = page
      .locator('div.mb-4.rounded-xl.border.border-red-200.bg-red-50')
      .filter({ hasText: /Page-count precheck timed out/i });
    await expect(timeoutError).toHaveCount(0);
    await expect(runButton).toBeVisible({ timeout: 30000 });
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
