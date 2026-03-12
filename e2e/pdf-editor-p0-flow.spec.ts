import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { extractEmbeddedPdfText } from '../src/services/pdf/pdf-text-extractor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createFixturePdf(name: string): Promise<string> {
  const path = join(__dirname, `pdf-editor-p0-${name}.pdf`);
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('PDF EDITOR P0 FIXTURE', { x: 72, y: 700, size: 24, font });
  writeFileSync(path, await doc.save());
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

async function uploadFixture(page: import('@playwright/test').Page, pdfPath: string): Promise<void> {
  await page.goto('/pdf-editor');
  await expect(page.locator('.pdf-editor-title')).toBeVisible({ timeout: 15000 });
  await page.locator('.pdf-editor-left input[type="file"]').setInputFiles(pdfPath);
  await expect(page.locator('.pdf-editor-preview-stage')).toBeVisible({ timeout: 20000 });
}

async function uploadFixtureByDrop(page: import('@playwright/test').Page, pdfPath: string): Promise<void> {
  await page.goto('/pdf-editor');
  await expect(page.locator('.pdf-editor-title')).toBeVisible({ timeout: 15000 });

  const uploadZone = page.locator('.pdf-editor-left .ocr-concept-upload');
  const bytes = await readFile(pdfPath);
  const dataTransfer = await page.evaluateHandle((payload) => {
    const dt = new DataTransfer();
    const file = new File([new Uint8Array(payload.bytes)], payload.name, { type: 'application/pdf' });
    dt.items.add(file);
    return dt;
  }, { bytes: Array.from(bytes), name: 'drop-upload.pdf' });

  await uploadZone.dispatchEvent('dragover', { dataTransfer });
  await expect(uploadZone).toHaveClass(/dragging/);
  await uploadZone.dispatchEvent('drop', { dataTransfer });
  await expect(uploadZone).not.toHaveClass(/dragging/);
  await expect(page.locator('.ocr-concept-file-name')).not.toContainText('No file selected');
  await expect(page.locator('.pdf-editor-preview-stage')).toBeVisible({ timeout: 20000 });

  await dataTransfer.dispose();
}

async function addTextBlockAtCenter(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Add Text' }).click();
  const stage = page.locator('.pdf-editor-preview-stage');
  const box = await stage.boundingBox();
  if (!box) {
    throw new Error('Missing PDF editor stage bounds');
  }
  await stage.click({
    position: {
      x: Math.floor(box.width * 0.5),
      y: Math.floor(box.height * 0.5),
    },
  });
  await expect(page.locator('.pdf-editor-overlay-input').first()).toBeVisible({ timeout: 10000 });
}

async function drawShapeAtCenter(
  page: import('@playwright/test').Page,
  buttonName: 'Rectangle' | 'Circle' | 'Line' | 'Whiteout',
): Promise<void> {
  await page.getByRole('button', { name: buttonName }).click();
  const stage = page.locator('.pdf-editor-preview-stage');
  const box = await stage.boundingBox();
  if (!box) {
    throw new Error('Missing PDF editor stage bounds');
  }
  const startX = Math.floor(box.width * 0.32);
  const startY = Math.floor(box.height * 0.36);
  const endX = Math.floor(box.width * 0.56);
  const endY = buttonName === 'Line' ? Math.floor(box.height * 0.52) : Math.floor(box.height * 0.58);
  await stage.hover({ position: { x: startX, y: startY } });
  await page.mouse.down();
  await stage.hover({ position: { x: endX, y: endY } });
  await page.mouse.up();
}

test.describe.skip('PDF Editor P0', () => {
  test.setTimeout(120_000);

  test('supports upload via drag-and-drop', async ({ page }) => {
    const pdfPath = await createFixturePdf('drop-upload');
    try {
      await uploadFixtureByDrop(page, pdfPath);
    } finally {
      safeDelete(pdfPath);
    }
  });

  test('add text + undo/redo + save + download', async ({ page }) => {
    const pdfPath = await createFixturePdf('save-download');
    const tempDir = await mkdtemp(join(tmpdir(), 'localpdf-pdf-editor-'));
    try {
      await uploadFixture(page, pdfPath);

      await addTextBlockAtCenter(page);
      const textarea = page.locator('.pdf-editor-overlay-input').first();
      await expect(textarea).toBeVisible({ timeout: 10000 });

      const boldButton = page.getByRole('button', { name: 'Bold' });
      await boldButton.click();
      await expect(boldButton).toHaveClass(/pdf-editor-btn-active/);

      await page.getByRole('button', { name: 'Undo' }).click();
      await expect(boldButton).not.toHaveClass(/pdf-editor-btn-active/);

      await page.getByRole('button', { name: 'Redo' }).click();
      await expect(boldButton).toHaveClass(/pdf-editor-btn-active/);

      await textarea.fill('AUTONOMOUS E2E BLOCK');
      await drawShapeAtCenter(page, 'Whiteout');
      await drawShapeAtCenter(page, 'Rectangle');
      await drawShapeAtCenter(page, 'Circle');
      await drawShapeAtCenter(page, 'Line');

      await page.getByRole('button', { name: 'Save PDF' }).click();
      const downloadButton = page.getByRole('button', { name: 'Download File' });
      await expect(downloadButton).toBeVisible({ timeout: 30000 });
      await expect(downloadButton).toBeEnabled();

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadButton.click(),
      ]);
      const downloadedPath = join(tempDir, await download.suggestedFilename());
      await download.saveAs(downloadedPath);

      const bytes = new Uint8Array(await readFile(downloadedPath));
      const extracted = await extractEmbeddedPdfText(new Blob([bytes], { type: 'application/pdf' }));
      const normalized = (extracted?.text ?? '').replace(/\s+/gu, '').toUpperCase();
      expect(normalized).toContain('AUTONOMOUSE2EBLOCK');
    } finally {
      safeDelete(pdfPath);
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test('cancel asks confirmation when unsaved changes exist', async ({ page }) => {
    const pdfPath = await createFixturePdf('cancel-confirm');
    try {
      await uploadFixture(page, pdfPath);
      await addTextBlockAtCenter(page);

      let firstDialogMessage = '';
      page.once('dialog', async (dialog) => {
        firstDialogMessage = dialog.message();
        await dialog.dismiss();
      });
      await page.locator('.pdf-editor-left').getByRole('button', { name: 'Cancel' }).click();
      await expect.poll(() => firstDialogMessage.length > 0).toBe(true);
      expect(firstDialogMessage.toLowerCase()).toContain('unsaved');
      await expect(page.locator('.pdf-editor-preview-stage')).toBeVisible();

      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      await page.locator('.pdf-editor-left').getByRole('button', { name: 'Cancel' }).click();
      await expect(page.locator('.pdf-editor-preview-stage')).toHaveCount(0);
      await expect(page.getByText('No file selected')).toBeVisible();
    } finally {
      safeDelete(pdfPath);
    }
  });
});
