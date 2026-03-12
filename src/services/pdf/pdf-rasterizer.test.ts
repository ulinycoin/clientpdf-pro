import { test } from 'node:test';
import assert from 'node:assert';
import { createPdfRasterizer } from './pdf-rasterizer';

test('PdfJsRasterizer returns null in non-browser environment by default', async () => {
    const rasterizer = await createPdfRasterizer();
    // In node.js without document/OffscreenCanvas it should be null
    // unless we mock it or use a jsdom-like setup
    if (typeof OffscreenCanvas === 'undefined' && typeof document === 'undefined') {
        assert.strictEqual(rasterizer, null);
    }
});

// Note: Full testing of PDF rendering requires a browser or OffscreenCanvas polyfill.
// We will rely on integration/manual tests in the browser as mentioned in the plan.
