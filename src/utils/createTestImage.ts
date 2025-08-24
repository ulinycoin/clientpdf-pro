// Utility to create test images for OCR testing
// This helps verify that our OCR implementation is working

export function createTestImageFile(text: string, language: 'eng' | 'rus' = 'eng'): File {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  // Set canvas size
  canvas.width = 800;
  canvas.height = 200;

  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Black text
  ctx.fillStyle = 'black';
  ctx.font = language === 'rus' ? '32px Arial, sans-serif' : '32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw the text
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  // Convert canvas to blob and then to File
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `test-${language}-${Date.now()}.png`, {
          type: 'image/png'
        });
        resolve(file);
      } else {
        throw new Error('Failed to create blob from canvas');
      }
    }, 'image/png');
  }) as any; // Type assertion to work around Promise return type
}

// Synchronous version that returns a data URL
export function createTestImageDataURL(text: string, language: 'eng' | 'rus' = 'eng'): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  // Set canvas size
  canvas.width = 800;
  canvas.height = 200;

  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Black text
  ctx.fillStyle = 'black';
  ctx.font = language === 'rus' ? '32px Arial, sans-serif' : '32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw the text
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/png');
}

// Test cases for different scenarios
export const OCR_TEST_CASES = {
  simpleEnglish: 'HELLO WORLD',
  simpleRussian: 'ПРИВЕТ МИР',
  englishDocument: 'This is a test document with multiple words.',
  russianDocument: 'Это тестовый документ с несколькими словами.',
  mixedCase: 'Hello World 123',
  numbers: '1234567890',
  specialChars: 'Test @#$% Special',
  multiline: 'Line One\nLine Two\nLine Three'
};

// Create a test file with error handling
export async function createTestFile(textKey: keyof typeof OCR_TEST_CASES, language: 'eng' | 'rus' = 'eng'): Promise<File> {
  try {
    const text = OCR_TEST_CASES[textKey];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }

    // Set canvas size based on text length
    const lines = text.split('\n');
    canvas.width = 800;
    canvas.height = Math.max(200, lines.length * 50 + 100);

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Black text
    ctx.fillStyle = 'black';
    ctx.font = language === 'rus' ? '28px Arial, sans-serif' : '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw multiple lines if needed
    const lineHeight = 40;
    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });

    // Convert to file
    return new Promise<File>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `ocr-test-${textKey}-${language}-${Date.now()}.png`, {
            type: 'image/png'
          });
          resolve(file);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png');
    });

  } catch (error) {
    console.error('Failed to create test file:', error);
    throw error;
  }
}