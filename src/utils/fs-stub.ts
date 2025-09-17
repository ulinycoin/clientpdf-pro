// Simple stub for fs module to prevent Node.js module errors in browser
export const readFile = () => {
  throw new Error('fs module not available in browser');
};

export const writeFile = () => {
  throw new Error('fs module not available in browser');
};

export const existsSync = () => false;
export const readFileSync = () => {
  throw new Error('fs module not available in browser');
};

export default { readFile, writeFile, existsSync, readFileSync };