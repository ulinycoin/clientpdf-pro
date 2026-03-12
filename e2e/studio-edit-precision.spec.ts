import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createPrecisionTestPdf(): Promise<string> {
    const path = join(__dirname, 'precision-test.pdf');
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 400]);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    // Precise text at known coordinates
    page.drawText('PRECISION TEST LINE 1', { x: 50, y: 350, size: 20, font });

    const bytes = await doc.save();
    writeFileSync(path, bytes);
    return path;
}

function safeDelete(path: string): void {
    if (existsSync(path)) {
        unlinkSync(path);
    }
}

test.describe('Studio Edit Precision', () => {
    test('Selection box matches text layer span', async ({ page }) => {
        const pdfPath = await createPrecisionTestPdf();

        try {
            await page.goto('/app/studio');

            // Upload PDF to Studio
            await page.locator('input[type="file"]').first().setInputFiles([pdfPath]);

            await page.waitForFunction(() => {
                const store = (window as Window & {
                    __LOCALPDF_STUDIO_STORE__?: {
                        getState: () => {
                            documents: Array<{ id: string; pages: Array<{ id: string }> }>;
                            setActiveDocument: (id: string | null) => void;
                            setSelection: (selection: Array<{ docId: string; pageId: string }>) => void;
                        }
                    }
                }).__LOCALPDF_STUDIO_STORE__;
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

            await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
            await expect(page.locator('.studio-edit-shell')).toBeVisible({ timeout: 20000 });

            // Enable Select Text mode
            const selectTextBtn = page.locator('.studio-editor-left-toolbar .studio-edit-tool-btn').first();
            await selectTextBtn.click();
            await expect(selectTextBtn).toHaveClass(/active/);

            // Wait for PDF layer to be analyzed
            await page.waitForTimeout(3000);

            // Find highlight element
            const highlight = page.locator('.studio-edit-text-highlight').first();
            await expect(highlight).toBeVisible({ timeout: 15000 });

            // Get highlight bounds in client coordinates
            const box = await highlight.boundingBox();
            expect(box).not.toBeNull();

            // Click to edit
            await highlight.click({ force: true });

            // Expect a Textarea to appear
            const textarea = page.locator('.studio-edit-textarea');
            await expect(textarea).toBeVisible({ timeout: 10000 });

            // Get textarea bounds
            const editBox = await textarea.boundingBox();
            expect(editBox).not.toBeNull();

            if (box && editBox) {
                const diffX = Math.abs(editBox.x - box.x);
                const diffY = Math.abs(editBox.y - box.y);

                // Assertions with tolerance (V6 should be within 2-3px)
                expect(diffX).toBeLessThan(5);
                expect(diffY).toBeLessThan(5);
            }

        } finally {
            safeDelete(pdfPath);
        }
    });

    test('text does not compress in narrow columns', async ({ page }) => {
        const pdfPath = await createPrecisionTestPdf();

        try {
            await page.goto('/app/studio');
            await page.locator('input[type="file"]').first().setInputFiles([pdfPath]);

            await page.waitForFunction(() => {
                const store = (window as Window & {
                    __LOCALPDF_STUDIO_STORE__?: {
                        getState: () => {
                            documents: Array<{ id: string; pages: Array<{ id: string }> }>;
                            setActiveDocument: (id: string | null) => void;
                            setSelection: (selection: Array<{ docId: string; pageId: string }>) => void;
                        }
                    }
                }).__LOCALPDF_STUDIO_STORE__;
                if (!store) return false;
                const state = store.getState();
                const doc = state.documents[0];
                const firstPage = doc?.pages[0];
                if (!doc || !firstPage) return false;
                state.setActiveDocument(doc.id);
                state.setSelection([{ docId: doc.id, pageId: firstPage.id }]);
                return true;
            }, { timeout: 20000 });

            await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
            await expect(page.locator('.studio-edit-shell')).toBeVisible({ timeout: 20000 });

            const selectTextBtn = page.locator('.studio-editor-left-toolbar .studio-edit-tool-btn').first();
            await selectTextBtn.click();
            await page.waitForTimeout(3000);

            const highlight = page.locator('.studio-edit-text-highlight').first();
            await expect(highlight).toBeVisible({ timeout: 15000 });

            const originalBox = await highlight.boundingBox();
            expect(originalBox).not.toBeNull();

            await highlight.click({ force: true });

            const textarea = page.locator('.studio-editor-element.selected textarea');
            await expect(textarea).toBeVisible({ timeout: 10000 });

            const editBox = await textarea.boundingBox();
            expect(editBox).not.toBeNull();

            if (originalBox && editBox) {
                // Assert that the text area is at least 90% of the original bounding box 
                // to prevent aggressive text compression wrapping.
                expect(editBox.width).toBeGreaterThan(originalBox.width * 0.9);
            }
        } finally {
            safeDelete(pdfPath);
        }
    });
});
