/**
 * Dynamic Tesseract.js UMD Loader
 * Loads Tesseract.js as global UMD script to avoid ESM import issues
 */

declare global {
  interface Window {
    Tesseract: any;
  }
}

let tesseractPromise: Promise<any> | null = null;
let isLoaded = false;

/**
 * Dynamically load Tesseract.js UMD version
 */
export async function loadTesseract(): Promise<any> {
  // Return cached version if already loaded
  if (isLoaded && window.Tesseract) {
    return window.Tesseract;
  }
  
  // Return existing promise if loading
  if (tesseractPromise) {
    return tesseractPromise;
  }
  
  console.log('🔄 Loading Tesseract.js UMD version...');
  
  tesseractPromise = new Promise((resolve, reject) => {
    // Check if already loaded by another component
    if (window.Tesseract) {
      isLoaded = true;
      resolve(window.Tesseract);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    script.async = true;
    
    script.onload = () => {
      if (window.Tesseract) {
        isLoaded = true;
        console.log('✅ Tesseract.js UMD loaded successfully');
        resolve(window.Tesseract);
      } else {
        reject(new Error('Tesseract.js loaded but not found in window'));
      }
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Tesseract.js:', error);
      reject(new Error('Failed to load Tesseract.js script'));
    };
    
    document.head.appendChild(script);
  });
  
  return tesseractPromise;
}

/**
 * Create Tesseract worker with UMD version
 */
export async function createTesseractWorker(language: string = 'eng'): Promise<any> {
  const Tesseract = await loadTesseract();
  
  if (!Tesseract || !Tesseract.createWorker) {
    throw new Error('Tesseract.createWorker not available');
  }
  
  console.log(`🔧 Creating Tesseract worker for language: ${language}`);
  return await Tesseract.createWorker(language);
}

/**
 * Check if Tesseract is available
 */
export function isTesseractLoaded(): boolean {
  return isLoaded && !!window.Tesseract;
}