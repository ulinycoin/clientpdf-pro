import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createTextPdf(name: string): Promise<string> {
  const path = join(__dirname, `inline-${name}.pdf`);
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('INLINE EDIT SAMPLE', { x: 80, y: 700, size: 24, font });
  const bytes = await doc.save();
  writeFileSync(path, bytes);
  return path;
}

async function createNoTextPdf(name: string): Promise<string> {
  const path = join(__dirname, `inline-notext-${name}.pdf`);
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

test.describe('Studio inline text edit', () => {
  test('supports inline edit and save', async ({ page }) => {
    const pdfPath = await createTextPdf('text');
    try {
      await page.goto('/app/studio');
      await page.locator('input[type="file"]').first().setInputFiles(pdfPath);

      await page.waitForFunction(() => {
        const store = (window as Window & { __LOCALPDF_STUDIO_STORE__?: { getState: () => {
          documents: Array<{ id: string; pages: Array<{ id: string }> }>;
          setActiveDocument: (id: string | null) => void;
          setSelection: (selection: Array<{ docId: string; pageId: string }>) => void;
        } } }).__LOCALPDF_STUDIO_STORE__;
        if (!store) {
          return false;
        }
        const state = store.getState();
        const doc = state.documents[0];
        const firstPage = doc?.pages[0];
        if (!doc || !firstPage) {
          return false;
        }
        state.setActiveDocument(doc.id);
        state.setSelection([{ docId: doc.id, pageId: firstPage.id }]);
        return true;
      }, { timeout: 20000 });

      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(page.locator('.studio-edit-shell')).toBeVisible({ timeout: 20000 });

      const selectTextBtn = page.locator('.studio-editor-left-toolbar .studio-edit-tool-btn').first();
      await selectTextBtn.click();
      await expect(selectTextBtn).toHaveClass(/active/);

      const highlight = page.locator('.studio-edit-text-highlight').first();
      await expect(highlight).toBeVisible({ timeout: 15000 });
      await highlight.click({ force: true });

      const textarea = page.locator('.studio-edit-textarea').first();
      await expect(textarea).toBeVisible({ timeout: 10000 });

      const fontSize = await textarea.evaluate((el) => window.getComputedStyle(el).fontSize);
      expect(Number.parseFloat(fontSize)).toBeGreaterThan(10);

      await textarea.fill('INLINE UPDATED');
      await page.getByTestId('studio-edit-save-btn').click();
      await expect(page.getByTestId('studio-edit-save-btn')).toBeDisabled({ timeout: 15000 });

      await expect(page.locator('.studio-edit-text').first()).toContainText('INLINE UPDATED');
    } finally {
      safeDelete(pdfPath);
    }
  });

  test('shows no-text-layer warning for PDF without embedded text', async ({ page }) => {
    const pdfPath = await createNoTextPdf('blank');
    try {
      await page.goto('/app/studio');
      await page.locator('input[type="file"]').first().setInputFiles(pdfPath);

      await page.waitForFunction(() => {
        const store = (window as Window & { __LOCALPDF_STUDIO_STORE__?: { getState: () => {
          documents: Array<{ id: string; pages: Array<{ id: string }> }>;
          setActiveDocument: (id: string | null) => void;
          setSelection: (selection: Array<{ docId: string; pageId: string }>) => void;
        } } }).__LOCALPDF_STUDIO_STORE__;
        if (!store) {
          return false;
        }
        const state = store.getState();
        const doc = state.documents[0];
        const firstPage = doc?.pages[0];
        if (!doc || !firstPage) {
          return false;
        }
        state.setActiveDocument(doc.id);
        state.setSelection([{ docId: doc.id, pageId: firstPage.id }]);
        return true;
      }, { timeout: 20000 });

      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(page.locator('.studio-edit-shell')).toBeVisible({ timeout: 20000 });

      const selectTextBtn = page.locator('.studio-editor-left-toolbar .studio-edit-tool-btn').first();
      await selectTextBtn.click();
      await expect(selectTextBtn).toHaveClass(/active/);
      await expect(page.getByText(/no text layer/i)).toBeVisible({ timeout: 15000 });
    } finally {
      safeDelete(pdfPath);
    }
  });
});
