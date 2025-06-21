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

// src/utils/pako-polyfill.ts
/**
 * Полифилл для решения проблемы с импортом pako в pdf-lib
 * 
 * Проблема: pdf-lib ожидает default export от pako, но в ES модулях
 * pako экспортирует только named exports.
 * 
 * Решение: создаем глобальный объект pako с нужными методами
 */

// Динамический импорт pako с правильной обработкой экспортов
export async function initPakoPolyfill() {
  try {
    // Импортируем все экспорты из pako
    const pakoModule = await import('pako');
    
    // Создаем объект со всеми необходимыми методами
    const pako = {
      deflate: pakoModule.deflate,
      inflate: pakoModule.inflate,
      deflateRaw: pakoModule.deflateRaw,
      inflateRaw: pakoModule.inflateRaw,
      gzip: pakoModule.gzip,
      ungzip: pakoModule.ungzip,
      Deflate: pakoModule.Deflate,
      Inflate: pakoModule.Inflate,
      constants: pakoModule.constants,
      // Добавляем остальные экспорты если нужно
    };
    
    // Делаем pako доступным глобально для pdf-lib
    if (typeof window !== 'undefined') {
      (window as any).pako = pako;
    }
    
    return pako;
  } catch (error) {
    console.error('Failed to initialize pako polyfill:', error);
    throw error;
  }
}

// Альтернативный подход - создание прокси для динамического импорта
export function createPakoProxy() {
  return new Proxy({}, {
    get(target, prop) {
      return async (...args: any[]) => {
        const pako = await import('pako');
        const method = pako[prop as keyof typeof pako];
        if (typeof method === 'function') {
          return method(...args);
        }
        return method;
      };
    }
  });
}
