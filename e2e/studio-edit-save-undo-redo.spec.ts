import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createPdf(name: string): Promise<string> {
  const path = join(__dirname, `p1-save-undo-redo-${name}.pdf`);
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('UNDO REDO SAMPLE', { x: 80, y: 700, size: 24, font });
  writeFileSync(path, await doc.save());
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

test.describe('Studio save undo/redo P1', () => {
  test.setTimeout(120_000);

  test('reverts and reapplies saved output file id', async ({ page }) => {
    const pdfPath = await createPdf('single');
    try {
      await page.goto('/app/studio');
      await page.locator('input[type="file"]').first().setInputFiles(pdfPath);

      const initialFileIdHandle = await page.waitForFunction(() => {
        const store = (window as Window & { __LOCALPDF_STUDIO_STORE__?: { getState: () => {
          documents: Array<{ id: string; pages: Array<{ id: string; fileId: string }> }>;
          setActiveDocument: (id: string | null) => void;
          setSelection: (selection: Array<{ docId: string; pageId: string }>) => void;
        } } }).__LOCALPDF_STUDIO_STORE__;
        if (!store) {
          return null;
        }
        const state = store.getState();
        const doc = state.documents[0];
        const firstPage = doc?.pages[0];
        if (!doc || !firstPage) {
          return null;
        }
        state.setActiveDocument(doc.id);
        state.setSelection([{ docId: doc.id, pageId: firstPage.id }]);
        return firstPage.fileId;
      }, { timeout: 20000 });

      const initialFileId = await initialFileIdHandle.jsonValue() as string;

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
      await textarea.fill('SAVE UNDO REDO P1');
      await page.getByTestId('studio-edit-save-btn').click();

      const savedFileIdHandle = await page.waitForFunction((prevId) => {
        const store = (window as Window & { __LOCALPDF_STUDIO_STORE__?: { getState: () => {
          documents: Array<{ pages: Array<{ fileId: string }> }>;
        } } }).__LOCALPDF_STUDIO_STORE__;
        const next = store?.getState().documents[0]?.pages[0]?.fileId;
        if (!next || next === prevId) {
          return null;
        }
        return next;
      }, initialFileId, { timeout: 90000 });
      const savedFileId = await savedFileIdHandle.jsonValue() as string;

      await page.getByRole('button', { name: /Undo Save/i }).click();
      await page.waitForFunction((expected) => {
        const store = (window as Window & { __LOCALPDF_STUDIO_STORE__?: { getState: () => {
          documents: Array<{ pages: Array<{ fileId: string }> }>;
        } } }).__LOCALPDF_STUDIO_STORE__;
        return store?.getState().documents[0]?.pages[0]?.fileId === expected;
      }, initialFileId, { timeout: 90000 });

      await page.getByRole('button', { name: /Redo Save/i }).click();
      await page.waitForFunction((expected) => {
        const store = (window as Window & { __LOCALPDF_STUDIO_STORE__?: { getState: () => {
          documents: Array<{ pages: Array<{ fileId: string }> }>;
        } } }).__LOCALPDF_STUDIO_STORE__;
        return store?.getState().documents[0]?.pages[0]?.fileId === expected;
      }, savedFileId, { timeout: 90000 });
    } finally {
      safeDelete(pdfPath);
    }
  });
});
