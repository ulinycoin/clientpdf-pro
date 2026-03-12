import { OcrPipelineError } from './ocr-errors';
import { detectDocumentLanguage, type LanguageDetectionResult } from './language-detector';

export interface OcrResult {
  text: string;
  confidence: number | null;
  requestedLanguage: string;
  usedLanguage: string;
  languageFallbackUsed: boolean;
  detectedLanguage?: LanguageDetectionResult;
  words: OcrWord[];
}

export interface OcrRecognizeOptions {
  language?: string;
  detectLanguage?: boolean;
}

export interface OcrWord {
  text: string;
  confidence: number | null;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface OcrEngine {
  recognize(blob: Blob, options?: OcrRecognizeOptions): Promise<OcrResult>;
}

class FallbackOcrEngine implements OcrEngine {
  async recognize(): Promise<OcrResult> {
    throw new OcrPipelineError('OCR_ENGINE_UNAVAILABLE', 'OCR engine is unavailable');
  }
}

interface TesseractResult {
  data?: {
    text?: string;
    confidence?: number;
    words?: TesseractWord[];
  };
}

interface TesseractWord {
  text?: string;
  confidence?: number;
  bbox?: { x0?: number; y0?: number; x1?: number; y1?: number };
}

interface TesseractModule {
  recognize(input: Blob, language: string): Promise<TesseractResult>;
}

function isLanguagePackError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /language|traineddata|load|fetch/i.test(message);
}

function normalizeWords(words: TesseractWord[] | undefined): OcrWord[] {
  if (!Array.isArray(words)) {
    return [];
  }
  return words
    .map((word) => {
      const text = (word.text ?? '').trim();
      const x0 = Number(word.bbox?.x0);
      const y0 = Number(word.bbox?.y0);
      const x1 = Number(word.bbox?.x1);
      const y1 = Number(word.bbox?.y1);
      if (!text || !Number.isFinite(x0) || !Number.isFinite(y0) || !Number.isFinite(x1) || !Number.isFinite(y1)) {
        return null;
      }
      return {
        text,
        confidence: typeof word.confidence === 'number' ? Number(word.confidence.toFixed(2)) : null,
        bbox: { x0, y0, x1, y1 },
      } satisfies OcrWord;
    })
    .filter((word): word is OcrWord => word !== null);
}

class TesseractOcrEngine implements OcrEngine {
  constructor(private readonly tesseract: TesseractModule) { }

  private async runRecognize(blob: Blob, language: string): Promise<OcrResult> {
    const result = await this.tesseract.recognize(blob, language);
    return {
      text: result.data?.text ?? '',
      confidence: typeof result.data?.confidence === 'number' ? Number(result.data.confidence.toFixed(2)) : null,
      requestedLanguage: language,
      usedLanguage: language,
      languageFallbackUsed: false,
      words: normalizeWords(result.data?.words),
    };
  }

  async recognize(blob: Blob, options: OcrRecognizeOptions = {}): Promise<OcrResult> {
    if (blob.type === 'application/pdf') {
      throw new OcrPipelineError('OCR_UNSUPPORTED_INPUT', 'OCR engine does not accept PDF blob directly');
    }

    const requestedLanguage = options.language?.trim() || 'eng';
    try {
      const primary = await this.runRecognize(blob, requestedLanguage);
      if (options.detectLanguage) {
        primary.detectedLanguage = detectDocumentLanguage(primary.text);
      }
      return primary;
    } catch (error) {
      if (requestedLanguage !== 'eng' && isLanguagePackError(error)) {
        try {
          const fallback = await this.runRecognize(blob, 'eng');
          if (options.detectLanguage) {
            fallback.detectedLanguage = detectDocumentLanguage(fallback.text);
          }
          return {
            ...fallback,
            requestedLanguage,
            languageFallbackUsed: true,
          };
        } catch {
          throw new OcrPipelineError(
            'OCR_LANGUAGE_PACK_UNAVAILABLE',
            `OCR language pack "${requestedLanguage}" is unavailable`,
          );
        }
      }
      throw new OcrPipelineError(
        'OCR_RECOGNITION_FAILED',
        `OCR failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
}

export async function createOcrEngine(): Promise<OcrEngine> {
  try {
    const mod = (await import('tesseract.js')) as { recognize?: unknown };
    if (typeof mod.recognize !== 'function') {
      return new FallbackOcrEngine();
    }
    return new TesseractOcrEngine(mod as unknown as TesseractModule);
  } catch {
    return new FallbackOcrEngine();
  }
}
