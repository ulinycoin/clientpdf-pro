import '@testing-library/jest-dom';
import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMock.enableMocks();

// Mock performance.now() if needed
if (typeof performance === 'undefined') {
    (global as any).performance = {
        now: () => Date.now(),
    };
}

// Mock URL.createObjectURL and URL.revokeObjectURL
if (typeof URL.createObjectURL === 'undefined') {
    URL.createObjectURL = vi.fn();
}
if (typeof URL.revokeObjectURL === 'undefined') {
    URL.revokeObjectURL = vi.fn();
}

// Polyfill Blob.arrayBuffer for older jsdom/node environments if needed
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function () {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.readAsArrayBuffer(this);
        });
    };
}
