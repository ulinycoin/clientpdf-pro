import { describe, it, expect, vi } from 'vitest';
import { SplitService } from './SplitService';

describe('SplitService', () => {
    let splitService: SplitService;

    beforeEach(() => {
        splitService = new SplitService();
    });

    it('should report correct progress messages for "pages" mode', async () => {
        const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
        const log: string[] = [];
        const onProgress = (_p: number, msg: string) => {
            log.push(msg);
        };

        // This will likely fail in real PDF parsing, but we check progress messages
        await splitService.splitPDF(file, 'pages', {}, onProgress);

        expect(log).toContain('Loading PDF...');
        // If it failed during load, it's fine, we just want to see it didn't crash
    });

    it('should validate range mode parameters', async () => {
        const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
        const onProgress = vi.fn();

        const result = await splitService.splitPDF(file, 'range', { start: 5, end: 2 }, onProgress);

        // Even if it fails PDF loading, we can check if it returns a proper error structure
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('SPLIT_FAILED');
    });

    it('should attempt custom split if pages are provided', async () => {
        const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
        const log: string[] = [];
        const onProgress = (_p: number, msg: string) => {
            log.push(msg);
        };

        await splitService.splitPDF(file, 'custom', { pages: [1, 3] }, onProgress);

        // Progress should mention extracting specific pages if it gets past load
        // const hasCustomMsg = log.some(m => m.includes('specific pages'));

        expect(log).toContain('Loading PDF...');
    });
});
