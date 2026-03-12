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

test.skip('worker recovery: injected PROCESS_TOOL crash can be retried successfully', async ({ page }) => {
  const pdfPath = await createDummyPdf('worker-recovery');

  try {
    await page.goto('/app/rotate-pdf');
    const fileInput = page.locator('section.wizard-shell input[type="file"]').first();
    const runButton = page.getByRole('button', { name: 'Run Rotate' });

    await fileInput.setInputFiles([pdfPath]);
    try {
      await expect(runButton).toBeVisible({ timeout: 15000 });
    } catch {
      await fileInput.setInputFiles([pdfPath]);
      await expect(runButton).toBeVisible({ timeout: 15000 });
    }

    await page.evaluate(() => {
      const api = (window as any).__LOCALPDF_V6_TEST_API;
      if (!api) {
        throw new Error('Test API is unavailable');
      }
      api.injectProcessToolCrashOnce();
    });

    await runButton.click();
    const errorBanner = page.locator('div.mb-4.rounded-xl.border.border-red-200.bg-red-50');
    const noFilesBanner = errorBanner.filter({ hasText: 'No files selected' });
    if (await noFilesBanner.isVisible().catch(() => false)) {
      await fileInput.setInputFiles([pdfPath]);
      await expect(runButton).toBeVisible({ timeout: 15000 });
      await page.evaluate(() => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        api?.injectProcessToolCrashOnce?.();
      });
      await runButton.click();
    }
    await expect(errorBanner).toContainText('Injected worker crash (e2e)');
    await expect(page.getByText(/ACCESS_CHECK_STAGE rotate-pdf stage=CHECK_FILE_LIMITS_DONE/)).toBeVisible();

    await runButton.click();
    await expect(page.getByRole('heading', { name: 'Ready!' })).toBeVisible({ timeout: 30000 });
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
