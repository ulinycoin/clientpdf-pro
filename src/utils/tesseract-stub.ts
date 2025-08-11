// Stub for Tesseract.js to prevent loading issues in development
export default {
  recognize: () => Promise.resolve({ data: { text: '' } }),
  createWorker: () => ({
    loadLanguage: () => Promise.resolve(),
    initialize: () => Promise.resolve(),
    recognize: () => Promise.resolve({ data: { text: '' } }),
    terminate: () => Promise.resolve(),
  }),
};

export const createWorker = () => ({
  loadLanguage: () => Promise.resolve(),
  initialize: () => Promise.resolve(),
  recognize: () => Promise.resolve({ data: { text: '' } }),
  terminate: () => Promise.resolve(),
});

export const recognize = () => Promise.resolve({ data: { text: '' } });