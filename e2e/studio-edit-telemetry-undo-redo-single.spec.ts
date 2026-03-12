import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createPdf(name: string): Promise<string> {
  const path = join(__dirname, `telemetry-undo-redo-single-${name}.pdf`);
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('TELEMETRY UNDO REDO SINGLE', { x: 80, y: 700, size: 24, font });
  writeFileSync(path, await doc.save());
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

test.describe.skip('Studio telemetry undo/redo single P2', () => {
  test('emits apply/undo/redo save actions for single scope', async ({ page }) => {
    const pdfPath = await createPdf('single');
    try {
      await page.goto('/app/studio');
      await page.evaluate(() => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        api?.clearTelemetry?.();
      });
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
        const first = doc?.pages[0];
        if (!doc || !first) {
          return false;
        }
        state.setActiveDocument(doc.id);
        state.setSelection([{ docId: doc.id, pageId: first.id }]);
        return true;
      }, { timeout: 20000 });

      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(page.locator('.studio-edit-shell')).toBeVisible({ timeout: 20000 });

      const sheet = page.locator('.studio-edit-canvas-content').first();
      await expect(sheet).toBeVisible({ timeout: 15000 });
      const bounds = await sheet.boundingBox();
      if (!bounds) {
        throw new Error('Missing edit sheet bounds');
      }
      await sheet.click({
        position: {
          x: Math.max(12, Math.floor(bounds.width * 0.15)),
          y: Math.max(12, Math.floor(bounds.height * 0.12)),
        },
      });

      const textarea = page.locator('.studio-edit-textarea').first();
      await expect(textarea).toBeVisible({ timeout: 10000 });
      await textarea.fill('TELEMETRY UNDO REDO SINGLE UPDATED');
      await page.getByTestId('studio-edit-save-btn').click();

      await expect(page.getByText(/Changes applied/i)).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: /Undo Save/i }).click();
      await page.getByRole('button', { name: /Redo Save/i }).click();

      const actionsHandle = await page.waitForFunction(() => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        const events = api?.getTelemetrySnapshot?.() ?? [];
        const actions = events.filter((event: any) => event?.type === 'STUDIO_EDIT_SAVE_ACTION' && event.scope === 'single');
        if (actions.length < 3) {
          return null;
        }
        return actions;
      }, { timeout: 15000 });

      const actions = await actionsHandle.jsonValue() as Array<any>;
      const hasApply = actions.some((event) => (
        event.action === 'apply'
        && event.pagesTotal === 1
        && event.pagesSucceeded === 1
        && event.pagesFailed === 0
        && typeof event.overflowCount === 'number'
      ));
      const hasUndo = actions.some((event) => (
        event.action === 'undo'
        && event.pagesTotal === 1
        && event.pagesSucceeded === 1
        && event.pagesFailed === 0
      ));
      const hasRedo = actions.some((event) => (
        event.action === 'redo'
        && event.pagesTotal === 1
        && event.pagesSucceeded === 1
        && event.pagesFailed === 0
      ));

      expect(hasApply).toBe(true);
      expect(hasUndo).toBe(true);
      expect(hasRedo).toBe(true);
    } finally {
      safeDelete(pdfPath);
    }
  });
});
