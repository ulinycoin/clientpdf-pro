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


import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';

interface ValidationResult {
  isValid: boolean;
  error?: string;
  pageCount?: number;
  fileSize: number;
  isPasswordProtected?: boolean;
}

interface PDFValidationHook {
  validatePDF: (file: File) => Promise<ValidationResult>;
  isValidating: boolean;
  lastValidation: ValidationResult | null;
}

// Константы
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_PAGES = 500; // Максимальное количество страниц для обработки

export const usePDFValidation = (): PDFValidationHook => {
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);

  const validatePDF = useCallback(async (file: File): Promise<ValidationResult> => {
    setIsValidating(true);
    
    const result: ValidationResult = {
      isValid: false,
      fileSize: file.size
    };

    try {
      // Проверка типа файла
      if (file.type !== 'application/pdf') {
        result.error = 'File is not a PDF document';
        return result;
      }

      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        result.error = `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
        return result;
      }

      // Проверка минимального размера (вероятно поврежденный файл)
      if (file.size < 1024) {
        result.error = 'File appears to be corrupted or empty';
        return result;
      }

      // Читаем файл как ArrayBuffer
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      });

      // Проверяем PDF заголовок
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...uint8Array.slice(0, 5));
      if (header !== '%PDF-') {
        result.error = 'File does not appear to be a valid PDF';
        return result;
      }

      try {
        // Загружаем PDF через pdf-lib
        const pdfDoc = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true, // Попытаемся загрузить даже зашифрованные PDF
        });

        const pageCount = pdfDoc.getPageCount();
        result.pageCount = pageCount;

        // Проверяем количество страниц
        if (pageCount > MAX_PAGES) {
          result.error = `Too many pages. Maximum ${MAX_PAGES} pages supported`;
          return result;
        }

        if (pageCount === 0) {
          result.error = 'PDF contains no pages';
          return result;
        }

        // PDF валиден
        result.isValid = true;

      } catch (pdfError: any) {
        // Проверяем специфичные ошибки PDF
        if (pdfError.message?.includes('password') || pdfError.message?.includes('encrypted')) {
          result.error = 'PDF is password protected and cannot be processed';
          result.isPasswordProtected = true;
        } else if (pdfError.message?.includes('Invalid PDF')) {
          result.error = 'PDF file is corrupted or invalid';
        } else if (pdfError.message?.includes('memory') || pdfError.message?.includes('Memory')) {
          result.error = 'PDF is too complex to process. Try a simpler file.';
        } else {
          result.error = 'Unable to process this PDF file';
        }
      }

    } catch (error: any) {
      console.error('PDF validation error:', error);
      result.error = error.message || 'Unknown error occurred during validation';
    } finally {
      setIsValidating(false);
      setLastValidation(result);
    }

    return result;
  }, []);

  return {
    validatePDF,
    isValidating,
    lastValidation
  };
};

// Хелперы для работы с результатами валидации
export const getValidationMessage = (result: ValidationResult): string => {
  if (result.isValid) {
    return `✅ Valid PDF with ${result.pageCount} page(s) (${(result.fileSize / 1024 / 1024).toFixed(1)} MB)`;
  }
  
  return `❌ ${result.error}`;
};

export const getValidationSeverity = (result: ValidationResult): 'success' | 'warning' | 'error' => {
  if (result.isValid) return 'success';
  if (result.isPasswordProtected) return 'warning';
  return 'error';
};

// Типы для экспорта
export type { ValidationResult, PDFValidationHook };