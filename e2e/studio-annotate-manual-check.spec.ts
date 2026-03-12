import { test, expect } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createTextPdf(name: string): Promise<string> {
  const path = join(__dirname, `${name}.pdf`);
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('LocalPDF Browser Extension', { x: 80, y: 680, size: 34, font });
  page.drawText('Privacy-First PDF Processing', { x: 80, y: 625, size: 20, font });
  page.drawText('All operations happen locally', { x: 80, y: 585, size: 18, font });
  page.drawText('your files never leave your device.', { x: 80, y: 560, size: 18, font });
  const bytes = await doc.save();
  writeFileSync(path, bytes);
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

test.skip('annotate adds underline and highlight overlays', async ({ page }) => {
  test.setTimeout(120_000);
  const pdfPath = await createTextPdf('dummy-studio-annotate-check');

  try {
    await page.goto('/app/studio?inplace_edit=0');

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(pdfPath);

    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20000 });

    await page.waitForFunction(() => {
      const store = (window as Window & { __LOCALPDF_STUDIO_STORE__?: { getState: () => {
        documents: Array<{ id: string; pages: Array<{ id: string }> }>;
        setActiveDocument: (id: string | null) => void;
        setSelection: (selection: Array<{ docId: string; pageId: string }>) => void;
      } } }).__LOCALPDF_STUDIO_STORE__;
      if (!store) return false;
      const state = store.getState();
      const doc = state.documents[0];
      const firstPage = doc?.pages[0];
      if (!doc || !firstPage) return false;
      state.setActiveDocument(doc.id);
      state.setSelection([{ docId: doc.id, pageId: firstPage.id }]);
      return true;
    }, { timeout: 20000 });

    await page
      .locator('button[title="Edit page content"]')
      .first()
      .evaluate((el) => (el as HTMLButtonElement).click());
    await expect(page).toHaveURL(/\/studio\/edit$/);

    const annotateToolBtn = page.locator('.studio-editor-left-toolbar .studio-edit-tool-btn').nth(2);
    await annotateToolBtn.click();

    const textHighlight = page.locator('.studio-edit-text-highlight').first();
    await expect(textHighlight).toBeVisible({ timeout: 15000 });
    const box = await textHighlight.boundingBox();
    if (!box) {
      throw new Error('Text highlight bbox not found');
    }

    await page.getByRole('button', { name: /Underline/i }).click();
    await page.mouse.move(box.x + 8, box.y + box.height * 0.82);
    await page.mouse.down();
    await page.mouse.move(box.x + Math.max(24, box.width - 6), box.y + box.height * 0.82);
    await page.mouse.up();

    await page.getByRole('button', { name: /Highlight/i }).click();
    await page.mouse.move(box.x + 8, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + Math.max(24, box.width - 6), box.y + box.height * 0.5);
    await page.mouse.up();

    await expect(page.locator('.studio-editor-element')).toHaveCount(2);
  } finally {
    safeDelete(pdfPath);
  }
});
