import type { OcrWord } from './ocr-engine';
import fontkit from '@pdf-lib/fontkit';

export interface SearchablePdfPageInput {
  imageBlob: Blob;
  words: OcrWord[];
}

async function imageSizeFromBlob(blob: Blob): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(blob);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  }

  if (typeof Image !== 'undefined' && typeof URL !== 'undefined') {
    const url = URL.createObjectURL(blob);
    try {
      const size = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error('Failed to decode OCR page image'));
        image.src = url;
      });
      return size;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  throw new Error('Image decoding is unavailable in this runtime');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

async function loadFontBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function resolveNotoFontUrls(): Promise<{ latinUrl: string; cyrillicUrl: string }> {
  const [latinMod, cyrillicMod] = await Promise.all([
    import('@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff?url') as Promise<{ default: string }>,
    import('@fontsource/noto-sans/files/noto-sans-cyrillic-ext-400-normal.woff?url') as Promise<{ default: string }>,
  ]);
  return { latinUrl: latinMod.default, cyrillicUrl: cyrillicMod.default };
}

function hasCyrillic(text: string): boolean {
  return /\p{Script=Cyrillic}/u.test(text);
}

export async function buildSearchablePdfFromImages(pages: SearchablePdfPageInput[]): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  let fallbackFont = await pdf.embedFont(StandardFonts.Helvetica);
  let latinFont: typeof fallbackFont = fallbackFont;
  let cyrillicFont: typeof fallbackFont = fallbackFont;

  try {
    // Tool logic runs inside a Worker in this app. Some runtimes cannot resolve
    // asset-url modules there and may throw document/createElement errors.
    // Keep Worker path stable with built-in font fallback.
    if (typeof document !== 'undefined') {
      pdf.registerFontkit(fontkit);
      const { latinUrl, cyrillicUrl } = await resolveNotoFontUrls();
      const [latinBytes, cyrillicBytes] = await Promise.all([
        loadFontBytes(latinUrl),
        loadFontBytes(cyrillicUrl),
      ]);
      latinFont = await pdf.embedFont(latinBytes, { subset: true });
      cyrillicFont = await pdf.embedFont(cyrillicBytes, { subset: true });
    }
  } catch {
    // Keep fallback Helvetica if fontkit/font files are unavailable.
  }

  for (const pageData of pages) {
    const bytes = new Uint8Array(await pageData.imageBlob.arrayBuffer());
    const mime = pageData.imageBlob.type;
    const isPng = mime === 'image/png';
    const isJpeg = mime === 'image/jpeg' || mime === 'image/jpg';
    if (!isPng && !isJpeg) {
      throw new Error(`Searchable PDF supports PNG/JPEG image pages, received: ${mime || 'unknown'}`);
    }
    const image = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const imageSize = await imageSizeFromBlob(pageData.imageBlob);
    const page = pdf.addPage([imageSize.width, imageSize.height]);
    page.drawImage(image, { x: 0, y: 0, width: imageSize.width, height: imageSize.height });

    for (const word of pageData.words) {
      const w = clamp(word.bbox.x1 - word.bbox.x0, 1, imageSize.width);
      const h = clamp(word.bbox.y1 - word.bbox.y0, 1, imageSize.height);
      const x = clamp(word.bbox.x0, 0, imageSize.width - 1);
      const y = clamp(imageSize.height - word.bbox.y1, 0, imageSize.height - 1);
      const fontSize = clamp(h * 0.85, 6, 48);

      try {
        const selectedFont = hasCyrillic(word.text) ? cyrillicFont : latinFont;
        page.drawText(word.text, {
          x,
          y,
          size: fontSize,
          font: selectedFont,
          maxWidth: w,
          color: rgb(1, 1, 1),
          opacity: 0.02,
        });
      } catch {
        // Skip unsupported glyph sequences in standard fonts.
      }
    }
  }

  const output = await pdf.save();
  const normalized = new Uint8Array(output.byteLength);
  normalized.set(output);
  return new Blob([normalized], { type: 'application/pdf' });
}
