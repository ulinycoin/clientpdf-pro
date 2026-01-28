import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MergeService } from './MergeService';

describe('MergeService', () => {
    let mergeService: MergeService;

    beforeEach(() => {
        mergeService = new MergeService();
    });

    it('should throw an error if less than 2 files are provided', async () => {
        const files = [new File([''], 'test1.pdf', { type: 'application/pdf' })];
        const result = await mergeService.mergePDFs(files);

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('At least 2 files are required for merging');
    });

    it('should attempt to process files in specified order', async () => {
        const file1 = new File(['%PDF-1.4'], 'test1.pdf', { type: 'application/pdf' });
        const file2 = new File(['%PDF-2.0'], 'test2.pdf', { type: 'application/pdf' });
        const files = [file1, file2];

        const log: string[] = [];
        const onProgress = (p: number, msg: string) => {
            log.push(msg);
        };

        // We expect it might fail or succeed depending on how tolerant pdf-lib is,
        // but we mainly care about the order of progress messages.
        await mergeService.mergePDFs(files, onProgress, { order: [1, 0] });

        const processingMessages = log.filter(m => m.startsWith('Processing'));
        expect(processingMessages[0]).toContain('test2.pdf');
        expect(processingMessages[1]).toContain('test1.pdf');
    });

    it('should report progress correctly', async () => {
        const file1 = new File(['%PDF-1.4'], 'test1.pdf', { type: 'application/pdf' });
        const file2 = new File(['%PDF-1.4'], 'test2.pdf', { type: 'application/pdf' });
        const files = [file1, file2];

        const progressValues: number[] = [];
        const onProgress = (p: number) => {
            progressValues.push(p);
        };

        await mergeService.mergePDFs(files, onProgress);

        expect(progressValues).toContain(0);
        expect(progressValues.some(p => p > 0 && p < 100)).toBe(true);
    });
});
