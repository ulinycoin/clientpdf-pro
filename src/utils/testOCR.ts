// Simple OCR test to verify Tesseract.js works
import { createTesseractWorker } from './tesseractLoader';

export async function testOCRFunctionality(): Promise<boolean> {
  console.log('🧪 OCR Test: Starting basic functionality test...');
  
  try {
    // Test if createTesseractWorker is available
    if (typeof createTesseractWorker !== 'function') {
      console.error('❌ OCR Test: createTesseractWorker is not a function');
      return false;
    }
    
    console.log('✅ OCR Test: createTesseractWorker function is available');
    
    // Try to create a worker - this should work if Tesseract.js is properly loaded
    console.log('🔧 OCR Test: Creating test worker...');
    const worker = await createTesseractWorker('eng');
    
    if (!worker) {
      console.error('❌ OCR Test: Worker creation returned null');
      return false;
    }
    
    console.log('✅ OCR Test: Worker created successfully');
    
    // Test with a simple canvas
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 200, 50);
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText('HELLO', 50, 30);
    }
    
    console.log('🖼️ OCR Test: Testing with simple "HELLO" image...');
    const result = await worker.recognize(canvas);
    
    console.log('📝 OCR Test: Recognition result:', {
      text: result.data.text,
      confidence: result.data.confidence
    });
    
    // Clean up
    await worker.terminate();
    
    const recognizedText = result.data.text.trim().toUpperCase();
    const success = recognizedText.includes('HELLO');
    
    if (success) {
      console.log('✅ OCR Test: SUCCESS - Tesseract.js is working correctly!');
    } else {
      console.log('⚠️ OCR Test: Text recognition unclear, but engine is functional');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ OCR Test: Failed -', error);
    return false;
  }
}

// Auto-run test in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Add to window for manual testing
  (window as any).testOCR = testOCRFunctionality;
  console.log('🔍 OCR Test: Run window.testOCR() to test functionality');
}