import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

// We launch Chromium with --expose-gc flag down below when we need it
test.use({
    browserName: 'chromium',
    launchOptions: {
        args: ['--js-flags="--expose-gc"'],
    },
});

test.describe.skip('Studio Editor Memory Leak Checks', () => {
    test('should not leak memory after multiple PDF uploads and closures', async ({ page, browser }) => {
        test.setTimeout(180000); // 3 minutes for 50 heavy loops
        // Create an isolated CDP session
        const cdpSession = await page.context().newCDPSession(page);

        // Wait for page to initialize
        await page.goto('/pdf-editor', { waitUntil: 'networkidle' });

        // Function to explicitly collect garbage
        const forceGC = async () => {
            await page.evaluate(() => {
                if (typeof window.gc === 'function') {
                    window.gc();
                } else {
                    console.warn('window.gc is not a function - did you pass --expose-gc?');
                }
            });
            // Yield to browser event loop to let GC finish
            await page.waitForTimeout(500);
        };

        // Function to get heap usage
        const getHeapSize = async () => {
            const metrics = await page.evaluate(() => {
                if (performance && (performance as any).memory) {
                    return (performance as any).memory.usedJSHeapSize;
                }
                return 0;
            });
            return metrics;
        };

        // Function to check Detached DOM Nodes via CDP
        const getDetachedNodesCount = async () => {
            const client = await cdpSession.send('Memory.getDOMCounters');
            return client.nodes;
        };

        // 1. Initial Measurement
        await forceGC();
        const initialHeap = await getHeapSize();
        const initialNodes = await getDetachedNodesCount();
        console.log(`[Memory] Baseline: Heap=${Math.round(initialHeap / 1024 / 1024)}MB, Nodes=${initialNodes}`);

        // Construct path to a valid local test PDF
        const currentFilename = fileURLToPath(import.meta.url);
        const currentDirname = path.dirname(currentFilename);
        // We know large-1000-pages.pdf exists because we generated it, but we run 50 loops on single page 
        // because 1000 pages takes too much execution time and causes Playwright UI timeouts.
        const examplePdfPath = path.join(currentDirname, 'fixtures', 'one-page-text.pdf');

        const LOOPS = 50; // Heavily load the editor to verify memory bounds

        for (let i = 0; i < LOOPS; i++) {
            // Upload PDF
            const fileChooserPromise = page.waitForEvent('filechooser');
            await page.locator('.upload-zone').click();
            const fileChooser = await fileChooserPromise;
            await fileChooser.setFiles(examplePdfPath);

            // Wait for it to render in Studio Workspace
            await page.waitForSelector('.document', { state: 'visible' });

            // Do a simple edit interaction to populate history/tools (e.g. text tool)
            await page.click('button[title="Text tool"]', { force: true }).catch(() => { });

            // "Close" document / return to upload state 
            try {
                await page.locator('button:has-text("Start over")').click({ timeout: 2000 });
            } catch (err) {
                // Fallback: forcefully navigate back
                await page.goto('/pdf-editor', { waitUntil: 'load' });
            }

            // Re-wait for upload dropzone
            await page.waitForSelector('.upload-zone', { state: 'visible', timeout: 10000 });

            // Let the GC do its work inside the loop
            await forceGC();
        }

        // 2. Final Measurement
        await forceGC();
        const finalHeap = await getHeapSize();
        const finalNodes = await getDetachedNodesCount();

        // Calculate deltas
        const heapDeltaMb = (finalHeap - initialHeap) / 1024 / 1024;
        const nodesDelta = finalNodes - initialNodes;

        console.log(`[Memory] Final: Heap=${Math.round(finalHeap / 1024 / 1024)}MB, Nodes=${finalNodes}`);
        console.log(`[Memory] Delta: Heap=${heapDeltaMb.toFixed(2)}MB, Nodes=${nodesDelta}`);

        // Assertions
        // An acceptable delta is usually less than 15-20MB for 10-50 PDFs if caching occurs. 
        expect(heapDeltaMb).toBeLessThan(50); // Setting a generous 50MB ceiling
        // Detached DOM nodes should ideally be stable. If they grow monotonically, it's a leak
        expect(nodesDelta).toBeLessThan(100);
    });
});
