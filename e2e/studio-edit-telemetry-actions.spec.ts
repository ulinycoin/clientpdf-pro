import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createTwoPagePdf(name: string): Promise<string> {
  const path = join(__dirname, `telemetry-actions-${name}.pdf`);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const p1 = doc.addPage([612, 792]);
  p1.drawText('TELEMETRY ACTIONS PAGE 1', { x: 80, y: 700, size: 24, font });
  const p2 = doc.addPage([612, 792]);
  p2.drawText('TELEMETRY ACTIONS PAGE 2', { x: 80, y: 700, size: 24, font });
  writeFileSync(path, await doc.save());
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

test.describe.skip('Studio telemetry save actions P2', () => {
  test.setTimeout(120_000);

  test('emits apply/undo/redo save actions for selection scope', async ({ page }) => {
    const pdfPath = await createTwoPagePdf('selection');
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
        const second = doc?.pages[1];
        if (!doc || !first || !second) {
          return false;
        }
        state.setActiveDocument(doc.id);
        state.setSelection([
          { docId: doc.id, pageId: first.id },
          { docId: doc.id, pageId: second.id },
        ]);
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
      await textarea.fill('TELEMETRY ACTIONS UPDATED');
      await page.getByTestId('studio-edit-save-btn').click();

      await page.waitForFunction(() => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        const events = api?.getTelemetrySnapshot?.() ?? [];
        return events.some((event: any) => event?.type === 'STUDIO_EDIT_SAVE_ACTION' && event.scope === 'selection' && event.action === 'apply');
      }, { timeout: 90000 });
      await page.getByRole('button', { name: /Undo Save/i }).click();
      await page.getByRole('button', { name: /Redo Save/i }).click();

      const actionsHandle = await page.waitForFunction(() => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        const events = api?.getTelemetrySnapshot?.() ?? [];
        const saveActions = events.filter((event: any) => event?.type === 'STUDIO_EDIT_SAVE_ACTION' && event.scope === 'selection');
        if (saveActions.length < 3) {
          return null;
        }
        return saveActions;
      }, { timeout: 90000 });

      const actions = await actionsHandle.jsonValue() as Array<any>;
      const hasApply = actions.some((event) => event.action === 'apply' && event.pagesTotal >= 2);
      const hasUndo = actions.some((event) => event.action === 'undo' && event.pagesTotal >= 2);
      const hasRedo = actions.some((event) => event.action === 'redo' && event.pagesTotal >= 2);

      expect(hasApply).toBe(true);
      expect(hasUndo).toBe(true);
      expect(hasRedo).toBe(true);
    } finally {
      safeDelete(pdfPath);
    }
  });
});
