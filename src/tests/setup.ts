import '@testing-library/jest-dom';

// Mock PDF.js worker
global.URL = global.URL || {
  createObjectURL: () => 'mock-object-url',
  revokeObjectURL: () => {},
} as any;

// Mock FileReader
global.FileReader = global.FileReader || class {
  readAsArrayBuffer() {}
  readAsDataURL() {}
} as any;

// Mock Canvas API
global.HTMLCanvasElement = global.HTMLCanvasElement || class {
  getContext() {
    return {
      fillRect: () => {},
      drawImage: () => {},
      getImageData: () => ({ data: new Uint8ClampedArray() }),
      putImageData: () => {},
    };
  }
} as any;