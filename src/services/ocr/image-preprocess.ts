export type OcrPreprocessProfile = 'balanced' | 'aggressive';

async function decodeImage(blob: Blob): Promise<{ width: number; height: number; drawTo: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(blob);
    return {
      width: bitmap.width,
      height: bitmap.height,
      drawTo: (ctx, w, h) => {
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close();
      },
    };
  }

  if (typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = document.createElement('img');
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to decode image input'));
        img.src = url;
      });
      return {
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
        drawTo: (ctx, w, h) => {
          ctx.drawImage(image, 0, 0, w, h);
        },
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  throw new Error('Image decoding unavailable in this runtime');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeLuma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function computePercentileCutoffs(histogram: Uint32Array, total: number): { low: number; high: number } {
  if (total <= 0) {
    return { low: 0, high: 255 };
  }
  const lowTarget = total * 0.02;
  const highTarget = total * 0.98;

  let cumulative = 0;
  let low = 0;
  for (let i = 0; i < 256; i += 1) {
    cumulative += histogram[i];
    if (cumulative >= lowTarget) {
      low = i;
      break;
    }
  }

  cumulative = 0;
  let high = 255;
  for (let i = 0; i < 256; i += 1) {
    cumulative += histogram[i];
    if (cumulative >= highTarget) {
      high = i;
      break;
    }
  }

  return { low, high: Math.max(low + 1, high) };
}

function binarizeAdaptive(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  aggressiveness: number,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(gray.length);
  const pixelCount = width * height;
  if (pixelCount === 0) {
    return out;
  }

  const maxAdaptivePixels = 10_000_000;
  if (pixelCount > maxAdaptivePixels) {
    let mean = 0;
    for (let i = 0; i < gray.length; i += 1) {
      mean += gray[i];
    }
    mean /= gray.length;
    const threshold = clamp(mean - 6 - aggressiveness * 8, 32, 224);
    for (let i = 0; i < gray.length; i += 1) {
      out[i] = gray[i] < threshold ? 0 : 255;
    }
    return out;
  }

  const integral = new Float64Array((width + 1) * (height + 1));
  for (let y = 1; y <= height; y += 1) {
    let rowSum = 0;
    for (let x = 1; x <= width; x += 1) {
      rowSum += gray[(y - 1) * width + (x - 1)];
      integral[y * (width + 1) + x] = integral[(y - 1) * (width + 1) + x] + rowSum;
    }
  }

  const windowRadius = clamp(Math.round(Math.min(width, height) / 48), 8, 26);
  const bias = 0.1 + aggressiveness * 0.045;

  for (let y = 0; y < height; y += 1) {
    const y0 = Math.max(0, y - windowRadius);
    const y1 = Math.min(height - 1, y + windowRadius);
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.max(0, x - windowRadius);
      const x1 = Math.min(width - 1, x + windowRadius);
      const area = (x1 - x0 + 1) * (y1 - y0 + 1);

      const sum = integral[(y1 + 1) * (width + 1) + (x1 + 1)]
        - integral[y0 * (width + 1) + (x1 + 1)]
        - integral[(y1 + 1) * (width + 1) + x0]
        + integral[y0 * (width + 1) + x0];

      const localMean = sum / area;
      const threshold = localMean * (1 - bias);
      out[y * width + x] = gray[y * width + x] < threshold ? 0 : 255;
    }
  }

  return out;
}

function despeckleBinary(binary: Uint8ClampedArray, width: number, height: number): void {
  if (width < 3 || height < 3) {
    return;
  }
  const copy = new Uint8ClampedArray(binary);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = y * width + x;
      const value = copy[idx];
      let blackNeighbors = 0;
      for (let yy = -1; yy <= 1; yy += 1) {
        for (let xx = -1; xx <= 1; xx += 1) {
          if (xx === 0 && yy === 0) {
            continue;
          }
          if (copy[(y + yy) * width + (x + xx)] === 0) {
            blackNeighbors += 1;
          }
        }
      }

      if (value === 0 && blackNeighbors <= 1) {
        binary[idx] = 255;
      } else if (value === 255 && blackNeighbors >= 7) {
        binary[idx] = 0;
      }
    }
  }
}

export async function preprocessImageForOcr(
  blob: Blob,
  profile: OcrPreprocessProfile = 'balanced',
): Promise<Blob> {
  if (!blob.type.startsWith('image/')) {
    return blob;
  }
  if (typeof document === 'undefined') {
    return blob;
  }

  try {
    const decoded = await decodeImage(blob);
    const baseUpscale = decoded.width < 1600 ? 2 : 1;
    const upscale = profile === 'aggressive' ? Math.max(baseUpscale, decoded.width < 2100 ? 2 : 1) : baseUpscale;
    const targetWidth = Math.max(1, Math.round(decoded.width * upscale));
    const targetHeight = Math.max(1, Math.round(decoded.height * upscale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return blob;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = profile === 'aggressive' ? 'high' : 'medium';
    decoded.drawTo(ctx, targetWidth, targetHeight);

    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;
    const gray = new Uint8ClampedArray(targetWidth * targetHeight);
    const histogram = new Uint32Array(256);

    let avgLuma = 0;
    for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
      const luma = computeLuma(data[i], data[i + 1], data[i + 2]);
      avgLuma += luma;
      gray[p] = luma;
      histogram[Math.round(luma)] += 1;
    }
    avgLuma /= Math.max(1, gray.length);

    const isDarkUi = avgLuma < 120;
    if (isDarkUi) {
      for (let i = 0; i < gray.length; i += 1) {
        gray[i] = 255 - gray[i];
      }
    }

    // Auto-levels by percentile stretch to improve low-contrast scans.
    const cutoffs = computePercentileCutoffs(histogram, gray.length);
    const range = Math.max(1, cutoffs.high - cutoffs.low);
    for (let i = 0; i < gray.length; i += 1) {
      const stretched = ((gray[i] - cutoffs.low) * 255) / range;
      gray[i] = clamp(stretched, 0, 255);
    }

    const binary = binarizeAdaptive(gray, targetWidth, targetHeight, profile === 'aggressive' ? 1 : 0);
    if (profile === 'aggressive') {
      despeckleBinary(binary, targetWidth, targetHeight);
    }

    for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
      const v = binary[p];
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    const outBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    return outBlob ?? blob;
  } catch {
    return blob;
  }
}
