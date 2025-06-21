/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */


// Константы для ограничений
export const PDF_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_PAGES_SPLIT: 100,
  MAX_FILES_MERGE: 20,
  MAX_IMAGES_CONVERT: 50,
  MIN_FILE_SIZE: 1024, // 1KB
  MAX_PAGES_PREVIEW: 20,
} as const;

// Типы файлов
export const ACCEPTED_FILE_TYPES = {
  PDF: 'application/pdf',
  IMAGES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp'
  ]
} as const;

// Утилиты для работы с файлами
export class PDFUtils {
  /**
   * Проверяет лимиты для операций
   */
  static checkOperationLimits(operation: string, files: File[]): { valid: boolean; message?: string } {
    const pdfFiles = files.filter(file => this.isPDFFile(file));
    const imageFiles = files.filter(file => this.isImageFile(file));

    switch (operation) {
      case 'merge':
        if (pdfFiles.length < 2) {
          return { valid: false, message: 'Need at least 2 PDF files to merge' };
        }
        if (pdfFiles.length > PDF_LIMITS.MAX_FILES_MERGE) {
          return { valid: false, message: `Too many files. Maximum ${PDF_LIMITS.MAX_FILES_MERGE} allowed` };
        }
        break;

      case 'split':
        if (pdfFiles.length === 0) {
          return { valid: false, message: 'Need a PDF file to split' };
        }
        break;

      case 'compress':
        if (pdfFiles.length === 0) {
          return { valid: false, message: 'Need a PDF file to compress' };
        }
        break;

      case 'imageToPdf':
        if (imageFiles.length === 0) {
          return { valid: false, message: 'Need at least 1 image file to convert' };
        }
        if (imageFiles.length > PDF_LIMITS.MAX_IMAGES_CONVERT) {
          return { valid: false, message: `Too many images. Maximum ${PDF_LIMITS.MAX_IMAGES_CONVERT} allowed` };
        }
        break;

      default:
        return { valid: false, message: 'Unknown operation' };
    }

    // Проверяем размеры файлов
    for (const file of files) {
      if (!this.isFileSizeValid(file)) {
        return { 
          valid: false, 
          message: `File "${file.name}" is too large. Maximum size is ${this.formatFileSize(PDF_LIMITS.MAX_FILE_SIZE)}` 
        };
      }
    }

    return { valid: true };
  }

  /**
   * Создает объект ошибки с дополнительной информацией
   */
  static createError(message: string, code?: string, details?: any): Error {
    const error = new Error(message);
    (error as any).code = code;
    (error as any).details = details;
    return error;
  }

  /**
   * Определяет тип ошибки PDF
   */
  static getPDFErrorType(error: Error): 'corrupted' | 'password' | 'memory' | 'size' | 'unknown' {
    const message = error.message.toLowerCase();
    
    if (message.includes('password') || message.includes('encrypted')) {
      return 'password';
    }
    if (message.includes('invalid pdf') || message.includes('corrupted')) {
      return 'corrupted';
    }
    if (message.includes('memory') || message.includes('out of memory')) {
      return 'memory';
    }
    if (message.includes('too large') || message.includes('size')) {
      return 'size';
    }
    
    return 'unknown';
  }

  /**
   * Получает пользовательское сообщение об ошибке
   */
  static getUserFriendlyErrorMessage(error: Error): string {
    const errorType = this.getPDFErrorType(error);
    
    switch (errorType) {
      case 'password':
        return 'This PDF is password protected and cannot be processed. Please remove the password first.';
      case 'corrupted':
        return 'The PDF file appears to be corrupted or invalid. Please try a different file.';
      case 'memory':
        return 'The PDF is too complex to process. Try reducing the file size or number of pages.';
      case 'size':
        return `File is too large. Maximum size allowed is ${this.formatFileSize(PDF_LIMITS.MAX_FILE_SIZE)}.`;
      default:
        return 'An error occurred while processing the PDF. Please try again or use a different file.';
    }
  }

  /**
   * Создает download blob и сохраняет файл
   */
  static downloadFile(data: Uint8Array | Blob, fileName: string, mimeType: string = 'application/pdf'): void {
    try {
      const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
      
      // Проверяем размер результирующего файла
      if (blob.size === 0) {
        throw new Error('Generated file is empty');
      }

      // Создаем безопасное имя файла
      const safeFileName = this.sanitizeFileName(fileName);
      
      // Сохраняем файл
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = safeFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Освобождаем память
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  }

  /**
   * Проверяет поддержку браузера
   */
  static checkBrowserSupport(): { supported: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (typeof FileReader === 'undefined') {
      missing.push('FileReader API');
    }
    if (typeof Blob === 'undefined') {
      missing.push('Blob API');
    }
    if (typeof URL === 'undefined' || typeof URL.createObjectURL === 'undefined') {
      missing.push('URL API');
    }
    if (typeof Worker === 'undefined') {
      missing.push('Web Workers');
    }

    return {
      supported: missing.length === 0,
      missing
    };
  }

  /**
   * Логирует информацию об обработке файла
   */
  static logProcessing(operation: string, files: File[], result?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`PDF Processing: ${operation}`);
      console.log('Files:', files.map(f => ({ name: f.name, size: this.formatFileSize(f.size) })));
      if (result) {
        console.log('Result:', result);
      }
      console.groupEnd();
    }
  }
}

