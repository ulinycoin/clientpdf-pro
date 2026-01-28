import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OCRWorkerManager } from './ocrWorkerManager';

// Mock Tesseract.js
vi.mock('tesseract.js', () => {
    const createWorker = vi.fn(async (lang) => {
        return {
            loadLanguage: vi.fn(),
            initialize: vi.fn(),
            reinitialize: vi.fn(),
            recognize: vi.fn(async () => ({
                data: {
                    text: 'Mocked OCR Text',
                    hocr: '<div class="ocrx_word" title="bbox 10 10 100 30; x_wconf 95">Mocked</div>',
                    confidence: 95
                }
            })),
            terminate: vi.fn()
        };
    });
    return { createWorker };
});

describe('OCRWorkerManager', () => {
    beforeEach(async () => {
        await OCRWorkerManager.cleanup();
    });

    it('should create a worker for a given language', async () => {
        const worker = await OCRWorkerManager.getWorker('eng');
        expect(worker).toBeDefined();
        const info = OCRWorkerManager.getWorkerInfo();
        expect(info.isInitialized).toBe(true);
        expect(info.currentLanguage).toBe('eng');
    });

    it('should reuse the same worker for the same language', async () => {
        const worker1 = await OCRWorkerManager.getWorker('eng');
        const worker2 = await OCRWorkerManager.getWorker('eng');
        expect(worker1).toBe(worker2);
    });

    it('should reinitialize for a different language', async () => {
        const worker1 = await OCRWorkerManager.getWorker('eng');
        await OCRWorkerManager.getWorker('rus');
        const info = OCRWorkerManager.getWorkerInfo();
        expect(info.currentLanguage).toBe('rus');
        expect(info.loadedLanguages).toContain('eng');
        expect(info.loadedLanguages).toContain('rus');
    });

    it('should cleanup workers correctly', async () => {
        await OCRWorkerManager.getWorker('eng');
        await OCRWorkerManager.cleanup();
        const info = OCRWorkerManager.getWorkerInfo();
        expect(info.isInitialized).toBe(false);
        expect(info.currentLanguage).toBe(null);
    });
});
