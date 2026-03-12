import { test, expect } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

test.describe('Studio Edit Text', () => {
  test('text does not reset after input and drag', async ({ page }) => {
    const pdfPath = await createDummyPdf('studio-edit-text');
    try {
      await page.goto('/app/studio');

      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(pdfPath);

      await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20000 });
      await expect(page.getByRole('button', { name: 'Download' })).toBeEnabled({ timeout: 30000 });

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

      const editButton = page.getByRole('button', { name: 'Edit', exact: true });
      await expect(editButton).toBeEnabled({ timeout: 10000 });
      await editButton.click();

      await expect(page).toHaveURL(/\/studio\/edit$/);
      await expect(page.locator('.studio-edit-shell')).toBeVisible({ timeout: 20000 });

      const textToolBtn = page.locator('.studio-editor-left-toolbar .studio-edit-tool-btn').first();
      await textToolBtn.click();
      await expect(textToolBtn).toHaveClass(/active/);

      const sheet = page.locator('.studio-edit-canvas-content').first();
      await expect(sheet).toBeVisible({ timeout: 20000 });

      const box = await sheet.boundingBox();
      if (!box) {
        throw new Error('Missing edit page sheet bounds');
      }

      await sheet.click({
        position: {
          x: Math.max(8, Math.floor(box.width * 0.35)),
          y: Math.max(8, Math.floor(box.height * 0.45)),
        },
      });

      const createdTextNode = page.locator('.studio-edit-text').first();
      await expect(createdTextNode).toContainText('Text', { timeout: 5000 });
      await createdTextNode.click();

      const textarea = page.locator('.studio-edit-textarea').first();
      await expect(textarea).toBeVisible({ timeout: 5000 });
      await textarea.fill('Drag me text');

      const textNode = page.locator('.studio-edit-text').first();
      await expect(textNode).toContainText('Drag me text');

      const nodeBox = await textNode.boundingBox();
      if (!nodeBox) {
        throw new Error('Missing text node bounds');
      }

      await page.mouse.move(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(nodeBox.x + nodeBox.width / 2 + 80, nodeBox.y + nodeBox.height / 2 + 40);
      await page.mouse.up();

      await expect(page.locator('.studio-edit-text').first()).toContainText('Drag me text');
      await expect(page.locator('.studio-edit-text').first()).not.toContainText(/^Text$/);
    } finally {
      safeDelete(pdfPath);
    }
  });
});
