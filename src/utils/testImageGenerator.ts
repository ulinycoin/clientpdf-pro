// Utility to create test images with Cyrillic text for OCR testing
export function createCyrillicTestImage(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 200;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Cannot get canvas context');
  }
  
  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Black text
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  // Add Russian text
  const russianText = 'Привет мир! Тест кириллицы.';
  ctx.fillText(russianText, 20, 20);
  
  // Add English text
  const englishText = 'Hello World! English test.';
  ctx.fillText(englishText, 20, 60);
  
  // Add mixed text
  const mixedText = 'Mixed: Смешанный текст English';
  ctx.fillText(mixedText, 20, 100);
  
  // Add some numbers and symbols
  const numbersText = 'Номера: 123456789 ₽$€';
  ctx.fillText(numbersText, 20, 140);
  
  console.log('🖼️ Test Image: Created Cyrillic test image with dimensions:', canvas.width, 'x', canvas.height);
  
  return canvas;
}

export function createEnglishTestImage(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 150;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Cannot get canvas context');
  }
  
  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Black text
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  // Add English text
  ctx.fillText('This is a test document.', 20, 20);
  ctx.fillText('OCR should recognize this text.', 20, 50);
  ctx.fillText('Numbers: 1234567890', 20, 80);
  ctx.fillText('Symbols: !@#$%^&*()', 20, 110);
  
  console.log('🖼️ Test Image: Created English test image');
  
  return canvas;
}

// Convert canvas to File for testing
export function canvasToFile(canvas: HTMLCanvasElement, filename: string = 'test-image.png'): Promise<File> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], filename, { type: 'image/png' });
        resolve(file);
      }
    }, 'image/png');
  });
}

// Make available globally for testing
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).createCyrillicTestImage = createCyrillicTestImage;
  (window as any).createEnglishTestImage = createEnglishTestImage;
  (window as any).canvasToFile = canvasToFile;
  console.log('🧪 Test Utils: Canvas test functions available globally');
  console.log('- window.createCyrillicTestImage()');
  console.log('- window.createEnglishTestImage()');
  console.log('- window.canvasToFile(canvas, filename)');
}