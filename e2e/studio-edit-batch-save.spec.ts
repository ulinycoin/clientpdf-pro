import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createTwoPagePdf(name: string): Promise<string> {
  const path = join(__dirname, `p1-batch-save-${name}.pdf`);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const p1 = doc.addPage([612, 792]);
  p1.drawText('BATCH PAGE ONE', { x: 80, y: 700, size: 24, font });
  const p2 = doc.addPage([612, 792]);
  p2.drawText('BATCH PAGE TWO', { x: 80, y: 700, size: 24, font });
  writeFileSync(path, await doc.save());
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

test.describe('Studio edit batch save P1', () => {
  test.setTimeout(120_000);

  test('applies save to all selected pages', async ({ page }) => {
    const pdfPath = await createTwoPagePdf('batch');
    try {
      await page.goto('/app/studio');
      await page.locator('input[type="file"]').first().setInputFiles(pdfPath);

      const initialIds = await page.waitForFunction(() => {
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
        const first = doc?.pages[0];
        const second = doc?.pages[1];
        if (!doc || !first || !second) {
          return null;
        }
        state.setActiveDocument(doc.id);
        state.setSelection([
          { docId: doc.id, pageId: first.id },
          { docId: doc.id, pageId: second.id },
        ]);
        return [first.fileId, second.fileId];
      }, { timeout: 20000 });

      const [beforeFirst, beforeSecond] = await initialIds.jsonValue() as [string, string];

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
      await textarea.fill('BATCH UPDATE P1');
      await page.getByTestId('studio-edit-save-btn').click();

      const changed = await page.waitForFunction((firstId, secondId) => {
        const store = (window as Window & { __LOCALPDF_STUDIO_STORE__?: { getState: () => {
          documents: Array<{ pages: Array<{ fileId: string }> }>;
        } } }).__LOCALPDF_STUDIO_STORE__;
        const pages = store?.getState().documents[0]?.pages;
        if (!pages?.[0]?.fileId || !pages?.[1]?.fileId) {
          return null;
        }
        if (pages[0].fileId === firstId || pages[1].fileId === secondId) {
          return null;
        }
        return true;
      }, beforeFirst, beforeSecond, { timeout: 90000 });

      expect(await changed.jsonValue()).toBe(true);
    } finally {
      safeDelete(pdfPath);
    }
  });
});