// Константы для экспорта
export const PDF_MIME_TYPE = 'application/pdf';
export const IMAGE_MIME_TYPES = ACCEPTED_FILE_TYPES.IMAGES;

// Типы для TypeScript
export interface ProcessingOptions {
  operation: 'merge' | 'split' | 'compress' | 'imageToPdf';
  settings?: {
    quality?: 'low' | 'medium' | 'high';
    splitType?: 'pages' | 'range';
    startPage?: number;
    endPage?: number;
    removeMetadata?: boolean;
    optimizeImages?: boolean;
  };
}

export interface ProcessingResult {
  success: boolean;
  message: string;
  details?: string;
  outputSize?: number;
  compressionRatio?: number;
  filesCreated?: number;
}

export interface FileValidation {
  file: File;
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

// Утилита для дебага (только в development)
export const DebugUtils = {
  logFileInfo: (file: File) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('File Info:', {
        name: file.name,
        type: file.type,
        size: PDFUtils.formatFileSize(file.size),
        lastModified: new Date(file.lastModified),
      });
    }
  },

  logPerformance: (label: string, startTime: number) => {
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      console.log(`${label}: ${(endTime - startTime).toFixed(2)}ms`);
    }
  },

  measureAsync: async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      try {
        const result = await fn();
        DebugUtils.logPerformance(label, startTime);
        return result;
      } catch (error) {
        DebugUtils.logPerformance(`${label} (failed)`, startTime);
        throw error;
      }
    } else {
      return fn();
    }
  }
};
   * Читает файл как ArrayBuffer
   */
  static readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Читает изображение как Data URL
   */
  static readImageAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error(`Failed to read image: ${file.name}`));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Получает размеры изображения
   */
  static getImageDimensions(dataURL: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataURL;
    });
  }

  /**
   * Форматирует размер файла в читаемый вид
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Проверяет, является ли файл PDF
   */
  static isPDFFile(file: File): boolean {
    return file.type === ACCEPTED_FILE_TYPES.PDF;
  }

  /**
   * Проверяет, является ли файл изображением
   */
  static isImageFile(file: File): boolean {
    return ACCEPTED_FILE_TYPES.IMAGES.includes(file.type as any);
  }

  /**
   * Проверяет размер файла
   */
  static isFileSizeValid(file: File): boolean {
    return file.size >= PDF_LIMITS.MIN_FILE_SIZE && file.size <= PDF_LIMITS.MAX_FILE_SIZE;
  }

  /**
   * Генерирует безопасное имя файла
   */
  static sanitizeFileName(fileName: string): string {
    // Удаляем потенциально опасные символы
    return fileName
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  /**
   * Создает имя для обработанного файла
   */
  static createProcessedFileName(originalName: string, operation: string, suffix?: string): string {
    const baseName = originalName.replace(/\.pdf$/i, '');
    const sanitizedBase = this.sanitizeFileName(baseName);
    
    let processedName = `${sanitizedBase}-${operation}`;
    if (suffix) {
      processedName += `-${suffix}`;
    }
    
    return `${processedName}.pdf`;
  }

  /**
   * Проверяет заголовок PDF файла
   */
  static async validatePDFHeader(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...uint8Array.slice(0, 5));
      return header === '%PDF-';
    } catch {
      return false;
    }
  }

  /**
   * Вычисляет процент сжатия
   */
  static calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  }

  /**
   * Создает превью текст для операции
   */
  static getOperationPreview(operation: string, fileCount: number, settings?: any): string {
    switch (operation) {
      case 'merge':
        return `Merge ${fileCount} PDF files into one document`;
      case 'split':
        return settings?.splitType === 'pages' 
          ? 'Split PDF into individual pages'
          : `Extract pages ${settings?.startPage}-${settings?.endPage}`;
      case 'compress':
        return `Compress PDF with ${settings?.quality || 'medium'} quality`;
      case 'imageToPdf':
        return `Convert ${fileCount} images to PDF`;
      default:
        return 'Process files';
    }
  }

  /**
   * Получает иконку для типа файла
   */
  static getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'webp':
        return '🖼️';
      default:
        return '📄';
    }
  }

  /**
   * Создает уникальный ID для файла
   */
  static generateFileId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**