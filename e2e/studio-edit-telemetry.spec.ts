import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createTextPdf(name: string): Promise<string> {
  const path = join(__dirname, `telemetry-edit-${name}.pdf`);
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('TELEMETRY SAMPLE', { x: 80, y: 700, size: 24, font });
  writeFileSync(path, await doc.save());
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

test.describe.skip('Studio telemetry P2', () => {
  test('emits STUDIO_EDIT_SAVE_ACTION after save', async ({ page }) => {
    const pdfPath = await createTextPdf('apply');
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
      await textarea.fill('TELEMETRY UPDATED');
      await page.getByTestId('studio-edit-save-btn').click();
      await expect(page.getByText(/Changes applied/i)).toBeVisible({ timeout: 15000 });

      const saveActions = await page.waitForFunction(() => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        const events = api?.getTelemetrySnapshot?.() ?? [];
        return events.filter((event: any) => event?.type === 'STUDIO_EDIT_SAVE_ACTION');
      }, { timeout: 15000 });

      const telemetryEvents = await saveActions.jsonValue() as Array<any>;
      const applyEvent = telemetryEvents.find((event) => event.action === 'apply');
      expect(applyEvent).toBeTruthy();
      expect(applyEvent.scope).toBe('single');
      expect(applyEvent.pagesTotal).toBe(1);
      expect(applyEvent.pagesSucceeded).toBe(1);
      expect(applyEvent.pagesFailed).toBe(0);
    } finally {
      safeDelete(pdfPath);
    }
  });
});
