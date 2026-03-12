import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { extractEmbeddedPdfText } from '../src/services/pdf/pdf-text-extractor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createTextPdf(name: string): Promise<string> {
  const path = join(__dirname, `p0-text-save-${name}.pdf`);
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('INLINE EDIT SAMPLE', { x: 80, y: 700, size: 24, font });
  const bytes = await doc.save();
  writeFileSync(path, bytes);
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

test.describe('Studio edit text save P0', () => {
  test('saves edited text into output PDF in VFS', async ({ page }) => {
    const pdfPath = await createTextPdf('p0');
    try {
      await page.goto('/app/studio');
      await page.locator('input[type="file"]').first().setInputFiles(pdfPath);

      const initialFileId = await page.waitForFunction(() => {
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

      const beforeFileId = await initialFileId.jsonValue() as string;
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
      await textarea.fill('INLINE UPDATED P0');
      await page.getByTestId('studio-edit-save-btn').click();

      const afterFileId = await page.waitForFunction((prevId) => {
        const store = (window as Window & { __LOCALPDF_STUDIO_STORE__?: { getState: () => {
          documents: Array<{ pages: Array<{ fileId: string }> }>;
        } } }).__LOCALPDF_STUDIO_STORE__;
        const current = store?.getState().documents[0]?.pages[0]?.fileId;
        if (!current || current === prevId) {
          return null;
        }
        return current;
      }, beforeFileId, { timeout: 20000 });

      const updatedFileId = await afterFileId.jsonValue() as string;
      const base64Pdf = await page.evaluate(async (fileId) => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        if (!api?.readFileBase64) {
          return '';
        }
        return api.readFileBase64(fileId);
      }, updatedFileId);

      const bytes = Uint8Array.from(Buffer.from(base64Pdf, 'base64'));
      const extracted = await extractEmbeddedPdfText(new Blob([bytes], { type: 'application/pdf' }));
      const normalized = (extracted?.text ?? '').replace(/\s+/g, '').toUpperCase();
      expect(normalized).toContain('INLINEUPDATEDP0');
    } finally {
      safeDelete(pdfPath);
    }
  });
});
