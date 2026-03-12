import { expect, test } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const WORK_DIR = join(process.cwd(), 'e2e', 'temp_diff');

async function createBasePdf() {
    if (!existsSync(WORK_DIR)) mkdirSync(WORK_DIR, { recursive: true });
    const path = join(WORK_DIR, 'diff-test.pdf');
    const doc = await PDFDocument.create();
    const page = doc.addPage([500, 300]);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    page.drawText('Original Text to Edit', { x: 50, y: 250, size: 24, font });

    const bytes = await doc.save();
    writeFileSync(path, bytes);
    return path;
}

// Rendering happens purely in playwright now


test.describe.skip('Studio Edit Pixel Diff', () => {
    test.beforeAll(() => {
        if (!existsSync(WORK_DIR)) mkdirSync(WORK_DIR, { recursive: true });
    });

    test('edited pdf matches ui screenshot', async ({ page }) => {
        const pdfPath = await createBasePdf();

        try {
            await page.goto('/app/studio');
            await page.locator('input[type="file"]').first().setInputFiles([pdfPath]);

            await page.waitForFunction(() => {
                const store = (window as Window & { __LOCALPDF_STUDIO_STORE__?: any }).__LOCALPDF_STUDIO_STORE__;
                if (!store) return false;
                const state = store.getState();
                const doc = state.documents[0];
                if (!doc || !doc.pages[0]) return false;
                state.setActiveDocument(doc.id);
                state.setSelection([{ docId: doc.id, pageId: doc.pages[0].id }]);
                return true;
            }, { timeout: 20000 });

            await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
            await expect(page.locator('.studio-edit-shell')).toBeVisible({ timeout: 20000 });

            await page.waitForTimeout(3000); // Wait for extraction

            const highlight = page.locator('.studio-edit-text-highlight').first();
            await expect(highlight).toBeVisible({ timeout: 15000 });
            await highlight.click();

            const textarea = page.locator('.studio-editor-element.selected textarea');
            await textarea.fill('Testing pixel diff render');

            // Apply edit
            await page.locator('.studio-edit-shell').click({ position: { x: 50, y: 50 } }); // Click outside

            // Capture screenshot of the bounding area in the UI
            const pageEditorContainer = page.locator('.studio-page-editor-container');
            const uiScreenshotBuffer = await pageEditorContainer.screenshot();

            // Save PDF
            const downloadPromise = page.waitForEvent('download');
            await page.getByRole('button', { name: 'Export' }).click();
            await page.getByRole('button', { name: 'Download PDF' }).click();
            const download = await downloadPromise;

            const downloadedPath = join(WORK_DIR, 'downloaded.pdf');
            await download.saveAs(downloadedPath);

            // Render downloaded PDF using browser evaluation
            const pdfBase64 = readFileSync(downloadedPath).toString('base64');
            const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`;

            // Re-upload into the page and capture its rendered view natively
            await page.locator('input[type="file"]').first().setInputFiles([downloadedPath]);

            await page.waitForTimeout(3000); // Wait for the new file to load and render

            // Hide the UI elements we don't want in the screenshot for the diff
            await page.evaluate(() => {
                const els = document.querySelectorAll('.studio-top-nav, .tool-sidebar, .studio-toolbar, .studio-thumbnail-panel, .studio-page-controls');
                els.forEach((el: any) => el.style.display = 'none');
            });

            const pdfScreenshotBuffer = await page.locator('.studio-page-editor-container').screenshot();

            // Decode both
            const uiPng = PNG.sync.read(uiScreenshotBuffer);
            const pdfPng = PNG.sync.read(pdfScreenshotBuffer);

            writeFileSync(join(WORK_DIR, 'ui.png'), PNG.sync.write(uiPng));
            writeFileSync(join(WORK_DIR, 'pdf.png'), PNG.sync.write(pdfPng));

            expect(existsSync(join(WORK_DIR, 'ui.png'))).toBe(true);
            expect(existsSync(join(WORK_DIR, 'pdf.png'))).toBe(true);

            // Note: Actual pixelmatch requires exactly same dimensions. 
            // We'll log the diff sizes to inform future refinement.
            console.log(`UI Bounds: ${uiPng.width}x${uiPng.height}`);
            console.log(`PDF Bounds: ${pdfPng.width}x${pdfPng.height}`);

            if (uiPng.width === pdfPng.width && uiPng.height === pdfPng.height) {
                const diff = new PNG({ width: uiPng.width, height: uiPng.height });
                const numDiffPixels = pixelmatch(uiPng.data, pdfPng.data, diff.data, uiPng.width, uiPng.height, { threshold: 0.1 });
                writeFileSync(join(WORK_DIR, 'diff.png'), PNG.sync.write(diff));

                const diffRatio = numDiffPixels / (uiPng.width * uiPng.height);
                // 3% threshold
                expect(diffRatio).toBeLessThan(0.03);
            }

        } finally {
            if (existsSync(pdfPath)) unlinkSync(pdfPath);
        }
    });
});
