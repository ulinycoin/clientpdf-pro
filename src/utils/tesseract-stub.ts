// Simple stub for tesseract.js to prevent heavy loading in browser build
export const createWorker = () => {
  throw new Error('Tesseract.js disabled in browser build');
};

export const recognize = () => {
  throw new Error('Tesseract.js disabled in browser build');
};

export default { createWorker, recognize };